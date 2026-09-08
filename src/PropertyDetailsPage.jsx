import React, { useState } from "react";
import detailsKitchen from "./assets/listings/details-kitchen.png";
import detailsBedroom from "./assets/listings/details-bedroom.png";
import detailsLivingRoom from "./assets/listings/details-living-room.png";
import detailsMarinaSunset from "./assets/listings/details-marina-sunset.png";
import detailsBathroom from "./assets/listings/details-bathroom.png";
import villaExterior from "./assets/listings/villa-exterior.png";
import agentAhmed from "./assets/listings/agent-ahmed.png";
import deleteModalProperty from "./assets/listings/delete-modal-property.png";

/* ---------- Icons (same inline-SVG convention as OwnerHome.jsx) ---------- */
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
      <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
      <path d="M3 19v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 19v2M21 19v2M3 12V6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="12" y="8" width="8" height="4" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
      <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 12V6a2 2 0 0 1 3.6-1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function AreaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
      <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="9.5" r="1.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="m4 17 5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <path d="M4 9.2A5.2 5.2 0 0 1 9.2 4h5.6A5.2 5.2 0 0 1 20 9.2v3.6a5.2 5.2 0 0 1-5.2 5.2h-1.3l-2.9 2.7c-.5.5-1.4.1-1.4-.6v-2.2a5.2 5.2 0 0 1-5.2-5.1V9.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="12" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
      <path d="M12 3a9 9 0 0 0-7.6 13.8L3 21l4.3-1.4A9 9 0 1 0 12 3Z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9.4 8.6c.2-.4.5-.5.7-.5h.5c.2 0 .4 0 .6.5.2.5.6 1.4.7 1.6.1.2 0 .3-.1.5-.2.2-.3.3-.5.5-.2.2-.3.3-.1.6.2.3.7 1.1 1.5 1.8.9.8 1.7 1.1 2 1.2.3.1.4.1.6-.1.2-.2.6-.7.8-.9.2-.2.3-.2.6-.1.3.1 1.6.7 1.9.8.3.1.4.2.5.3.1.2.1.7-.1 1.3-.2.6-1.3 1.1-1.8 1.2-.5.1-1 .1-3.3-.7-2.6-1-4.1-3.3-4.3-3.5-.2-.2-1.3-1.7-1.3-3.2 0-1.5.7-2.2 1-2.5Z" fill="#fff" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M12 9v4m0 4h.01M10.3 3.9 2.6 17a1.8 1.8 0 0 0 1.5 2.7h15.8A1.8 1.8 0 0 0 21.4 17L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z" stroke="#E5484D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIconLarge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
      <path d="m6 12.5 4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ParkingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 16V8h3a2.5 2.5 0 0 1 0 5h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GymIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M2 12h2M20 12h2M6 8v8M18 8v8M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
      <rect x="17.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M4 9a13 13 0 0 1 16 0M7 12.5a8.5 8.5 0 0 1 10 0M10.3 16a4 4 0 0 1 3.4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1.1" fill="currentColor" />
    </svg>
  );
}
function PoolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M2 17c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 12c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <path d="M9 4v5M9 4l3 2-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ACIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M12 2v20M4.5 6 19.5 18M19.5 6 4.5 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
      <path d="M9 10.5V8a3 3 0 1 1 6 0v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="6.5" y="10.5" width="10" height="8.5" rx="2.2" fill="currentColor" />
      <circle cx="16.5" cy="16.5" r="4.5" fill="#fff" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="16.5" cy="15.2" r="1.15" fill="currentColor" />
      <path d="M14.3 18.3c.4-1 1.2-1.6 2.2-1.6s1.8.6 2.2 1.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function StatusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
      <path d="M4 21V4l2-1 5 2 5-2 4 1.5v11L15 17l-5-2-6 2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Data for this listing + the "delete" preview shown in the modal ---------- */
const property = {
  title: "شقة فاخرة بغزة",
  location: "برج الظافر، السرايا، غزة",
  status: "متاح",
  type: "شقة",
  price: "1,250,000",
  area: "2,450 قدم مربع",
  bathrooms: "2.5",
  bedrooms: "3 سرير",
  agent: "احمد رمضان",
  description:
    "شقة سكنية راقية تتميز بتصميم عصري وتشطيبات سوبر ديلوكس. تقع في منطقة هادئة وراقية بالقرب من\nجميع الخدمات الأساسية. الشقة تحتوي على صالة جلوس واسعة مع نوافذ كبيرة تسمح بدخول الضوء الطبيعي،\nومطبخ مجهز بالكامل بأحدث الأجهزة. الغرف واسعة وتحتوي على خزائن حائط. العمارة مزودة بكاميرات مراقبة\nوحراسة على مدار الساعة.",
};

const deleteTarget = {
  id: 8472,
  title: "شقة في حي النصر",
  price: 70000,
  image: deleteModalProperty,
};

const amenities = [
  { label: "مواقف مغطاة", icon: <ParkingIcon /> },
  { label: "صالة الألعاب الرياضية الحديثة", icon: <GymIcon /> },
  { label: "بركة إنفينيتي", icon: <PoolIcon /> },
  { label: "واي فاي عالي السرعة", icon: <WifiIcon /> },
  { label: "المركزية AC", icon: <ACIcon /> },
  { label: "24/7 الأمان", icon: <ShieldIcon /> },
];

const statusOptions = [
  { id: "available", label: "متاح للايجار", color: "green" },
  { id: "reserved", label: "محجوز", color: "yellow" },
  { id: "rented", label: "مؤجر", color: "red" },
];

export default function PropertyDetailsPage() {
  const [showDescMore, setShowDescMore] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showStatusSuccess, setShowStatusSuccess] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("rented");

  const confirmDelete = () => {
    setShowDeleteModal(false);
    setShowDeleteSuccess(true);
  };

  const confirmStatus = () => {
    setShowStatusModal(false);
    setShowStatusSuccess(true);
  };

  const updatedStatusLabel = statusOptions.find((s) => s.id === selectedStatus)?.label ?? "";

  // زوار غير مسجّلين يحتاجون تسجيل الدخول أولاً قبل التفاعل مع العقار
  const requireLogin = () => setShowLoginModal(true);

  return (
    <div className="details-page">
      <div className="details-page-inner">
        <div className="details-title-row">
          <h1 className="details-title">التفاصيل</h1>
          <div className="details-title-actions">
            <button
              type="button"
              className="listing-action-btn delete"
              aria-label="حذف الإعلان"
              title="حذف الإعلان"
              onClick={() => setShowDeleteModal(true)}
            >
              <TrashIcon />
            </button>
            <button
              type="button"
              className="listing-action-btn edit"
              aria-label="تعديل العقار"
              title="تعديل العقار"
              onClick={() => setShowPermissionModal(true)}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="listing-action-btn status"
              aria-label="تغيير حالة العقار"
              title="تغيير حالة العقار"
              onClick={() => setShowStatusModal(true)}
            >
              <StatusIcon />
            </button>
          </div>
        </div>

        {/* ---------- Gallery ---------- */}
        <div className="details-gallery">
          <div className="details-gallery-item pos-a">
            <img src={detailsKitchen} alt="المطبخ" />
          </div>
          <div className="details-gallery-item pos-b">
            <img src={detailsBedroom} alt="غرفة النوم الرئيسية" />
          </div>
          <div className="details-gallery-item large pos-c">
            <img src={detailsLivingRoom} alt="صالة بإطلالة بحرية" />
          </div>
          <div className="details-gallery-item pos-d">
            <img src={detailsMarinaSunset} alt="إطلالة المارينا عند الغروب - عرض المزيد من الصور" />
            <button type="button" className="details-gallery-more-hit" aria-label="عرض المزيد من الصور" />
          </div>
          <div className="details-gallery-item pos-e">
            <img src={detailsBathroom} alt="الحمام" />
          </div>
        </div>

        <div className="details-grid">
          {/* ---------- Sidebar: agent card ---------- */}
          <aside className="details-sidebar">
            <div className="details-agent">
              <div className="avatar details-agent-avatar">
                <img src={agentAhmed} alt={property.agent} />
              </div>
              <div>
                <p className="details-agent-name">{property.agent}</p>
              </div>
            </div>

            <button type="button" className="details-action-btn primary" onClick={requireLogin}>
              انا مهتم
              <ArrowLeftIcon />
            </button>
            <button type="button" className="details-action-btn" onClick={requireLogin}>
              ارسال رسالة عبر الرسائل
              <MessageIcon />
            </button>
            <button type="button" className="details-action-btn whatsapp" onClick={requireLogin}>
              محادثة عبر الواتساب
              <WhatsAppIcon />
            </button>
          </aside>

          {/* ---------- Main content ---------- */}
          <div className="details-main">
            <div className="details-top-row">
              <p className="details-price">${property.price}</p>
              <section>
                <div className="details-badges">
                  <span className="details-badge status">{property.status}</span>
                  <span className="details-badge type">{property.type}</span>
                </div>
                <div className="details-heading">
                  <h1>{property.title}</h1>
                  <p className="details-location">
                    {property.location}
                    <PinIcon />
                  </p>
                </div>
              </section>
            </div>

            <div className="details-stats">
              <div className="details-stat-card">
                <p className="details-stat-label">غرف نوم</p>
                <p className="details-stat-value">
                  <BedIcon />
                  {property.bedrooms} سرير
                </p>
              </div>
              <div className="details-stat-card">
                <p className="details-stat-label">الحمامات</p>
                <p className="details-stat-value">
                  <BathIcon />
                  {property.bathrooms} الحمامات
                </p>
              </div>
              <div className="details-stat-card">
                <p className="details-stat-label">المساحة الكلية</p>
                <p className="details-stat-value">
                  <AreaIcon />
                  {property.area}
                </p>
              </div>
            </div>

            <section className="details-section">
              <h2>وصف</h2>
              <div className={`details-desc${showDescMore ? " expanded" : ""}`}>
                <p>{property.description.split("\n").map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}</p>
              </div>
              <button type="button" className="details-desc-more" onClick={() => setShowDescMore((v) => !v)}>
                {showDescMore ? "عرض أقل" : "اقرأ المزيد"}
              </button>
            </section>

            <section className="details-section">
              <h2>وسائل الراحة الرئيسية</h2>
              <div className="details-amenities">
                {amenities.map((a) => (
                  <div className="details-amenity" key={a.label}>
                    {a.icon}
                    {a.label}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ---------- Delete confirmation modal ---------- */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <WarnIcon /> تأكيد الحذف
              </div>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)} aria-label="إغلاق">
                <CloseIcon />
              </button>
            </div>

            <p className="modal-text-heading">هل أنت متأكد من حذف هذا الإعلان؟</p>
            <p className="modal-text nowrap">
              سيتم إزالة العقار من نتائج البحث العامة ولا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="modal-property">
              <img src={deleteTarget.image} alt={deleteTarget.title} />
              <div>
                <p className="modal-property-id">عقار رقم #{deleteTarget.id}</p>
                <p className="modal-property-title">{deleteTarget.title}</p>
                <p className="modal-property-price">${deleteTarget.price.toLocaleString()}</p>
              </div>
            </div>

            <button className="submit-btn danger full" onClick={confirmDelete}>
              حذف الاعلان
              <TrashIcon />
            </button>
            <button className="cancel-btn full" onClick={() => setShowDeleteModal(false)}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ---------- Login-required modal ---------- */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal modal-center">
            <button className="modal-close modal-close-abs" onClick={() => setShowLoginModal(false)} aria-label="إغلاق">
              <CloseIcon />
            </button>

            <div className="modal-icon-circle blue">
              <UserIcon />
            </div>

            <h3 className="modal-center-title">سجّل الدخول للمتابعة</h3>
            <p className="modal-text center">
              يجب إنشاء حساب للتمكن من حفظ العقارات والتواصل مع المالك.
            </p>

            <button className="submit-btn full" onClick={() => setShowLoginModal(false)}>
              <ArrowLeftIcon /> تسجيل الدخول
            </button>
            <button className="cancel-btn full" onClick={() => setShowLoginModal(false)}>
              انشاء حساب جديد
            </button>
          </div>
        </div>
      )}

      {/* ---------- Permission-denied modal (editing someone else's listing) ---------- */}
      {showPermissionModal && (
        <div className="modal-overlay">
          <div className="modal modal-center">
            <button className="modal-close modal-close-abs" onClick={() => setShowPermissionModal(false)} aria-label="إغلاق">
              <CloseIcon />
            </button>

            <div className="modal-icon-circle red">
              <LockIcon />
            </div>

            <h3 className="modal-center-title">لا يمكنك تعديل هذا العقار</h3>
            <p className="modal-text center">
              ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة. يرجى التأكد
              من صلاحياتك أو العودة إلى لوحة التحكم.
            </p>

            <button className="submit-btn full" onClick={() => setShowPermissionModal(false)}>
              الرجوع الرئيسية <ArrowLeftIcon />
            </button>
          </div>
        </div>
      )}

      {/* ---------- Change property status modal ---------- */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header with-subtitle">
              <div>
                <p className="modal-title-plain">تغيير حالة العقار</p>
                <p className="modal-subtitle">اختر الحالة الحالية للعقار لتحديث ظهوره للباحثين</p>
              </div>
              <button className="modal-close" onClick={() => setShowStatusModal(false)} aria-label="إغلاق">
                <CloseIcon />
              </button>
            </div>

            <div className="status-list">
              {statusOptions.map((option) => {
                const selected = selectedStatus === option.id;
                return (
                  <button
                    type="button"
                    key={option.id}
                    className={`status-option${selected ? " selected" : ""}`}
                    onClick={() => setSelectedStatus(option.id)}
                  >
                    <span className={`status-dot ${option.color}`} />
                    <span className="status-option-right">
                      <span className="status-option-label">{option.label}</span>
                      <span className="status-radio">
                        <span className="status-radio-dot" />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button className="submit-btn full" onClick={confirmStatus}>
              تحديث الحالة
            </button>
            <button className="cancel-btn full" onClick={() => setShowStatusModal(false)}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ---------- Status updated successfully modal ---------- */}
      {showStatusSuccess && (
        <div className="modal-overlay">
          <div className="modal modal-center">
            <div className="modal-icon-circle-lg">
              <div className="modal-icon-circle-inner">
                <CheckIconLarge />
              </div>
            </div>

            <h3 className="modal-center-title">تم تحديث حالة العقار بنجاح</h3>

            <div className="status-updated-row">
              <span className="status-updated-label">الحالة الجديدة:</span>
              <span className="status-updated-pill">{updatedStatusLabel}</span>
            </div>

            <button className="submit-btn full" onClick={() => setShowStatusSuccess(false)}>
              عرض اعلان العقار
            </button>
            <button className="cancel-btn full" onClick={() => setShowStatusSuccess(false)}>
              العودة للرئيسية
            </button>
          </div>
        </div>
      )}

      {/* ---------- Property deleted successfully modal ---------- */}
      {showDeleteSuccess && (
        <div className="modal-overlay">
          <div className="modal modal-center">
            <div className="modal-icon-circle-lg">
              <div className="modal-icon-circle-inner">
                <CheckIconLarge />
              </div>
            </div>

            <h3 className="modal-center-title lg">تم حذف العقار بنجاح</h3>
            <p className="modal-text center">
              تمت إزالة العقار من القائمة ولا يمكن التراجع عن هذا الإجراء.
            </p>

            <button className="submit-btn full" onClick={() => setShowDeleteSuccess(false)}>
              الرجوع للرئيسية <ArrowLeftIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
