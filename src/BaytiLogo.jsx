import React, { useId } from "react";

// شعار بيتي (بيت + دبوس موقع) — نسخة SVG مرسومة حسب الفيجما.
// light = نسخة بيضاء للخلفيات الداكنة (الفوتر).
export default function BaytiLogo({ light = false }) {
  const gradientId = `bayti-grad-${useId().replace(/:/g, "")}`;
  const stroke = light ? "#fff" : `url(#${gradientId})`;
  const pinFill = light ? "#fff" : "#0282AD";
  const dotFill = light ? "#022747" : "#fff";

  return (
    <span className={`bayti-logo${light ? " light" : ""}`}>
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        {!light && (
          <defs>
            <linearGradient id={gradientId} x1="6" y1="8" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#022747" />
              <stop offset="1" stopColor="#0282AD" />
            </linearGradient>
          </defs>
        )}
        <path
          d="M5 25 24 8l19 17M11 22.5V40h26V22.5M33 14V8h5v11"
          stroke={stroke}
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 39s-7.5-7.5-7.5-13.5a7.5 7.5 0 0 1 15 0C31.5 31.5 24 39 24 39Z"
          fill={pinFill}
        />
        <circle cx="24" cy="25.5" r="2.8" fill={dotFill} />
      </svg>
      <span className="bayti-logo-text">
        <span className="bayti-logo-ar">بيتي</span>
        <span className="bayti-logo-en">Bayti</span>
      </span>
    </span>
  );
}
