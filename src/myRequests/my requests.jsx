import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, fetchTenantInterestRequests, normalizeInterestRequest } from '../services/api';
import { formatNotificationTime } from '../state/notifications';
import './my requests.css';

/* Sprint 4 — US-19 من جهة المستأجر: GET /api/tenant/interest-requests
   بيرجع طلبات المستخدم الحالي فقط (الأحدث أولاً) مع request_code بالرد */

const STATUS_LABEL = {
    pending: 'قيد المراجعة',
    approved: 'مقبولة',
    rejected: 'مرفوضة',
};

/* slugs أسباب الرفض → تسميات عربية للعرض (مطابق لأسباب مالك العقار) */
const REJECT_LABELS = {
    property_unavailable: 'العقار لم يعد متاحاً',
    payment_terms_not_compatible: 'شروط الدفع غير متوافقة',
    rental_period_too_short: 'فترة الإيجار أقصر من المطلوب',
};

const TABS = [
    { id: 'all', label: 'كل الطلبات' },
    { id: 'rejected', label: 'مرفوضة' },
    { id: 'approved', label: 'مقبولة' },
    { id: 'pending', label: 'قيد المراجعة' },
];

const dateTimeFormatter = new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

function formatFullDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : dateTimeFormatter.format(date);
}

const MyRequests = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedId, setSelectedId] = useState(null);
    const [requests, setRequests] = useState([]);
    const [propertyMap, setPropertyMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadRequests = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);
        setError('');
        try {
            const res = await fetchTenantInterestRequests();
            if (res.status === 401) {
                setRequests([]);
                setError('انتهت الجلسة، يرجى تسجيل الدخول من جديد.');
                return;
            }
            if (res.status === 404) {
                setRequests([]);
                setError('خدمة طلباتي غير متاحة بالخادم حتى الآن — تأكد من نشر تحديثات الخلفية (Sprint 4).');
                return;
            }
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                const msg =
                    (typeof data?.detail === 'string' && data.detail) ||
                    (Array.isArray(data?.status) && data.status[0]) ||
                    '';
                setRequests([]);
                setError(msg || `تعذّر تحميل طلباتك (رمز الخطأ ${res.status})، حاول مرة أخرى.`);
                return;
            }
            const data = await res.json().catch(() => null);
            const list = (Array.isArray(data) ? data : data?.results) || [];
            const normalized = list.map(normalizeInterestRequest).filter(Boolean);
            setRequests(normalized);

            /* عنوان العقار مش مضمّن بالرد (property بس id) — بنجيب التفاصيل
               للعقارات المعروضة (بشكل محدود) ونربطها محلياً */
            const propertyIds = [...new Set(normalized.map((r) => r.propertyId).filter((id) => id != null))].slice(0, 20);
            const map = {};
            await Promise.all(
                propertyIds.map(async (id) => {
                    try {
                        const propRes = await apiFetch(`/api/properties/${id}/`);
                        if (propRes.ok) {
                            const prop = await propRes.json().catch(() => null);
                            if (prop) map[String(id)] = prop;
                        }
                    } catch {
                        /* عقار #id بدل العنوان لو ما رجع */
                    }
                })
            );
            setPropertyMap(map);
        } catch (err) {
            setRequests([]);
            setError(err?.message || 'تعذّر تحميل طلباتك، تحقّق من الاتصال وحاول مجدداً.');
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(loadRequests, 0);
        return () => clearTimeout(timer);
    }, [loadRequests]);

    const items = useMemo(
        () =>
            requests.map((request) => {
                const property = propertyMap[String(request.propertyId)] || {};
                const region =
                    property.location ||
                    property.address ||
                    [property.neighborhood, property.area, property.governorate].filter(Boolean).join('، ');
                return {
                    id: request.id,
                    requestCode: request.requestCode || `REQ-${request.id}`,
                    status: request.status,
                    statusLabel: STATUS_LABEL[request.status] || STATUS_LABEL.pending,
                    propertyTitle: property.title || (request.propertyId ? `عقار #${request.propertyId}` : 'عقار'),
                    region: region || '—',
                    date: formatFullDate(request.createdAt),
                    time: formatNotificationTime(request.createdAt) || '—',
                    rejectionReasonLabel:
                        (request.rejectionReason && REJECT_LABELS[request.rejectionReason]) || request.rejectionReason || '',
                    rejectionNote: request.rejectionNote || '',
                };
            }),
        [requests, propertyMap]
    );

    const counts = useMemo(
        () => ({
            all: items.length,
            rejected: items.filter((r) => r.status === 'rejected').length,
            approved: items.filter((r) => r.status === 'approved').length,
            pending: items.filter((r) => r.status === 'pending').length,
        }),
        [items]
    );

    const filtered = useMemo(() => {
        if (activeTab === 'all') return items;
        return items.filter((r) => r.status === activeTab);
    }, [activeTab, items]);

    const selected = filtered.find((r) => r.id === selectedId) || filtered[0] || null;

    return (
        <div className="page-layout" dir="rtl">
            <main className="main-container">
                <div className="page-header">
                    <span className="sub-title">متابعة التواصل</span>
                    <h1 className="main-title">طلباتي</h1>
                    <p className="header-desc">تابع حالة طلبات التواصل مع المالكيين</p>
                </div>

                {/* التبويبات الفلاتر (Tabs) */}
                <div className="tabs-bar">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}{' '}
                            <span className={`tab-badge ${tab.id === 'all' ? 'blue' : 'gray'}`}>{counts[tab.id]}</span>
                        </button>
                    ))}
                </div>

                <div className="requests-grid">
                    {error ? (
                        <div className="request-details-card">
                            <p className="requests-error">{error}</p>
                            <button type="button" className="requests-retry" onClick={() => loadRequests()}>
                                إعادة المحاولة
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="request-details-card">
                            <p className="requests-error">جاري تحميل طلباتك...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="request-details-card">
                            <p className="requests-error">لا توجد طلبات اهتمام حتى الآن.</p>
                        </div>
                    ) : (
                        <>
                            {/* قائمة الطلبات */}
                            <div className="requests-list">
                                {filtered.length === 0 && (
                                    <p className="requests-error">لا توجد طلبات في هذا التبويب.</p>
                                )}
                                {filtered.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`request-item ${selected?.id === item.id ? 'active' : ''}`}
                                        onClick={() => setSelectedId(item.id)}
                                    >
                                        <div className="item-right">
                                            <span className="item-code">{item.requestCode}</span>
                                            <div className="item-details">
                                                <h4 className="item-title">{item.propertyTitle}</h4>
                                                <span className="item-location">{item.region}</span>
                                            </div>
                                        </div>

                                        <div className="item-left">
                                            <span className={`status-pill ${item.status}`}>• {item.statusLabel}</span>
                                            <span className="item-time">{item.time}</span>
                                            <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="15 18 9 12 15 6" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* تفاصيل الطلب المحدد */}
                            {selected && (
                                <div className="request-details-card">
                                    <div className="card-top-bar">
                                        <span className="order-number">تفاصيل الطلب {selected.requestCode}</span>
                                        <span className={`status-pill ${selected.status}`}>• {selected.statusLabel}</span>
                                    </div>

                                    <div className="owner-info">
                                        <div className="owner-text">
                                            <span className="owner-label">معرّف الطلب</span>
                                            <h4 className="owner-name" style={{ margin: 0 }} dir="ltr">
                                                {selected.requestCode}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">العقار</span>
                                            <span className="info-val">{selected.propertyTitle}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">تاريخ الطلب</span>
                                            <span className="info-val">{selected.date}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">المنطقة</span>
                                            <span className="info-val">{selected.region}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">الحالة</span>
                                            <span className={`status-pill-small ${selected.status}`}>
                                                • {selected.statusLabel}
                                            </span>
                                        </div>
                                        {selected.rejectionReasonLabel && (
                                            <div className="info-item">
                                                <span className="info-label">سبب الرفض</span>
                                                <span className="info-val">{selected.rejectionReasonLabel}</span>
                                            </div>
                                        )}
                                        {selected.rejectionNote && (
                                            <div className="info-item">
                                                <span className="info-label">ملاحظة الرفض</span>
                                                <span className="info-val">{selected.rejectionNote}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyRequests;