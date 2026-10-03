import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaExclamationTriangle,
  FaClipboardList,
  FaCalendarAlt,
  FaBuilding,
  FaBell,
  FaArrowLeft,
} from "react-icons/fa";
import "./ExistingInterestModal.css";

const STATUS_LABELS = {
  pending: "قيد المراجعة",
  accepted: "مقبول",
  approved: "مقبول",
  rejected: "مرفوض",
};

const STATUS_CLASSES = {
  pending: "is-pending",
  accepted: "is-accepted",
  approved: "is-accepted",
  rejected: "is-rejected",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  try {
    return new Intl.DateTimeFormat("ar", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function ExistingInterestDialog({ request, onClose, onViewRequest }) {
  const requestId = request?.requestId || request?.id || "";
  const status = String(request?.status || "pending").toLowerCase();
  const ownerName = request?.ownerName || request?.owner?.full_name || "مالك العقار";
  const createdAt = request?.createdAt || request?.created_at || "";
  const relative = request?.relativeTime || "منذ يوم أمس";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="eim" role="dialog" aria-modal="true" aria-labelledby="eim-title">
      <div className="eim__backdrop" onClick={onClose} />

      <div className="eim__box">
        <button className="eim__close" type="button" onClick={onClose} aria-label="إغلاق">
          <FaTimes />
        </button>

        <span className="eim__tag">
          <span className="eim__tag-dot" />
          إجراء غير مطلوب
        </span>

        <span className="eim__art" aria-hidden="true">
          <FaExclamationTriangle />
        </span>

        <h2 className="eim__title" id="eim-title">
          لقد أرسلت طلب اهتمام مسبقاً لهذا العقار
        </h2>

        <p className="eim__desc">
          {requestId ? (
            <>
              طلبك الحالي{" "}
              <span className="eim__ref" dir="ltr">
                #{requestId}
              </span>{" "}
              برقم المراجعة لدى المالك {relative}. لا حاجة لإرسال طلب جديد، وسيتم إشعارك فور اتخاذ
              المالك للقرار.
            </>
          ) : (
            <>
              لديك طلب اهتمام سابق على هذا العقار برقم المراجعة لدى المالك {relative}. لا حاجة لإرسال
              طلب جديد، وسيتم إشعارك فور اتخاذ المالك للقرار.
            </>
          )}
        </p>

        <section className="eim__card">
          <header className="eim__card-head">
            <span className="eim__card-title">
              <FaClipboardList />
              تفاصيل السجل القائم
            </span>
            <span className="eim__card-id" dir="ltr">
              #{requestId || "—"}
            </span>
          </header>

          <div className="eim__grid">
            <div className="eim__cell">
              <p className="eim__label">حالة الطلب</p>
              <span className={`eim__badge ${STATUS_CLASSES[status] || "is-pending"}`}>
                {STATUS_LABELS[status] || "قيد المراجعة"}
              </span>
            </div>

            <div className="eim__cell">
              <p className="eim__label">تاريخ الإرسال</p>
              <p className="eim__value">
                <FaCalendarAlt className="eim__value-icon" />
                <span>{formatDate(createdAt)}</span>
              </p>
            </div>

            <div className="eim__cell">
              <p className="eim__label">اسم المالك</p>
              <p className="eim__value">
                <FaBuilding className="eim__value-icon" />
                <span>{ownerName}</span>
              </p>
            </div>
          </div>
        </section>

        <p className="eim__note">
          <FaBell className="eim__note-icon" />
          <span>
            سنرسل تنبيهاً فورياً إلى رقم هاتفك المسجل وعبر لوحة الإشعارات بمجرد استجابة المالك.
          </span>
        </p>

        <button className="eim__cta" type="button" onClick={onViewRequest}>
          <span>عرض تفاصيل وحالة الطلب</span>
          <FaArrowLeft className="eim__cta-arrow" />
        </button>
      </div>
    </div>
  );
}

export default function ExistingInterestModal({ request, onClose, onViewRequest }) {
  if (!request) return null;
  return createPortal(
    <ExistingInterestDialog request={request} onClose={onClose} onViewRequest={onViewRequest} />,
    document.body
  );
}