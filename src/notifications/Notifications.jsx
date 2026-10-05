import { useCallback, useMemo, useState } from 'react';
import {
    FaBell,
    FaEye,
    FaCheck,
    FaTimes,
    FaUser,
    FaCheckCircle,
    FaExclamationTriangle,
    FaSyncAlt,
} from 'react-icons/fa';
import { useNotifications, formatNotificationTime } from '../state/notifications.js';
import './Notifications.css';

const STATUS_META = {
    approved: { label: 'مقبول', icon: FaCheckCircle, tone: 'green' },
    rejected: { label: 'مرفوض', icon: FaExclamationTriangle, tone: 'red' },
    pending: { label: 'جديد', icon: FaExclamationTriangle, tone: 'amber' },
};

const FILTERS = [
    { id: 'all', label: 'جميع الإشعارات', Icon: FaBell },
    { id: 'unread', label: 'غير مقروءة', Icon: FaEye },
    { id: 'approved', label: 'الطلبات المقبولة', Icon: FaCheck },
    { id: 'rejected', label: 'الطلبات المرفوضة', Icon: FaTimes },
    { id: 'pending', label: 'طلبات جديدة', Icon: FaUser },
];

const Notifications = ({ onOpenLink }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const {
        items,
        status,
        error,
        saving,
        isLoading,
        isUnauthorized,
        refresh,
        markRead,
        markAllRead,
    } = useNotifications();

    const isSaving = useCallback(
        (id) => saving.some((s) => String(s) === String(id)),
        [saving]
    );

    const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

    const counts = useMemo(
        () => ({
            all: items.length,
            unread: unreadCount,
            approved: items.filter((n) => n.status === 'approved').length,
            rejected: items.filter((n) => n.status === 'rejected').length,
            pending: items.filter((n) => n.status === 'pending').length,
        }),
        [items, unreadCount]
    );

    const filtered = useMemo(() => {
        if (activeFilter === 'all') return items;
        if (activeFilter === 'unread') return items.filter((n) => !n.read);
        return items.filter((n) => n.status === activeFilter);
    }, [activeFilter, items]);

    /* الضغط على الإشعار: يحدده كمقروء، وبعدين ينقل المستخدم للمقابل */
    const openNotification = (item) => {
        if (!item.read) markRead(item.id);
        if (item.link) onOpenLink?.(item.link);
    };

    return (
        <div className="notif-page" dir="rtl">
            <main className="notif-container">

                <header className="notif-header">
                    <div className="notif-header-text">
                        <h1 className="notif-title">الإشعارات</h1>
                        <p className="notif-subtitle">إدارة وتتبع جميع إشعاراتك في مكان واحد</p>
                    </div>

                    <div className="notif-header-actions">
                        <button
                            className="notif-refresh-btn"
                            onClick={refresh}
                            disabled={status === 'loading'}
                        >
                            <FaSyncAlt />
                            تحديث
                        </button>

                        <button
                            className="mark-all-btn"
                            onClick={markAllRead}
                            disabled={unreadCount === 0}
                        >
                            <FaCheck />
                            تحديد الكل كمقروء
                        </button>
                    </div>
                </header>

                {error && (
                    <div className={`notif-alert ${isUnauthorized ? 'warn' : 'error'}`}>
                        <span>{isUnauthorized ? 'يرجى تسجيل الدخول لعرض إشعاراتك.' : error}</span>
                        {!isUnauthorized && (
                            <button type="button" onClick={refresh}>إعادة المحاولة</button>
                        )}
                    </div>
                )}

                <div className="notif-grid">

                    {isUnauthorized ? (
                        <div className="notif-empty">
                            <div className="notif-empty-icon">
                                <FaBell />
                            </div>
                            <h3>يجب تسجيل الدخول</h3>
                            <p>سجّل الدخول لعرض إشعاراتك.</p>
                        </div>
                    ) : isLoading ? (
                        <div className="notif-empty">
                            <div className="notif-empty-icon">
                                <FaSyncAlt />
                            </div>
                            <h3>جاري تحميل الإشعارات...</h3>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="notif-empty">
                            <div className="notif-empty-icon">
                                <FaBell />
                            </div>
                            <h3>لا توجد إشعارات هنا</h3>
                            <p>تصلك الإشعارات الجديدة تلقائياً عند وصول أي طلب جديد.</p>
                        </div>
                    ) : (
                        <ul className="notif-list">
                            {filtered.map((item) => {
                                const { label, icon: Icon, tone } = STATUS_META[item.status] || STATUS_META.pending;

                                return (
                                    <li key={item.id}>
                                        <button
                                            className={`notif-card ${item.read ? '' : 'unread'}`}
                                            onClick={() => openNotification(item)}
                                            disabled={isSaving(item.id)}
                                        >
                                            <span className={`notif-icon ${tone}`}>
                                                <Icon />
                                            </span>

                                            <span className="notif-card-body">
                                                <span className="notif-card-top">
                                                    <span className="notif-card-title">{item.title}</span>
                                                    <span className={`status-tag ${tone}`}>{label}</span>
                                                </span>
                                                <span className="notif-card-desc">{item.description}</span>
                                            </span>

                                            <span className="notif-time">
                                                {formatNotificationTime(item.createdAt)}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <aside className="notif-filters">
                        <h2 className="filters-title">الفلاتر</h2>
                        <ul className="filters-list">
                            {FILTERS.map((filter) => {
                                const { Icon } = filter;
                                const active = activeFilter === filter.id;

                                return (
                                    <li key={filter.id}>
                                        <button
                                            className={`filter-item ${active ? 'active' : ''}`}
                                            onClick={() => setActiveFilter(filter.id)}
                                            aria-current={active ? 'true' : undefined}
                                        >
                                            <span className="filter-icon">
                                                <Icon />
                                            </span>
                                            <span className="filter-label">{filter.label}</span>
                                            <span className="filter-count">{counts[filter.id]}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                </div>

            </main>
        </div>
    );
};

export default Notifications;
