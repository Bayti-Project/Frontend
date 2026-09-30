import { useEffect, useState } from "react";

export const NOTIFICATIONS = [
  {
    id: 1,
    status: "approved",
    unread: false,
    title: "تم الموافقة على طلبك",
    description: "يمكنك الآن التواصل مع المالك ومناقشة تفاصيل العقار",
    time: "منذ ساعة",
    link: "/my-requests",
  },
  {
    id: 2,
    status: "rejected",
    unread: false,
    title: "تم رفض طلب الاهتمام",
    description: "تم رفض طلب الاهتمام الخاص بك على عقار في حي النرجس",
    time: "أمس",
    link: "/my-requests",
  },
  {
    id: 3,
    status: "pending",
    unread: false,
    title: "طلب اهتمام جديد",
    description: "أرسل مستأجر محتمل طلب اهتمام على وحدتك في الرمال",
    time: "منذ 3 أيام",
    link: "/home-owner",
  },
  {
    id: 4,
    status: "approved",
    unread: false,
    title: "تم الموافقة على طلب المعاينة",
    description: "تم قبول طلبك لمعاينة شقة في النصر، تواصل مع المالك لتحديد الموعد",
    time: "منذ 4 أيام",
    link: "/my-requests",
  },
  {
    id: 5,
    status: "rejected",
    unread: false,
    title: "تم رفض طلب المعاينة",
    description: "تم رفض طلب معاينة دوبلكس في الشيخ رضوان، العقار محجوز حالياً",
    time: "منذ 5 أيام",
    link: "/my-requests",
  },
  {
    id: 6,
    status: "pending",
    unread: false,
    title: "طلب اهتمام جديد على وحدتك",
    description: "مستأجر مهتم ببيت في النصر وطلب معاينة خلال هذا الأسبوع",
    time: "منذ أسبوع",
    link: "/home-owner",
  },
];

const STORAGE_KEY = "bayti_read_notifications";
const CHANGE_EVENT = "bayti:notifications-change";

function readReadIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistReadIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* تجاهل تعذر الحفظ */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useReadNotifications() {
  const [readIds, setReadIds] = useState(readReadIds);

  useEffect(() => {
    const sync = () => setReadIds(readReadIds());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function markRead(id) {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      persistReadIds(next);
      return next;
    });
  }

  function markAllRead() {
    setReadIds((prev) => {
      const allIds = NOTIFICATIONS.map((n) => n.id);
      if (allIds.every((id) => prev.includes(id))) return prev;
      const next = [...new Set([...prev, ...allIds])];
      persistReadIds(next);
      return next;
    });
  }

  return { readIds, markRead, markAllRead };
}

export function useUnreadNotificationsCount() {
  const { readIds } = useReadNotifications();
  return NOTIFICATIONS.filter((n) => n.unread && !readIds.includes(n.id)).length;
}
