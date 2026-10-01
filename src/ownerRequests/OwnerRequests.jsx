import { useEffect, useMemo, useState } from 'react';
import './OwnerRequests.css';

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

const REQUESTS = [
    {
        id: 1,
        orderNum: '#0001',
        reqCode: 'REQ-88219',
        submittedAt: '15 أكتوبر 2025 • 09:12 مساءً',
        tenantName: 'أحمد محمد',
        tenantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        propertyTitle: 'شقة في الشمس وإطلالة مفتوحة',
        region: 'الرمال، غزة',
        requestTime: 'منذ ساعتين',
        status: 'pending',
        statusLabel: 'قيد المراجعة',
        message: 'مرحباً، أنا مهتم بهذا العقار وأرغب في معرفة المزيد من التفاصيل وموعد مناسب للمعاينة.',
    },
    {
        id: 2,
        orderNum: '#0002',
        reqCode: 'REQ-88204',
        submittedAt: '14 أكتوبر 2025 • 06:42 مساءً',
        tenantName: 'سارة خالد',
        tenantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        propertyTitle: 'بيت عائلي هادئ قرب البحر',
        region: 'النصر، غزة',
        requestTime: 'أمس، 06:42 م',
        status: 'approved',
        statusLabel: 'مقبول',
        message: 'مرحباً، أود معرفة التفاصيل المتاحة لشروط العقد والتأمين، وهل السعر قابل للتفاوض؟',
    },
    {
        id: 3,
        orderNum: '#0003',
        reqCode: 'REQ-88176',
        submittedAt: '12 سبتمبر 2025 • 11:20 صباحاً',
        tenantName: 'خالد منصور',
        tenantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
        propertyTitle: 'دوبلكس مفروش',
        region: 'الرمال، غزة',
        requestTime: '12 سبتمبر 2024',
        status: 'rejected',
        statusLabel: 'مرفوض',
        message: 'السلام عليكم، هل الشقة مفروشة بالكامل؟ وهل السعر يشمل عداد الكهرباء؟',
    },
    {
        id: 4,
        orderNum: '#0004',
        reqCode: 'REQ-88155',
        submittedAt: '10 سبتمبر 2025 • 04:05 مساءً',
        tenantName: 'ليلى خليل',
        tenantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        propertyTitle: 'دوبلكس مشمس للعائلات الصغيرة',
        region: 'الشيخ رضوان، غزة',
        requestTime: '10 سبتمبر 2024',
        status: 'pending',
        statusLabel: 'قيد المراجعة',
        message: 'أهلاً، أنا مستأجر جاد وأبحث عن سكن قريب من المدرسة، ممكن معاينة نهاية الأسبوع؟',
    },
];

const TABS = [
    { id: 'all', label: 'كل الطلبات' },
    { id: 'rejected', label: 'مرفوضة' },
    { id: 'approved', label: 'مقبولة' },
    { id: 'pending', label: 'قيد المراجعة' },
];

const OwnerRequests = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [requests, setRequests] = useState(REQUESTS);
    const [selectedId, setSelectedId] = useState(REQUESTS[0].id);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectQuick, setRejectQuick] = useState('');
    const [rejectMessage, setRejectMessage] = useState('');
    const [acceptTarget, setAcceptTarget] = useState(null);

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
        setRejectReason('');
        setRejectQuick('');
        setRejectMessage('');
    }

    function closeReject() {
        setRejectTarget(null);
    }

    function openAccept(request) {
        setAcceptTarget(request);
    }

    function closeAccept() {
        setAcceptTarget(null);
    }

    function confirmAccept() {
        if (!acceptTarget) return;
        setRequests((prev) =>
            prev.map((r) =>
                r.id === acceptTarget.id ? { ...r, status: 'approved', statusLabel: 'مقبول' } : r
            )
        );
        closeAccept();
    }

    function confirmReject() {
        if (!rejectTarget) return;
        setRequests((prev) =>
            prev.map((r) =>
                r.id === rejectTarget.id ? { ...r, status: 'rejected', statusLabel: 'مرفوض' } : r
            )
        );
        closeReject();
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

    const filtered = useMemo(() => {
        if (activeTab === 'all') return requests;
        return requests.filter((r) => r.status === activeTab);
    }, [activeTab, requests]);

    const selected = requests.find((r) => r.id === selectedId) || requests[0];

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

                    <button className="oreq-export-btn" onClick={exportCsv}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        تصدير القائمة
                    </button>
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
                        {filtered.length === 0 ? (
                            <div className="oreq-empty">
                                <p>لا توجد طلبات ضمن هذا التصنيف</p>
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
                                    disabled={selected.status === 'rejected'}
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
                                    disabled={selected.status === 'approved'}
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
                            <button className="oreq-modal__btn oreq-modal__btn--cancel" onClick={closeReject}>
                                تراجع
                            </button>
                            <button
                                className="oreq-modal__btn oreq-modal__btn--confirm"
                                onClick={confirmReject}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                تاكيد الرفض
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
                                <span className="oac-dot" title="متصل الآن" />
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

                        <div className="oreq-modal__actions">
                            <button
                                className="oreq-modal__btn oac-btn--confirm"
                                onClick={confirmAccept}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                تاكيد القبول ومشاركة التواصل
                            </button>
                            <button
                                className="oreq-modal__btn oreq-modal__btn--cancel"
                                onClick={closeAccept}
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
