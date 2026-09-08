import React from "react";

const navLinks = [
  { label: "الرئيسية", href: "#", active: true },
  { label: "البحث", href: "#" },
  { label: "طلباتي", href: "#" },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="logo">
        <span className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 11L12 3L21 11"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 10V20H19V10"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="logo-text">
          بيتي
          <small>Bayti</small>
        </span>
      </div>

      <ul className="main-nav">
        {navLinks.map((link) => (
          <li key={link.label}>
            <a href={link.href} className={link.active ? "active" : ""}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="header-actions">
        <button className="icon-btn" aria-label="الإشعارات">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path
              d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="avatar">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M4 20c0-4 3.5-7 8-7s8 3 8 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </header>
  );
}
