import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import logoImg from "./logo.png";
import "./LandingHeader.css";

const NAV_LINKS = [
  { id: "top", label: "الرئيسية" },
  { id: "how-it-works", label: "كيف يعمل بيتي؟" },
  { id: "about-us", label: "من نحن" },
  { id: "support", label: "الدعم الفني" },
];

export default function LandingHeader({ linkBase = "" }) {
  // الرابط النشط يبدأ من الهاش الموجود بالـ URL مباشرة
  const [activeLink, setActiveLink] = useState(
    () => window.location.hash.replace("#", "") || "top"
  );
  const location = useLocation();

  const handleClick = (event, id) => {
    const onSamePage = !linkBase || location.pathname === linkBase;
    const target = document.getElementById(id);

    // نفس الصفحة: نمرّر للأقسام بنعومة بدل إعادة تحميل
    if (onSamePage && target) {
      event.preventDefault();
      setActiveLink(id);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `${location.pathname}#${id}`);
    }
    // صفحة أخرى: نترك المتصفح ينتقل بالـ hash بشكل طبيعي
  };

  return (
    <header className="lp-header">
      <div className="lp-header-inner">
        <Link to="/home" className="lp-logo">
          <img src={logoImg} alt="بيتي Bayti" className="lp-logo-img" />
        </Link>

        <nav className="lp-nav">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`${linkBase}#${link.id}`}
              className={activeLink === link.id ? "active" : ""}
              aria-current={activeLink === link.id ? "page" : undefined}
              onClick={(event) => handleClick(event, link.id)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="lp-header-actions">
          <Link to="/login" className="lp-btn-login">
            تسجيل الدخول
          </Link>
          <Link to="/register" className="lp-btn-register">
            إنشاء حساب <FaArrowLeft />
          </Link>
        </div>
      </div>
    </header>
  );
}
