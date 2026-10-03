import React from "react";
import "./SuspendUserPage.css";

function TrashIcon({ size = 32 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7V5.2c0-.66.54-1.2 1.2-1.2h3.6c.66 0 1.2.54 1.2 1.2V7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 7l.8 11.2A2 2 0 0 0 8.8 20h6.4a2 2 0 0 0 2-1.8L18 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </svg>
  );
}

/**
 * مودال "حذف حساب المستخدم نهائياً"
 * TODO(ربط API): نفّذوا طلب الحذف النهائي داخل onConfirm، وأرسلوا activeCount الحقيقي
 */
export function DeleteUserModal({ activeCount = 4, onConfirm, onCancel }) {
  return (
    <div className="suspend-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-user-title">
      <div className="suspend-modal delete-user-modal">
        <div className="suspend-icon-ring danger">
          <div className="suspend-icon-circle danger">
            <TrashIcon />
          </div>
        </div>

        <h2 id="delete-user-title" className="suspend-title">
          حذف حساب المستخدم نهائياً
        </h2>
        <p className="suspend-text">
          هل أنت متأكد من رغبتك في حذف هذا الحساب؟ هذا الإجراء نهائي ولا يمكن التراجع
          عنه، وسيتم إلغاء تفعيل كافة الإعلانات المرتبطة فوراً.
        </p>

        <div className="suspend-note danger">
          <span className="suspend-note-icon">
            <WarningIcon />
          </span>
          <p className="suspend-note-text">
            <strong>تنبيه:</strong> يحتوي هذا الحساب على{" "}
            <strong className="underlined">{activeCount} عقارات نشطة</strong> وسيتم أرشفة سجل
            العمليات للمشرفين.
          </p>
        </div>

        <div className="suspend-actions">
          <button type="button" className="suspend-btn-cancel" onClick={onCancel}>
            الغاء الامر
          </button>
          <button type="button" className="suspend-btn-confirm danger" onClick={onConfirm}>
            <TrashIcon size={18} />
            تاكيد حذف الحساب
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DeleteUserPage({ activeCount, onConfirm, onCancel }) {
  return <DeleteUserModal activeCount={activeCount} onConfirm={onConfirm} onCancel={onCancel} />;
}
