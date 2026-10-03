import React, { useMemo, useState } from "react";
import "./NotificationsPage.css";

/* ---------- البيانات (تجريبية) ---------- */
// type: accepted | rejected | new | interest
const initialNotifications = [
  {
    id: 1,
    type: "accepted",
    title: "تمت الموافقة على طلبك",
    text: "يمكنك الآن التواصل مع المالك ومناقشة تفاصيل العقار",
    time: "منذ ساعة",
    read: false,
  },
  {
    id: 2,
    type: "rejected",
    title: "تم رفض طلبك",
    text: "تم رفض طلب الاهتمام الخاص بك على عقار في حي النرجس",
    time: "أمس",
    read: false,
  },
  {
    id: 3,
    type: "accepted",
    title: "تمت الموافقة على طلبك",
    text: "وافق المالك على طلبك، يمكنك الآن التواصل معه لترتيب موعد المعاينة",
    time: "منذ 3 أيام",
    read: true,
  },
];

// إشعارات المالك: طلبات اهتمام جديدة
const ownerNotifications = [
  {
    id: 101,
    type: "interest",
    title: "طلب اهتمام جديد",
    text: "تلقيت طلب اهتمام جديد لأحد عقاراتك من أحمد محمد",
    time: "منذ 5 دقائق",
    read: false,
  },
  {
    id: 102,
    type: "interest",
    title: "طلب اهتمام جديد",
    text: "تلقيت طلب اهتمام جديد لعقارك في الرياض، حي الملقا",
    time: "منذ يومين",
    read: false,
  },
];
// الفلاتر المتاحة للمالك
const ownerFilterKeys = ["all", "unread", "new"];

const typeMeta = {
  accepted: { badge: "مقبول", badgeClass: "np-badge--success", iconClass: "np-item-icon--success" },
  rejected: { badge: "مرفوض", badgeClass: "np-badge--danger", iconClass: "np-item-icon--warning" },
  interest: { badge: "اهتمام", badgeClass: "np-badge--info", iconClass: "np-item-icon--info" },
  new: { badge: "جديد", badgeClass: "np-badge--info", iconClass: "np-item-icon--info" },
};

/* ---------- أيقونات ---------- */
function BellIcon({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function CheckIcon({ size = 22, stroke = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function UserCogIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 20c0-3.6 3.1-6 7-6 1 0 1.9.1 2.7.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="17.5" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M18 13.8v.9M18 20.3v.9M21.2 15.6l-.8.5M15.6 19l-.8.5M21.2 19.4l-.8-.5M15.6 16l-.8-.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function UserSolidIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4 20.5c0-3.9 3.6-6.5 8-6.5s8 2.6 8 6.5c0 .8-.6 1.5-1.5 1.5h-13c-.9 0-1.5-.7-1.5-1.5Z" />
    </svg>
  );
}
function AlertCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5v5.5M12 16.2v.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ItemIcon({ type }) {
  if (type === "accepted") return <CheckIcon />;
  if (type === "rejected") return <AlertCircleIcon />;
  if (type === "interest") return <UserSolidIcon />;
  return <UserCogIcon />;
}

/* ---------- الفلاتر ---------- */
const filters = [
  { key: "all", label: "جميع الإشعارات", Icon: BellIcon, match: () => true, fixedCount: 6 },
  { key: "unread", label: "غير مقروءة", Icon: EyeIcon, match: (n) => !n.read, noCount: true },
  { key: "accepted", label: "الطلبات المقبولة", Icon: () => <CheckIcon size={22} stroke={1.5} />, match: (n) => n.type === "accepted" },
  { key: "rejected", label: "الطلبات المرفوضة", Icon: CloseIcon, match: (n) => n.type === "rejected", fixedCount: 2 },
  { key: "new", label: "طلبات جديدة", Icon: UserCogIcon, match: (n) => n.type === "new" || n.type === "interest", fixedCount: 2 },
];

// صفحة الإشعارات (حسب تصميم الفيجما)
// empty = يبدأ بدون أي إشعارات (حالة "لا توجد إشعارات حالياً")
// onBrowse = ما يحدث عند الضغط على زر "تصفح كافة العقارات"
// variant = "user" (الباحث عن عقار) أو "owner" (مالك العقار: فلاتر أقل ونص مختلف)
export default function NotificationsPage({ empty = false, variant = "user", onBrowse }) {
  const isOwner = variant === "owner";
  const availableFilters = isOwner ? filters.filter((f) => ownerFilterKeys.includes(f.key)) : filters;
  const [items, setItems] = useState(
    empty ? [] : isOwner ? ownerNotifications : initialNotifications
  );
  const [active, setActive] = useState("all");

  const activeFilter = filters.find((f) => f.key === active);
  const visible = useMemo(() => items.filter(activeFilter.match), [items, activeFilter]);
  const hasUnread = items.some((n) => !n.read);
  const isEmptyAll = items.length === 0;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOneRead = (id) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <main className="np-page">
      <div className="np-shell">
        {/* ---------- الفلاتر (يمين) ---------- */}
        <aside className="np-filters" aria-label="فلاتر الإشعارات">
          <h2 className="np-filters-title">الفلاتر</h2>
          <ul className="np-filters-list">
            {availableFilters.map(({ key, label, Icon, match, noCount, fixedCount }) => {
              const count = !isOwner && !isEmptyAll && fixedCount !== undefined ? fixedCount : items.filter(match).length;
              const isActive = key === active;
              return (
                <li key={key}>
                  <button
                    type="button"
                    className={`np-filter${isActive ? " is-active" : ""}`}
                    aria-pressed={isActive}
                    onClick={() => setActive(key)}
                  >
                    <span className="np-filter-icon">
                      <Icon />
                    </span>
                    <span className="np-filter-label">{label}</span>
                    {!noCount && (!isEmptyAll || key === "all") && (
                      <span className="np-filter-count">{count}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ---------- القائمة (يسار) ---------- */}
        <section className="np-main">
          <div className="np-head">
            <div className="np-head-text">
              <h1>الإشعارات</h1>
              <p>إدارة وتتبع جميع إشعاراتك في مكان واحد</p>
            </div>
            <button type="button" className="np-markall" onClick={markAllRead} disabled={!hasUnread}>
              <CheckIcon size={16} stroke={1.6} />
              <span>تحديد الكل كمقروء</span>
            </button>
          </div>

          {isEmptyAll ? (
            <div className="np-empty-state">
              <span className="np-empty-icon">
                <BellIcon size={22} />
              </span>
              <h2>لا توجد إشعارات حالياً</h2>
              <p>
                {isOwner
                  ? "ستظهر هنا كافة التحديثات المتعلقة بطلبات الاهتمام التي يرسلونها وجميع الاشعارات تخص العقارات"
                  : "ستظهر هنا كافة التحديثات المتعلقة بطلبات الاهتمام التي تقدمها، وجميع الاشعارات تخص العقارات"}
              </p>
              <button type="button" className="np-empty-btn" onClick={onBrowse}>
                تصفح كافة العقارات
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="np-empty">لا توجد إشعارات في هذا القسم</div>
          ) : (
            <ul className="np-list">
              {visible.map((n) => {
                const meta = typeMeta[n.type];
                return (
                  <li key={n.id}>
                    <article
                      className={`np-item${n.read ? "" : " is-unread"}`}
                      onClick={() => markOneRead(n.id)}
                    >
                      <span className={`np-item-icon ${meta.iconClass}`}>
                        <ItemIcon type={n.type} />
                      </span>

                      <div className="np-item-body">
                        <div className="np-item-title-row">
                          <h3>{n.title}</h3>
                          <span className={`np-badge ${meta.badgeClass}`}>{meta.badge}</span>
                        </div>
                        <p>{n.text}</p>
                      </div>

                      <time className="np-item-time">{n.time}</time>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
