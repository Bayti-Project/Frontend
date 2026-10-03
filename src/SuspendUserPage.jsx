import React from "react";
import "./SuspendUserPage.css";

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="2" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" rx="2" fill="currentColor" />
    </svg>
  );
}

function PauseSmallIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="2.4" height="10" rx="1.2" fill="currentColor" />
      <rect x="9.6" y="3" width="2.4" height="10" rx="1.2" fill="currentColor" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * مودال "إيقاف حساب المستخدم مؤقتاً"
 * TODO(ربط API): نفّذوا طلب الإيقاف المؤقت داخل onConfirm
 */
export function SuspendUserModal({ onConfirm, onCancel }) {
  return (
    <div className="suspend-overlay" role="dialog" aria-modal="true" aria-labelledby="suspend-title">
      <div className="suspend-modal">
        <div className="suspend-icon-ring">
          <div className="suspend-icon-circle">
            <PauseIcon />
          </div>
        </div>

        <h2 id="suspend-title" className="suspend-title">
          إيقاف حساب المستخدم مؤقتاً
        </h2>
        <p className="suspend-text">
          سيتم تجميد صلاحيات هذا المستخدم ومنعه مؤقتاً من نشر أو تعديل أي إعلانات
          عقارية جديدة في المنصة حتى يتم رفع الإيقاف.
        </p>

        <div className="suspend-note">
          <span className="suspend-note-icon">
            <InfoIcon />
          </span>
          <p className="suspend-note-text">
            <strong>تنبيه:</strong> سيبقى سجل العمليات والعقارات السابقة للمستخدم محفوظة في
            النظام للرجوع إليها.
          </p>
        </div>

        <div className="suspend-actions">
          <button type="button" className="suspend-btn-cancel" onClick={onCancel}>
            الغاء الامر
          </button>
          <button type="button" className="suspend-btn-confirm" onClick={onConfirm}>
            <PauseSmallIcon />
            إيقاف الحساب موقتا
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuspendUserPage({ onConfirm, onCancel }) {
  return <SuspendUserModal onConfirm={onConfirm} onCancel={onCancel} />;
}
