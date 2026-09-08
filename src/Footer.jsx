import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        {/* اللوجو والوصف */}
        <div className="footer-col footer-brand">
          <div className="logo">
            <span className="logo-icon" style={{ background: "rgba(255,255,255,0.1)" }}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 11L12 3L21 11" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 10V20H19V10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="logo-text">
              بيتي
              <small style={{ color: "#9FA8BC" }}>Bayti</small>
            </span>
          </div>
          <p>
            بيتي هي وجهتك الموثوقة لكل ما يتعلق بالعقارات في قطاع غزة، السرعة
            والأمان شعارنا.
          </p>
        </div>

        {/* روابط سريعة */}
        <div className="footer-col">
          <h4>روابط سريعة</h4>
          <ul>
            <li><a href="#">الرئيسية</a></li>
            <li><a href="#">من نحن</a></li>
            <li><a href="#">كيف تعمل المنصة</a></li>
            <li><a href="#">الدعم الفني</a></li>
          </ul>
        </div>

        {/* أنواع العقارات */}
        <div className="footer-col">
          <h4>أنواع العقارات</h4>
          <ul>
            <li><a href="#">شقق</a></li>
            <li><a href="#">منازل</a></li>
            <li><a href="#">أراضي</a></li>
            <li><a href="#">مكاتب</a></li>
            <li><a href="#">محلات</a></li>
            <li><a href="#">مخازن</a></li>
          </ul>
        </div>

        {/* تواصل معنا */}
        <div className="footer-col">
          <h4>تواصل معنا</h4>
          <ul>
            <li>
              <a href="mailto:info@bayti.ps">✉ info@bayti.ps</a>
            </li>
            <li>
              <a href="tel:0598123456">📞 0598 123 456</a>
            </li>
            <li>
              <a href="https://wa.me/0598123456">💬 0598 123 456</a>
            </li>
          </ul>
          <p style={{ marginTop: "10px", color: "#fff", fontSize: "13.5px", fontWeight: 700 }}>
            تابعنا على
          </p>
          <div className="social-row">
            <span aria-label="لينكدإن">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
                <path d="M7 10v7M7 7v.01M11 17v-4.5a2 2 0 0 1 4 0V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span aria-label="انستغرام">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </span>
            <span aria-label="فيسبوك">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M14 9h2V6h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2l1-3h-3V9c0-.6.4-1 1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © بيتي 2024 - جميع الحقوق محفوظة لقطاع غزة
      </div>
    </footer>
  );
}
