import React, { useState } from "react";
import "./SuspendUserPage.css";

const REASONS = ["مخالفة", "مراجعة اضافية", "بطلب من المعلن"];

function EyeOffIcon({ size = 30 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M17.5 4.5 6.5 19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * مودال "إخفاء الإعلان مؤقتاً"
 * TODO(ربط API): نفّذوا طلب الإخفاء داخل onConfirm (يُرسل السبب المختار)
 */
export function HideListingModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState(REASONS[2]);

  return (
    <div className="suspend-overlay" role="dialog" aria-modal="true" aria-labelledby="hide-title">
      <div className="suspend-modal hide-modal">
        <div className="hide-icon-circle">
          <EyeOffIcon />
        </div>

        <h2 id="hide-title" className="suspend-title">
          إخفاء الإعلان مؤقتاً
        </h2>
        <p className="suspend-text">
          لن يظهر هذا العقار في نتائج البحث والتصفح للمستخدمين في منصة بيتي حتى إعادة
          تفعيله مرة أخرى.
        </p>

        <div className="hide-reasons">
          <p className="hide-reasons-label">سبب الإخفاء الإداري:</p>
          <div className="hide-chips" role="radiogroup" aria-label="سبب الإخفاء الإداري">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === r}
                className={`hide-chip${reason === r ? " selected" : ""}`}
                onClick={() => setReason(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="suspend-actions">
          <button type="button" className="suspend-btn-cancel" onClick={onCancel}>
            الغاء الامر
          </button>
          <button type="button" className="suspend-btn-confirm navy" onClick={() => onConfirm?.(reason)}>
            <EyeOffIcon size={18} />
            اخفاء العقار الان
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HideListingPage({ onConfirm, onCancel }) {
  return <HideListingModal onConfirm={onConfirm} onCancel={onCancel} />;
}
