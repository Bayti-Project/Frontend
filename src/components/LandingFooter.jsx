import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import "../pages/homeTenant.css";

export default function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-grid">
        <div className="lp-footer-brand">
          <img src="/footer.png" alt="بيتي Bayti" className="lp-footer-logo" />
          <p>منصة بيتي العقارية الرائدة في قطاع غزة، نربط الملاك والمستأجرين بأفضل العقارات.</p>
        </div>
        <div className="lp-footer-col">
          <h4>روابط سريعة</h4>
          <ul>
            <li><a href="#">الرئيسية</a></li>
            <li><a href="#">عقارات للبيع</a></li>
            <li><a href="#">عقارات للإيجار</a></li>
            <li><a href="#">حسابي</a></li>
          </ul>
        </div>
        <div className="lp-footer-col">
          <h4>أنواع العقارات</h4>
          <ul>
            <li><a href="#">شقق</a></li>
            <li><a href="#">فلل</a></li>
            <li><a href="#">أبراج</a></li>
            <li><a href="#">محلات تجارية</a></li>
          </ul>
        </div>
        <div className="lp-footer-col">
          <h4>تواصل معنا</h4>
          <ul>
            <li><FaEnvelope /> info@bayti.ps</li>
            <li><FaPhone /> +970 59 000 0000</li>
            <li><FaMapMarkerAlt /> قطاع غزة</li>
          </ul>
          <h4 className="lp-follow-title">تابعنا على</h4>
          <div className="lp-social-row">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>
      <div className="lp-footer-bottom">
        © 2026 بيتي - جميع الحقوق محفوظة
      </div>
    </footer>
  );
}