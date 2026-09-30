import { useCallback, useMemo, useState } from 'react';
import {
    FaBell,
    FaEye,
    FaCheck,
    FaTimes,
    FaUser,
    FaCheckCircle,
    FaExclamationTriangle,
} from 'react-icons/fa';
import { NOTIFICATIONS, useReadNotifications } from '../state/notifications.js';
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
    const { readIds, markAllRead } = useReadNotifications();

    const isUnread = useCallback(
        (item) => item.unread && !readIds.includes(item.id),
        [readIds]
    );

    const counts = useMemo(
        () => ({
            all: NOTIFICATIONS.length,
            unread: NOTIFICATIONS.filter(isUnread).length,
            approved: NOTIFICATIONS.filter((n) => n.status === 'approved').length,
            rejected: NOTIFICATIONS.filter((n) => n.status === 'rejected').length,
            pending: NOTIFICATIONS.filter((n) => n.status === 'pending').length,
        }),
        [isUnread]
    );

    const filtered = useMemo(() => {
        if (activeFilter === 'all') return NOTIFICATIONS;
        if (activeFilter === 'unread') return NOTIFICATIONS.filter(isUnread);
        return NOTIFICATIONS.filter((n) => n.status === activeFilter);
    }, [activeFilter, isUnread]);

    const unreadTotal = counts.unread;

    return (
        <div className="notif-page" dir="rtl">
            <main className="notif-container">

                <header className="notif-header">
                    <div className="notif-header-text">
                        <h1 className="notif-title">الإشعارات</h1>
                        <p className="notif-subtitle">إدارة وتتبع جميع إشعاراتك في مكان واحد</p>
                    </div>

                    <button
                        className="mark-all-btn"
                        onClick={markAllRead}
                        disabled={unreadTotal === 0}
                    >
                        <FaCheck />
                        تحديد الكل كمقروء
                    </button>
                </header>

                <div className="notif-grid">

                    {filtered.length === 0 ? (
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
                                const { label, icon: Icon, tone } = STATUS_META[item.status];
                                const unread = isUnread(item);

                                return (
                                    <li key={item.id}>
                                        <button
                                            className={`notif-card ${unread ? 'unread' : ''}`}
                                            onClick={() => onOpenLink?.(item.link)}
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

                                            <span className="notif-time">{item.time}</span>
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
