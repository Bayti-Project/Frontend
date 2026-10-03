import React from "react";
import "./SavedPropertiesPage.css";
import BaytiLogo from "./BaytiLogo";
import avatar from "./assets/listings/agent-ahmed.png";

const navLinks = [
  { label: "الرئيسية", href: "#", active: true },
  { label: "البحث", href: "#" },
  { label: "طلباتي", href: "#" },
  { label: "المحفوظات", href: "#" },
];

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path
        d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// هيدر صفحة العقارات المحفوظة (حسب الفيجما)
export default function SavedHeader({ onBellClick }) {
  return (
    <header className="saved-header">
      <div className="saved-header-inner">
        <a href="#" className="saved-header-logo" aria-label="بيتي">
          <BaytiLogo />
        </a>

        <nav aria-label="القائمة الرئيسية">
          <ul className="saved-nav">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className={link.active ? "active" : ""}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="saved-header-actions">
          <button className="saved-bell" aria-label="الإشعارات" onClick={onBellClick}>
            <BellIcon />
          </button>
          <img className="saved-avatar" src={avatar} alt="الحساب الشخصي" />
        </div>
      </div>
    </header>
  );
}
