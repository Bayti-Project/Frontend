import { NotificationsPage } from "../OwnerNotification/OwnerNotification";

/* ---------- صفحة إشعارات المستأجر ----------
   نفس مكوّن الإشعارات، لكن بنسخة المستأجر:
   فلاتر كاملة (مقبولة / مرفوضة / جديدة) + نص "لا توجد إشعارات" تبع المستأجر.
   الإشعارات من الـAPI (US-22) */
export default function TenantNotification({ onBrowse }) {
  return <NotificationsPage variant="user" onBrowse={onBrowse} />;
}