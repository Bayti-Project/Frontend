import React from "react";
import "./SavedPropertiesPage.css";
import BaytiLogo from "./BaytiLogo";

const quickLinks = ["الرئيسية", "من نحن", "كيف تعمل المنصة", "الدعم الفني"];
const propertyTypes = ["شقق", "منازل", "أراضي", "مكاتب", "محلات", "مخازن"];

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m3.5 7 8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M7.9 20A9 9 0 1 0 4 16.1L2 22l5.9-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 8.6c-.3 1.6.7 3.7 2.4 5 1.3 1 2.9 1.5 4 .9l.3-1.2-1.7-.9-.8.7c-.9-.4-1.7-1.2-2.1-2.1l.7-.8-.9-1.7-1.9.1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3.5" fill="#fff" />
      <path
        d="M8 10.6V17M8 7.4v.01M11.7 17v-6.4M11.7 13.4a2.4 2.4 0 0 1 4.8 0V17"
        stroke="#0282AD"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.5" fill="#fff" />
      <circle cx="12" cy="12" r="4" stroke="#0282AD" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.2" fill="#0282AD" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#fff" />
      <path
        d="M13.4 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.3-1.3 1.4-1.3h1.4V5.6c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H8.3V14h2.3v7"
        fill="#0282AD"
      />
    </svg>
  );
}

// فوتر صفحة العقارات المحفوظة (حسب الفيجما)
export default function SavedFooter() {
  return (
    <footer className="saved-footer">
      <div className="saved-footer-grid">
        <div className="saved-footer-col saved-footer-brand">
          <BaytiLogo light />
          <p>
            بيتي هي وجهتك الموثوقة لكل ما يتعلق بالعقارات في قطاع غزة. الجودة
            والسرعة والأمان شعارنا.
          </p>
        </div>

        <div className="saved-footer-col">
          <h4>روابط سريعة</h4>
          <ul>
            {quickLinks.map((label) => (
              <li key={label}>
                <a href="#">{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="saved-footer-col">
          <h4>أنواع العقارات</h4>
          <ul>
            {propertyTypes.map((label) => (
              <li key={label}>
                <a href="#">{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="saved-footer-col">
          <h4>تواصل معنا</h4>
          <ul className="saved-footer-contact">
            <li>
              <a href="mailto:info@bayti.ps">
                <MailIcon />
                <span dir="ltr">info@bayti.ps</span>
              </a>
            </li>
            <li>
              <a href="tel:0598123456">
                <PhoneIcon />
                <span dir="ltr">0598 123 456</span>
              </a>
            </li>
            <li>
              <a href="https://wa.me/0598123456">
                <WhatsappIcon />
                <span dir="ltr">0598 123 456</span>
              </a>
            </li>
          </ul>

          <p className="saved-footer-follow">تابعنا على</p>
          <div className="saved-social">
            <a href="#" aria-label="فيسبوك">
              <FacebookIcon />
            </a>
            <a href="#" aria-label="انستغرام">
              <InstagramIcon />
            </a>
            <a href="#" aria-label="لينكدإن">
              <LinkedinIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="saved-footer-bottom">
        © 2024 بيتي - جميع الحقوق محفوظة لقطاع غزة
      </div>
    </footer>
  );
}
