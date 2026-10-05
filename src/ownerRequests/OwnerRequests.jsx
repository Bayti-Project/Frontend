import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, fetchOwnerInterestRequests, normalizeInterestRequest, resolveMediaUrl, setInterestRequestStatus } from '../services/api';
import { formatNotificationTime } from '../state/notifications';
import defaultAvatar from '../components/default-avatar.svg';
import './OwnerRequests.css';

/* statuses بالـapi (US-18/19): pending | approved | rejected */
const STATUS_LABEL = {
    pending: 'قيد المراجعة',
    approved: 'مقبولة',
    rejected: 'مرفوضة',
};

/* رسائل الـapi بالإنجليزي → عربي، للعرض في الواجهة */
const REQUEST_ERROR_AR = {
    'Authentication credentials were not provided.': 'انتهت الجلسة، يرجى تسجيل الدخول من جديد.',
    'You do not have permission to perform this action.': 'ما إلك صلاحية على هذا الطلب — الإجراء متاح لصاحب العقار فقط.',
    'Status must be approved or rejected.': 'حالة الطلب غير صالحة.',
    'This field is required.': 'حالة الطلب مطلوبة.',
};

function describeRequestError(status, data, { forList = false } = {}) {
    const detail = typeof data?.detail === 'string' ? data.detail : '';
    const fieldMsg = Array.isArray(data?.status) ? data.status[0] : '';
    const raw = fieldMsg || detail;
    if (REQUEST_ERROR_AR[raw]) return REQUEST_ERROR_AR[raw];
    if (status === 401) return 'انتهت الجلسة، يرجى تسجيل الدخول من جديد.';
    if (status === 403) {
        return forList ? 'ما إلك صلاحية — طلبات الاهتمام متاحة للمالك فقط.' : REQUEST_ERROR_AR['You do not have permission to perform this action.'];
    }
    if (status === 400) return raw || 'تعذّر تنفيذ الإجراء، حاول مرة أخرى.';
    if (status === 404) return 'العنصر غير موجود — ربما حُذف من الخادم.';
    return 'خطأ في الخادم، حاول مرة أخرى بعد قليل.';
}

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

/* الـapi بيرجّع { id, tenant, property, owner, status, created_at, updated_at }
   الأسماء/العقار مو مضمّنين — بنجيب عناوين العقارات من /api/properties/mine/ وبنحل
   الـtenant نعرضه كـ"مستأجر #<id>" لأن ما في endpoint عام لمستخدم آخر */
function mapRequest(request, propertyMap) {
    const property = propertyMap[String(request.propertyId)] || {};
    const tenant = request.raw?.tenant;
    const tenantObject = tenant && typeof tenant === 'object' ? tenant : null;
    const tenantName = tenantObject
        ? tenantObject.full_name || tenantObject.name || `مستأجر #${request.tenantId}`
        : request.tenantId
            ? `مستأجر #${request.tenantId}`
            : 'مستأجر';
    const region = property.location
        || property.address
        || [property.neighborhood, property.area, property.governorate].filter(Boolean).join('، ');

    return {
        id: request.id,
        orderNum: `#${String(request.id ?? 0).padStart(4, '0')}`,
        reqCode: `REQ-${request.id}`,
        submittedAt: formatFullDate(request.createdAt),
        requestTime: formatNotificationTime(request.createdAt) || '—',
        status: request.status,
        statusLabel: STATUS_LABEL[request.status] || STATUS_LABEL.pending,
        tenantName,
        tenantAvatar: resolveMediaUrl(tenantObject?.profile_image || tenantObject?.image || '') || defaultAvatar,
        propertyId: request.propertyId,
        propertyTitle: property.title || (request.propertyId ? `عقار #${request.propertyId}` : 'عقار'),
        region: region || '—',
        message: request.raw?.message || 'تم إرسال طلب اهتمام على هذا العقار بدون رسالة مرفقة.',
    };
}

/* أسباب الرفض — بتترسل مع الطلب مثل ما كانت قبل، والـbackend بيقراها
   لما يضيف الحقول (حالياً بيقبل status لحاله وبيتجاهل الباقي) */
const REASON_OPTIONS = [
    'العقار لم يعد متاحاً',
    'الدفوعات غير متوافقة',
    'فترة الإيجار قصيرة',
    'تم تأجير العقار لمستأجر آخر',
    'السعر خارج الميزانية المتاحة',
    'أخرى',
];

const QUICK_REASONS = [
    'العقار لم يعد متاحاً',
    'الدفوعات غير متوافقة',
    'فترة الإيجار قصيرة',
];

const MESSAGE_MAX = 200;

const TABS = [
    { id: 'all', label: 'كل الطلبات' },
    { id: 'rejected', label: 'مرفوضة' },
    { id: 'approved', label: 'مقبولة' },
    { id: 'pending', label: 'قيد المراجعة' },
];

const OwnerRequests = () => {
    const [activeTab, setActiveTab] = useState('all');
    /* US-19 — طلبات عقارات المستخدم الحالي من /api/owner/interest-requests */
    const [requests, setRequests] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [propertyMap, setPropertyMap] = useState({});
    const [savingId, setSavingId] = useState(null);
    const [actionError, setActionError] = useState('');
const [rejectTarget, setRejectTarget] = useState(null);
const [rejectReason, setRejectReason] = useState('');
const [rejectQuick, setRejectQuick] = useState('');
const [rejectMessage, setRejectMessage] = useState('');
const [acceptTarget, setAcceptTarget] = useState(null);

    const loadRequests = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);
        setLoadError('');
        try {
            const res = await fetchOwnerInterestRequests();
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setRequests([]);
                setLoadError(describeRequestError(res.status, data, { forList: true }));
                return;
            }
            const data = await res.json().catch(() => null);
            const list = (Array.isArray(data) ? data : data?.results) || [];
            setRequests(list.map(normalizeInterestRequest).filter(Boolean));

            /* عناوين العقارات من /api/properties/mine/ — استدعاء واحد ونربطه محلياً */
            try {
                const propRes = await apiFetch('/api/properties/mine/');
                if (propRes.ok) {
                    const propData = await propRes.json().catch(() => null);
                    const properties = (Array.isArray(propData) ? propData : propData?.results) || [];
                    setPropertyMap(
                        properties.reduce((acc, property) => {
                            if (property?.id != null) acc[String(property.id)] = property;
                            return acc;
                        }, {})
                    );
                }
            } catch {
                /* ما في مشكلة — بنعرض رقم العقار بدل العنوان */
            }
        } catch (err) {
            setRequests([]);
            setLoadError(err?.message || 'تعذّر تحميل الطلبات، تحقّق من الاتصال وحاول مجدداً.');
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    useEffect(() => {
        if (rejectTarget && !requests.some((r) => r.id === rejectTarget.id)) setRejectTarget(null);
        if (acceptTarget && !requests.some((r) => r.id === acceptTarget.id)) setAcceptTarget(null);
        if (selectedId == null && requests.length > 0) setSelectedId(requests[0].id);
    }, [requests, selectedId, rejectTarget, acceptTarget]);

    useEffect(() => {
        if (!rejectTarget && !acceptTarget) return undefined;
        function onKeyDown(event) {
            if (event.key === 'Escape') {
                setRejectTarget(null);
                setAcceptTarget(null);
            }
        }
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [rejectTarget, acceptTarget]);

    function openReject(request) {
        setRejectTarget(request);
        setActionError('');
        setRejectReason('');
        setRejectQuick('');
        setRejectMessage('');
    }

    function closeReject() {
        if (savingId != null) return;
        setRejectTarget(null);
        setActionError('');
    }

    function openAccept(request) {
        setAcceptTarget(request);
        setActionError('');
    }

    function closeAccept() {
        if (savingId != null) return;
        setAcceptTarget(null);
        setActionError('');
    }

    /* US-18 — PUT /api/interest-request/{id}/status { status: "approved" | "rejected" }
       200 → الطلب اتحدث + إشعار فوري للمستأجر. بنحدّث الصف من رد الـapi، وبعدها
       refetch صامت عشان نضمن مطابقة الخادم.
       السبب والرسالة بنترسلهم مع الرفض (reason + message) — حالياً الـbackend
       بيقبل status لحاله وبيتجاهلهم، ولما يضيف الحقول بيصيروا محفوظين. */
    async function updateStatus(target, status) {
        if (!target || savingId != null) return;
        setSavingId(target.id);
        setActionError('');
        try {
            const extra =
                status === 'rejected'
                    ? { reason: rejectReason || undefined, message: rejectMessage || undefined }
                    : {};
            const res = await setInterestRequestStatus(target.id, status, extra);
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setActionError(describeRequestError(res.status, data));
                return;
            }
            const updated = normalizeInterestRequest(data) || { ...target, status };
            setRequests((prev) =>
                prev.map((r) => (r.id === target.id ? { ...r, status: updated.status, updatedAt: updated.updatedAt || r.updatedAt } : r))
            );
            setRejectTarget(null);
            setAcceptTarget(null);
            loadRequests({ silent: true });
        } catch (err) {
            setActionError(err?.message || 'تعذّر تنفيذ الإجراء، حاول مرة أخرى.');
        } finally {
            setSavingId(null);
        }
    }

    function pickQuickReason(reason) {
        setRejectQuick(reason);
        setRejectReason(reason);
    }

    const counts = useMemo(
        () => ({
            all: requests.length,
            rejected: requests.filter((r) => r.status === 'rejected').length,
            approved: requests.filter((r) => r.status === 'approved').length,
            pending: requests.filter((r) => r.status === 'pending').length,
        }),
        [requests]
    );

    const items = useMemo(() => requests.map((r) => mapRequest(r, propertyMap)), [requests, propertyMap]);

    const filtered = useMemo(() => {
        if (activeTab === 'all') return items;
        return items.filter((r) => r.status === activeTab);
    }, [activeTab, items]);

    const selected = items.find((r) => r.id === selectedId) || filtered[0] || items[0];

    function exportCsv() {
        const header = ['رقم الطلب', 'اسم المستأجر', 'العقار', 'المنطقة', 'تاريخ الطلب', 'الحالة', 'الرسالة'];
        const rows = filtered.map((r) => [
            r.orderNum,
            r.tenantName,
            r.propertyTitle,
            r.region,
            r.requestTime,
            r.statusLabel,
            r.message,
        ]);
        const csv = [header, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\r\n');

        // BOM حتى تفتح إكسل العربية بشكل صحيح
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'طلبات-الاهتمام.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="oreq-page" dir="rtl">
            <main className="oreq-container">

                <header className="oreq-header">
                    <div className="oreq-header-text">
                        <span className="oreq-context">مساحة المالك</span>
                        <h1 className="oreq-title">طلبات الاهتمام</h1>
                        <p className="oreq-subtitle">راجع طلبات المستأجرين واتخذ القرار المناسب</p>
                    </div>

                    <div className="oreq-header-actions">
                        <button className="oreq-export-btn" onClick={() => loadRequests()} disabled={loading} aria-label="تحديث الطلبات">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" />
                                <polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
                                <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            تحديث
                        </button>

                        <button className="oreq-export-btn" onClick={exportCsv} disabled={filtered.length === 0}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            تصدير القائمة
                        </button>
                    </div>
                </header>

                <div className="oreq-tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`oreq-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                            <span className={`oreq-tab-badge ${activeTab === tab.id ? 'blue' : ''}`}>
                                {counts[tab.id]}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="oreq-grid">

                    <div className="oreq-list">
                        {loadError ? (
                            <div className="oreq-empty">
                                <p>{loadError}</p>
                                <button className="oreq-export-btn" onClick={() => loadRequests()} style={{ marginTop: 16 }}>
                                    إعادة المحاولة
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="oreq-empty">
                                <p>جارٍ تحميل الطلبات...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="oreq-empty">
                                <p>{activeTab === 'all' ? 'ما في طلبات اهتمام على عقاراتك حالياً' : 'لا توجد طلبات ضمن هذا التصنيف'}</p>
                            </div>
                        ) : (
                            filtered.map((item) => (
                                <button
                                    key={item.id}
                                    className={`oreq-item ${selectedId === item.id ? 'active' : ''}`}
                                    onClick={() => setSelectedId(item.id)}
                                >
                                    <span className="oreq-item-right">
                                        <img
                                            className="oreq-item-avatar"
                                            src={item.tenantAvatar}
                                            alt={item.tenantName}
                                            onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                                        />
                                        <span className="oreq-item-text">
                                            <span className="oreq-item-name">{item.tenantName}</span>
                                            <span className="oreq-item-sub">{item.propertyTitle}</span>
                                        </span>
                                    </span>

                                    <span className="oreq-item-left">
                                        <span className={`oreq-status ${item.status}`}>
                                            <span className="oreq-status-dot" />
                                            {item.statusLabel}
                                        </span>
                                        <span className="oreq-item-time">{item.requestTime}</span>
                                        <svg className="oreq-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    </span>
                                </button>
                            ))
                        )}
                    </div>

                    {selected && (
                        <aside className="oreq-details">
                            <div className="oreq-details-top">
                                <span className="oreq-order-num">تفاصيل الطلب {selected.orderNum}</span>
                                <span className={`oreq-status ${selected.status}`}>
                                    <span className="oreq-status-dot" />
                                    {selected.statusLabel}
                                </span>
                            </div>

                            <div className="oreq-tenant">
                                <img
                                    className="oreq-tenant-avatar"
                                    src={selected.tenantAvatar}
                                    alt={selected.tenantName}
                                    onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                                />
                                <div className="oreq-tenant-text">
                                    <span className="oreq-tenant-label">مستأجر مهتم</span>
                                    <span className="oreq-tenant-name">{selected.tenantName}</span>
                                </div>
                            </div>

                            <div className="oreq-info-grid">
                                <div className="oreq-info-item">
                                    <span className="oreq-info-label">العقار</span>
                                    <span className="oreq-info-val">{selected.propertyTitle}</span>
                                </div>
                                <div className="oreq-info-item">
                                    <span className="oreq-info-label">تاريخ الطلب</span>
                                    <span className="oreq-info-val">{selected.requestTime}</span>
                                </div>
                                <div className="oreq-info-item">
                                    <span className="oreq-info-label">المنطقة</span>
                                    <span className="oreq-info-val">{selected.region}</span>
                                </div>
                                <div className="oreq-info-item">
                                    <span className="oreq-info-label">الحالة</span>
                                    <span className={`oreq-status ${selected.status}`}>
                                        <span className="oreq-status-dot" />
                                        {selected.statusLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="oreq-message">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <span>{selected.message}</span>
                            </div>

                            <div className="oreq-actions">
                                <button
                                    className="oreq-btn oreq-btn--reject"
                                    onClick={() => openReject(selected)}
                                    disabled={selected.status === 'rejected' || savingId != null}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                    رفض الطلب
                                </button>

                                <button
                                    className="oreq-btn oreq-btn--accept"
                                    onClick={() => openAccept(selected)}
                                    disabled={selected.status === 'approved' || savingId != null}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    قبول الطلب
                                </button>
                            </div>
                        </aside>
                    )}

                </div>

            </main>

            {rejectTarget && (
                <div className="oreq-modal" role="dialog" aria-modal="true" aria-labelledby="oreq-modal-title">
                    <div className="oreq-modal__backdrop" onClick={closeReject} />

                    <div className="oreq-modal__box">
                        <button
                            className="oreq-modal__close"
                            onClick={closeReject}
                            aria-label="إغلاق"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className="oreq-modal__head">
                            <span className="oreq-modal__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </span>
                            <div className="oreq-modal__head-text">
                                <h2 className="oreq-modal__title" id="oreq-modal-title">
                                    رفض طلب الاهتمام؟
                                </h2>
                                <span className="oreq-modal__tag">إجراء حاسم لا يمكن التراجع عنه</span>
                            </div>
                        </div>

                        <p className="oreq-modal__warning">
                            هل أنت متأكد من رغبتك في رفض طلب المستأجر{' '}
                            <strong>{rejectTarget.tenantName}</strong> على (
                            <strong>{rejectTarget.propertyTitle}</strong>)؟ سيتم إشعار المستأجر فوراً
                            بالاعتذار وإتاحة فرصة التقديم له على عقارات أخرى.
                        </p>

                        {actionError && (
                            <p className="oreq-alert" role="alert">
                                {actionError}
                            </p>
                        )}

                        <div className="oreq-field">
                            <label className="oreq-label" htmlFor="oreq-reason">
                                سبب الرفض <span>(اختياري لمساعدة المستأجر)</span>
                            </label>
                            <div className="oreq-select-wrap">
                                <select
                                    id="oreq-reason"
                                    className="oreq-select"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                >
                                    <option value="">حدد سبب الاعتذار من القائمة...</option>
                                    {REASON_OPTIONS.map((reason) => (
                                        <option key={reason} value={reason}>
                                            {reason}
                                        </option>
                                    ))}
                                </select>
                                <svg className="oreq-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>

                        <div className="oreq-quick">
                            <span className="oreq-quick__label">أو اختر سبباً سريعاً</span>
                            <div className="oreq-quick__list">
                                {QUICK_REASONS.map((reason) => (
                                    <button
                                        key={reason}
                                        className={`oreq-pill ${rejectQuick === reason ? 'active' : ''}`}
                                        onClick={() => pickQuickReason(reason)}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="oreq-field">
                            <div className="oreq-label-row">
                                <label className="oreq-label" htmlFor="oreq-note">
                                    رسالة توضيحية للمستأجر <span>(اختياري لتعزيز الشفافية)</span>
                                </label>
                                <span
                                    className={`oreq-counter ${rejectMessage.length >= MESSAGE_MAX ? 'full' : ''}`}
                                >
                                    {rejectMessage.length
                                        ? `${rejectMessage.length} / ${MESSAGE_MAX}`
                                        : `حد أقصى ${MESSAGE_MAX} حرف`}
                                </span>
                            </div>
                            <textarea
                                id="oreq-note"
                                className="oreq-textarea"
                                rows={3}
                                maxLength={MESSAGE_MAX}
                                value={rejectMessage}
                                placeholder="اكتب ملاحظة ودية أو سبباً مخصصاً للمستأجر لمساعدته في عروضه المستقبلية..."
                                onChange={(e) => setRejectMessage(e.target.value)}
                            />
                        </div>

                        <div className="oreq-modal__note">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span>
                                سيصل إشعار فوري ومحترم للمستأجر عبر موقع بيتي.
                            </span>
                        </div>

                        <div className="oreq-modal__actions">
                            <button className="oreq-modal__btn oreq-modal__btn--cancel" onClick={closeReject} disabled={savingId != null}>
                                تراجع
                            </button>
                            <button
                                className="oreq-modal__btn oreq-modal__btn--confirm"
                                onClick={() => updateStatus(rejectTarget, 'rejected')}
                                disabled={savingId != null}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                {savingId != null ? 'جارٍ الرفض...' : 'تاكيد الرفض'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {acceptTarget && (
                <div
                    className="oreq-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="oac-title"
                >
                    <div className="oreq-modal__backdrop" onClick={closeAccept} />

                    <div className="oreq-modal__box oac-box">
                        <button
                            className="oreq-modal__close"
                            onClick={closeAccept}
                            aria-label="إغلاق"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className="oac-head">
                            <span className="oac-icon">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </span>

                            <div className="oac-head-text">
                                <span className="oac-tag">خطوة تأكيد المعاينة</span>
                                <h2 className="oac-title" id="oac-title">
                                    تأكيد قبول طلب الاهتمام؟
                                </h2>
                            </div>
                        </div>

                        <p className="oac-sub">
                            سيؤدي قبول طلب <strong>{acceptTarget.tenantName}</strong> إلى مشاركة أرقام
                            التواصل المباشرة وتفعيل المحادثة المباشرة (
                            <strong>{acceptTarget.propertyTitle}</strong>).
                        </p>

                        <div className="oac-details">
                            <span className="oac-row__label"># معرف الطلب</span>
                            <span className="oac-row__value">
                                <span className="oac-code">{acceptTarget.reqCode}</span>
                            </span>

                            <span className="oac-row__label">اسم المستأجر المهتم:</span>
                            <span className="oac-row__value">
                                <svg className="oac-row__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <span className="oac-name">{acceptTarget.tenantName}</span>
                            </span>

                            <span className="oac-row__label">تاريخ ووقت التقديم:</span>
                            <span className="oac-row__value">
                                <svg className="oac-row__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span className="oac-date">{acceptTarget.submittedAt}</span>
                            </span>
                        </div>

                        {actionError && (
                            <p className="oreq-alert" role="alert">
                                {actionError}
                            </p>
                        )}

                        <div className="oreq-modal__actions">
                            <button
                                className="oreq-modal__btn oac-btn--confirm"
                                onClick={() => updateStatus(acceptTarget, 'approved')}
                                disabled={savingId != null}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {savingId != null ? 'جارٍ القبول...' : 'تاكيد القبول ومشاركة التواصل'}
                            </button>
                            <button
                                className="oreq-modal__btn oreq-modal__btn--cancel"
                                onClick={closeAccept}
                                disabled={savingId != null}
                            >
                                تراجع
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OwnerRequests;
