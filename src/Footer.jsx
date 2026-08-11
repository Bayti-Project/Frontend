import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="#" className="logo">
            <img
              src="/logofooter.png"
              alt="بيتي Bayti"
              className="logo-img logo-img-footer"
            />
          </a>
          <p>
            منصة بيتي العقارية الرائدة في قطاع غزة، نربط الملاك
            والمستأجرين بأفضل العقارات في المنطقة.
          </p>
          <div className="social-row">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>روابط سريعة</h4>
          <ul>
            <li><a href="#">الرئيسية</a></li>
            <li><a href="#">عقارات للبيع</a></li>
            <li><a href="#">عقارات للإيجار</a></li>
            <li><a href="#">حسابي</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>خدماتنا</h4>
          <ul>
            <li><a href="#">تقييم عقاري</a></li>
            <li><a href="#">إدارة أملاك</a></li>
            <li><a href="#">استشارات عقارية</a></li>
            <li><a href="#">تمويل عقاري</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>تواصل معنا</h4>
          <ul className="contact-list">
            <li>
              <span className="contact-icon"><FaMapMarkerAlt /></span>
              قطاع غزة
            </li>
            <li>
              <span className="contact-icon"><FaPhone /></span>
              +970 59 000 0000
            </li>
            <li>
              <span className="contact-icon"><FaEnvelope /></span>
              info@bayti.ps
            </li>
          </ul>
          <div className="follow-label">تابعنا</div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 بيتي Bayti. جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
