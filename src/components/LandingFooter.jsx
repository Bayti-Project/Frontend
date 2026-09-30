import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa";
import footerImg from "./footer.png";
import "./LandingFooter.css";

const QUICK_LINKS = [
  { label: "الرئيسية", href: "/#top" },
  { label: "من نحن", href: "/#about-us" },
  { label: "كيف يعمل بيتي", href: "/#how-it-works" },
  { label: "الدعم الفني", href: "/#support" },
];

const PROPERTY_TYPES = [
  { label: "شقق", to: "/search?property_type=apartment" },
  { label: "منازل", to: "/search?property_type=villa" },
  { label: "أراضي", to: "/search?property_type=land" },
  { label: "مكاتب", to: "/search" },
  { label: "محلات", to: "/search?property_type=shop" },
  { label: "مخازن", to: "/search?property_type=store_room" },
];

const SOCIALS = [
  { label: "LinkedIn", href: "#", Icon: FaLinkedinIn },
  { label: "Instagram", href: "#", Icon: FaInstagram },
  { label: "Facebook", href: "#", Icon: FaFacebookF },
];

const EMAIL = "info@bayti.ps";
const PHONE_DISPLAY = "0598 123 456";
const PHONE_TEL = "+970598123456";
const WHATSAPP_URL = "https://wa.me/970598123456";

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="sf-footer">
      <div className="sf-footer__inner">
        <div className="sf-footer__grid">
          {/* العمود 1 — اللوجو والوصف */}
          <div className="sf-footer__brand">
            <img src={footerImg} alt="بيتي" className="sf-footer__logo" />
            <p className="sf-footer__desc">
              بيتي هي وجهتك الموثوقة لكل ما يتعلق بالعقارات في قطاع غزة. الجودة
              والسرعة والأمان شعارنا.
            </p>
          </div>

          {/* العمود 2 — روابط سريعة */}
          <nav className="sf-footer__col" aria-label="روابط سريعة">
            <h4 className="sf-footer__title">روابط سريعة</h4>
            <ul className="sf-footer__list">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a className="sf-footer__link" href={href}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* العمود 3 — أنواع العقارات */}
          <nav className="sf-footer__col" aria-label="أنواع العقارات">
            <h4 className="sf-footer__title">أنواع العقارات</h4>
            <ul className="sf-footer__list">
              {PROPERTY_TYPES.map(({ label, to }) => (
                <li key={label}>
                  <Link className="sf-footer__link" to={to}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* العمود 4 — تواصل معنا */}
          <div className="sf-footer__col">
            <h4 className="sf-footer__title">تواصل معنا</h4>
            <ul className="sf-footer__contact">
              <li>
                <span className="sf-footer__contact-icon">
                  <FaEnvelope />
                </span>
                <a href={`mailto:${EMAIL}`} dir="ltr">
                  {EMAIL}
                </a>
              </li>
              <li>
                <span className="sf-footer__contact-icon">
                  <FaPhone />
                </span>
                <a href={`tel:${PHONE_TEL}`} dir="ltr">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <span className="sf-footer__contact-icon">
                  <FaWhatsapp />
                </span>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  dir="ltr"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
            </ul>

            <h4 className="sf-footer__follow">تابعنا على</h4>
            <div className="sf-footer__social">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a key={label} href={href} aria-label={label}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="sf-footer__bottom">
          <p>
            © {year} بيتي - جميع الحقوق محفوظة لقطاع غزة.
          </p>
        </div>
      </div>
    </footer>
  );
}
