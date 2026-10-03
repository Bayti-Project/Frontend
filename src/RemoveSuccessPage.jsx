import React from "react";
import "./SuspendUserPage.css";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden="true">
      <path d="M4.5 12.8 9.6 18 19.5 6.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function FileCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M14 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7l-4-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9.5 14 2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * مودال "تمت إزالة الإعلان بنجاح"
 * TODO(ربط API): مرّروا رقم العملية ورقم البلاغ واسم المشرف الحقيقيين من الاستجابة
 */
export function RemoveSuccessModal({
  operationId = "RM-2026-0841",
  reportId = "#R-1042",
  supervisor = "عبدالله الحربي",
  onBack,
  onClose,
}) {
  return (
    <div className="suspend-overlay" role="dialog" aria-modal="true" aria-labelledby="remove-success-title">
      <div className="suspend-modal success-modal">
        <button type="button" className="success-close" onClick={onClose || onBack} aria-label="إغلاق">
          <CloseIcon />
        </button>

        <div className="success-icon-circle">
          <CheckIcon />
        </div>

        <h2 id="remove-success-title" className="suspend-title">
          تمت إزالة الإعلان بنجاح
        </h2>
        <p className="suspend-text">
          تم حذف الإعلان المخالف وأرشفته بنجاح، وتم إرسال إشعار رسمي للمعلن وتحديث حالة
          البلاغ في النظام.
        </p>

        <div className="success-info">
          <div className="success-info-text">
            <p className="success-info-row">
              <span className="success-info-label">رقم العملية:</span>
              <span className="success-info-code" dir="ltr">{operationId}</span>
            </p>
            <p className="success-info-meta">
              مرتبط بالبلاغ: <strong dir="ltr">{reportId}</strong> — المشرف: {supervisor}
            </p>
          </div>
          <span className="success-info-icon">
            <FileCheckIcon />
          </span>
        </div>

        <button type="button" className="suspend-btn-confirm navy success-back" onClick={onBack}>
          العودة الي لوحة البلاغات
        </button>
      </div>
    </div>
  );
}

export default function RemoveSuccessPage(props) {
  return <RemoveSuccessModal {...props} />;
}
