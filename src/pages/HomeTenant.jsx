import { Fragment, useState } from "react";
import Navbar from "../components/Navbar";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaHeart,
  FaCheck,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaQuoteLeft,
  FaChevronRight,
  FaChevronLeft,
  FaBuilding,
  FaShieldAlt,
  FaMoneyBillWave,
  FaHeadset,
} from "react-icons/fa";
import "./homeTenant.css";

const properties = [
  {
    id: 1,
    title: "شقة فاخرة مطلة على البحر",
    location: "غزة، الرمال",
    price: "120,000$",
    type: "للبيع",
    typeClass: "sale",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    beds: 3,
    baths: 2,
    area: 160,
  },
  {
    id: 2,
    title: "فيلا عصريّة مع حديقة",
    location: "غزة، تل الهوا",
    price: "80,000$",
    type: "للإيجار",
    typeClass: "rent",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    beds: 4,
    baths: 3,
    area: 260,
  },
  {
    id: 3,
    title: "مكتب تجاري في موقع حيوي",
    location: "غزة، النصر",
    price: "40,000$",
    type: "للبيع",
    typeClass: "sale",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    beds: 3,
    baths: 2,
    area: 160,
  },
];

const steps = [
  { id: 1, title: "ابحث", text: "حدد مواصفات عقارك المفضل" },
  { id: 2, title: "التفاصيل", text: "شاهد الصور والمعلومات الكاملة" },
  { id: 3, title: "أرسل اهتمام", text: "اضغط على أزرار التواصل مباشرة" },
  { id: 4, title: "تواصل", text: "احصل على بيانات الاتصال المباشرة" },
];

const whyUs = [
  { id: 1, icon: <FaBuilding />, title: "آلاف العقارات", text: "مجموعة ضخمة من العقارات المتنوعة تناسب جميع الأذواق والميزانيات." },
  { id: 2, icon: <FaShieldAlt />, title: "أمان وموثوقية", text: "نظام تحقق متكامل يضمن لك التعامل مع ملاك موثوقين فقط." },
  { id: 3, icon: <FaSearch />, title: "بحث ذكي", text: "محرك بحث متطور يساعدك في العثور على العقار المثالي بثوانٍ." },
  { id: 4, icon: <FaMoneyBillWave />, title: "تحديثات فورية", text: "الأسعار والعروض تتحدث بشكل يومي لضمان أفضل الفرص لك." },
];

const testimonials = [
  { id: 1, quote: "منصة ممتازة واجهتني بسرعة في العثور على شقة مناسبة. التعامل كان سلساً وشفافاً.", name: "أحمد محمد", title: "مستأجر", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
  { id: 2, quote: "عرضت فيلا للبيع ووجدت مشترياً خلال أيام فقط. الخدمة احترافية والتقييم واضح.", name: "سارة خالد", title: "مالكة عقار", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
  { id: 3, quote: "الواجهة سهلة الاستخدام والدعم الفني متواجد دائماً. أنصح بها بشدة لكل من يبحث عن عقار.", name: "محمد علي", title: "مستأجر", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
];

export default function HomeTenant({
  onHomeClick,
  onProfileClick,
  onChangePasswordClick,
  onLogoutClick,
}) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [liked, setLiked] = useState({});

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="lp-page" dir="rtl">
      {/* Header */}
      <Navbar
        onHomeClick={onHomeClick}
        onProfileClick={onProfileClick}
        onChangePasswordClick={onChangePasswordClick}
        onLogoutClick={onLogoutClick}
      />

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-overlay" />
        <div className="lp-hero-content">
          <h1>ابحث عن عقارك المثالي في غزة</h1>
          <p>اكتشف آلاف العقارات المتاحة في مختلف مناطق قطاع غزة بأسعار تنافسية وموثوقة.</p>
          <div className="lp-search-box">
            <select defaultValue="all">
              <option value="all">المنطقة: كل المناطق</option>
              <option value="rmal">الرمال</option>
              <option value="talhawa">تل الهوا</option>
              <option value="nasr">النصر</option>
              <option value="sheikh">الشيخ رضوان</option>
            </select>
            <select defaultValue="100000">
              <option value="50000"> أقل من 500 ₪
              </option>
              <option value="100000"> أقل من 800₪</option>
              <option value="200000">أقل من 1000₪</option>
              <option value="500000">أقل من 2000₪</option>
              <option value="500000">أكثر من 3000₪</option>
            </select>
            <select defaultValue="المساحة">
              <option value="المساحة" disabled hidden>اختر المساحة</option>
              <option value="70-100">70-100 م²</option>
              <option value="100-149">100-149 م²</option>
              <option value="150-199">150-199 م²</option>
              <option value="200-249">200-249 م²</option>
              <option value="250-299">250-299 م²</option>
              <option value="300-399">300-399 م²</option>
              <option value="400-499">400-499 م²</option>
              <option value="500+">500 م² فأكثر</option>
            </select>
            <button className="lp-search-btn">
              <FaSearch /> بحث
            </button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="lp-section">
        <div className="lp-section-head">
          <h2>أحدث العقارات</h2>
          <a href="#" className="lp-section-link">مشاهدة الكل <FaArrowLeft /></a>
        </div>
        <div className="lp-properties-grid">
          {properties.map((p) => (
            <article key={p.id} className="lp-property-card">
              <div className="lp-property-img-wrap">
                <img src={p.image} alt={p.title} loading="lazy" />
                <span className={`lp-property-type ${p.typeClass}`}>{p.type}</span>
                <button className={`lp-like-btn ${liked[p.id] ? "liked" : ""}`} onClick={() => toggleLike(p.id)}>
                  {liked[p.id] ? <FaHeart /> : <FaHeart style={{ opacity: 0.7 }} />}
                </button>
              </div>
              <div className="lp-property-body">
                <h3>{p.title}</h3>
                <div className="lp-property-meta">
                  <p className="lp-property-location">
                    <FaMapMarkerAlt /> {p.location}
                  </p>
                  <span className="lp-property-price">{p.price}</span>
                </div>
                <div className="lp-property-features">
                  {p.beds > 0 && <span><FaBed /> {p.beds} غرف</span>}
                  {p.baths > 0 && <span><FaBath /> {p.baths} حمام</span>}
                  {p.area > 0 && <span><FaRulerCombined /> {p.area}م²</span>}
                </div>
                <div className="lp-property-footer">
                  <button className="lp-property-btn">عرض التفاصيل</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="lp-section lp-steps-section">
        <div className="lp-section-head center">
          <h2>كيف يعمل بيتي؟</h2>
          <p>خطوات بسيطة للوصول إلى العقار الذي تبحث عنه</p>
        </div>
        <div className="lp-steps-row">
          {steps.map((s, idx) => (
            <Fragment key={s.id}>
              <article className="lp-step-card">
                <div className="lp-step-num">{s.id}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
              {idx < steps.length - 1 && <div className="lp-step-connector" />}
            </Fragment>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="lp-section lp-why-section">
        <div className="lp-section-head center light">
          <h2>لماذا تختار بيتي؟</h2>
          <p>نقدم لك تجربة بحث عن عقار لا مثيل لها</p>
        </div>
        <div className="lp-why-grid">
          {whyUs.map((w) => (
            <article key={w.id} className="lp-why-card">
              <div className="lp-why-icon">{w.icon}</div>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* About Us */}
      <section className="lp-section lp-about-section">
        <div className="lp-about-grid">
          <div className="lp-about-img">
            <img src="who.png" alt="فريق بيتي" loading="lazy" />
          </div>
          <div className="lp-about-content">
            <span className="lp-about-tag">عن منصة بيتي</span>
            <h2>مهمتنا تسهيل الوصول للسكن الكريم</h2>
            <p>
              منصة بيتي هي المنصة العقارية الأولى والرائدة في قطاع غزة تهدف الى ربط
              الباحثين عن العقارات بأصحابها ومطوريها بكل سهولة وشفافية . نحن نؤمن
              بأن الوصول للمنزل المثالي هو حق اساسي . لذا سخرنا التكنولوجيا لخدمتكم
              وتوفير الجهد والوقت .
            </p>
            <div className="lp-about-list">
              <div className="lp-about-item">
                <span className="lp-about-icon"><FaCheck /></span>
                <div className="lp-about-text">
                  <h4>شفافية كاملة</h4>
                  <p>بيانات دقيقة وصور حقيقية.</p>
                </div>
              </div>
              <div className="lp-about-item">
                <span className="lp-about-icon"><FaCheck /></span>
                <div className="lp-about-text">
                  <h4>دعم فني</h4>
                  <p>متواجدون دائماً لمساعدتكم.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="lp-section lp-testimonials-section">
        <div className="lp-section-head center">
          <h2>قالوا عن بيتي</h2>
        </div>
        <div className="lp-testimonials-slider">
          <button className="lp-slider-btn prev" onClick={prevTestimonial}>
            <FaChevronRight />
          </button>
          <div className="lp-testimonials-track">
            {testimonials.map((t, idx) => (
              <div key={t.id} className={`lp-testimonial-card ${idx === currentTestimonial ? "active" : ""}`}>
                <FaQuoteLeft className="lp-quote-icon" />
                <p className="lp-testimonial-text">{t.quote}</p>
                <div className="lp-testimonial-author">
                  <img src={t.image} alt={t.name} loading="lazy" />
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="lp-slider-btn next" onClick={nextTestimonial}>
            <FaChevronLeft />
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta-wrapper">
        <div className="lp-cta">
          <div className="lp-cta-text">
            <h2>تحتاج مساعدة؟ نحن هنا</h2>
            <p>فريق الدعم الفني متاح على مدار الساعة للإجابة على استفساراتكم ومساعدتكم في استخدام المنصة.</p>
          </div>
          <div className="lp-cta-btns">
            <button className="lp-cta-btn call">
              اتصل بنا <FaPhone />
            </button>
            <button className="lp-cta-btn chat">
              محادثة مباشرة <FaHeadset />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
}
