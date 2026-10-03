import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaBookmark,
  FaShare,
  FaCheck,
  FaArrowLeft,
  FaPhone,
  FaQuoteLeft,
  FaChevronRight,
  FaChevronLeft,
  FaBuilding,
  FaShieldAlt,
  FaMoneyBillWave,
  FaHeadset,
} from "react-icons/fa";
import "./homeTenant.css";
import whoImg from "../components/who.jpg";
import PropertySearchBar from "../components/PropertySearchBar";
import { useSaved, toggleSaved } from "../state/savedProperties";
import SharePropertyModal from "../components/SharePropertyModal";
import AuthPromptModal from "../components/AuthPromptModal";
import LandingFooter from "../components/LandingFooter";
import { homeProperties, hasPropertyImage, toPropertyCard } from "../services/api.js";

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
  onPropertyClick,
    onSearchClick,
    onSavedClick,
    onRequestsClick,
  }) {
    const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const savedItems = useSaved();
  const savedIds = new Set(savedItems.map((s) => String(s.id)));
  const [prompt, setPrompt] = useState(null);
  const [promptIntent, setPromptIntent] = useState("details");
  const [shareTarget, setShareTarget] = useState(null);
  const [properties, setProperties] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  useEffect(() => {
    let active = true;
    homeProperties()
      .then(async (res) => {
        if (!res.ok) throw new Error("تعذر تحميل العقارات");
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        const results = Array.isArray(data?.results) ? data.results.filter(hasPropertyImage) : [];
        setProperties(
          results
            .slice()
            .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
            .slice(0, 3)
            .map(toPropertyCard)
        );
      })
      .catch((err) => {
        if (active) setListError(err?.message || "تعذر تحميل العقارات");
      })
      .finally(() => {
        if (active) setListLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function openAuthPrompt(property, intent) {
    setPromptIntent(intent);
    setPrompt(property);
  }

  function closeAuthPrompt() {
    setPrompt(null);
    setPromptIntent("details");
  }

  // الخيارات لقائمة البحث (تُمرَّر للمكوّن القابل لإعادة الاستخدام)
  const regions = ['شمال غزة', 'غزة', 'وسط غزة', 'خانيونس', 'رفح', 'كل المناطق'];
  const propertyTypes = ['شقق سكنية', 'قطعة أرض', 'فيلا', 'حاصل', 'بركس', 'محل تجاري'];
  const priceRanges = [
    'اقل من 500 ₪',
    '500 ₪',
    '1,000 ₪',
    '1,500 ₪',
    '2,000 ₪',
    '2,500 ₪',
    '2,500 ₪ فاكثر',
    'بدون حد اقصى'
  ];
  const roomOptions = ['1', '2', '3', '4+ فما فوق'];

  const govSlugs = {
    'شمال غزة': 'north_gaza',
    'غزة': 'gaza',
    'وسط غزة': 'middle_gaza',
    'خانيونس': 'khan_younis',
    'رفح': 'rafah',
  };
  const typeSlugs = {
    'شقق سكنية': 'apartment',
    'فيلا': 'villa',
    'قطعة أرض': 'land',
    'حاصل': 'store_room',
    'بركس': 'barracks',
    'محل تجاري': 'shop',
  };
  const priceMax = {
    'اقل من 500 ₪': '500',
    '500 ₪': '1000',
    '1,000 ₪': '1500',
    '1,500 ₪': '2000',
    '2,000 ₪': '2500',
    '2,500 ₪': '3000',
  };

  const handleSearch = (filters) => {
    const params = new URLSearchParams();
    const gov = govSlugs[filters.region];
    if (gov) params.append('governorate', gov);
    const type = typeSlugs[filters.propertyType];
    if (type) params.append('property_type', type);
    if (filters.rooms && filters.rooms !== '4+ فما فوق') params.append('bedrooms', filters.rooms);
    if (filters.priceRange) {
      if (filters.priceRange === '2,500 ₪ فاكثر') {
        params.append('min_price', '2500');
      } else if (priceMax[filters.priceRange]) {
        params.append('max_price', priceMax[filters.priceRange]);
      }
    }
    navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="lp-page" dir="rtl">
      {/* Header */}
      <Navbar
        onHomeClick={onHomeClick}
        onProfileClick={onProfileClick}
        onChangePasswordClick={onChangePasswordClick}
        onLogoutClick={onLogoutClick}
        onSearchClick={onSearchClick}
        onSavedClick={onSavedClick}
        onRequestsClick={onRequestsClick}
      />

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-overlay" />
        <div className="lp-hero-content">
          <h1>ابحث عن عقارك المثالي في غزة</h1>
          <p>اكتشف آلاف العقارات المتاحة في مختلف مناطق قطاع غزة بأسعار تنافسية وموثوقة.</p>

          {/* شريط البحث القابل لإعادة الاستخدام */}
          <div className="w-full max-w-5xl mx-auto mt-6">
            <PropertySearchBar
              regions={regions}
              propertyTypes={propertyTypes}
              priceRanges={priceRanges}
              roomOptions={roomOptions}
              onSearch={handleSearch}
            />
          </div>

        </div>
      </section>

      {/* Featured Properties */}
      <section id="top" className="lp-section">
        <div className="lp-section-head">
          <h2>أحدث العقارات</h2>
          <button
            type="button"
            className="lp-section-link"
            onClick={() => navigate("/search", { state: { landingNav: true } })}
          >
            مشاهدة الكل <FaArrowLeft />
          </button>
        </div>
        {listLoading ? (
          <p className="lp-properties-msg">جاري تحميل العقارات...</p>
        ) : listError ? (
          <p className="lp-properties-msg">{listError}</p>
        ) : properties.length === 0 ? (
          <p className="lp-properties-msg">لا توجد عقارات متاحة حالياً.</p>
        ) : (
        <div className="lp-properties-grid">
          {properties.map((p) => (
            <article key={p.id} className="lp-property-card">
              <div className="lp-property-img-wrap">
                <img src={p.image} alt={p.title} />
                {p.typeLabel && (
                  <span className={`lp-property-type prop`}>{p.typeLabel}</span>
                )}
                <button
                  className="lp-card-action share"
                  type="button"
                  aria-label="مشاركة العقار"
                  onClick={() => setShareTarget(p)}
                >
                  <FaShare />
                </button>
                <button
                  className={`lp-card-action save${savedIds.has(String(p.id)) ? " active" : ""}`}
                  type="button"
                  aria-label="حفظ العقار"
                  onClick={() => {
                      /* المستأجر مسجل → ينحفظ مباشرة، بدون نافذة تسجيل */
                      if (localStorage.getItem("access_token")) toggleSaved(p);
                      else openAuthPrompt(p, "save");
                    }}
                >
                  <FaBookmark />
                </button>
              </div>
              <div className="lp-property-body">
                <h3>{p.title}</h3>
                <div className="lp-property-meta">
                  <p className="lp-property-location">
                    <FaMapMarkerAlt /> {p.location}
                  </p>
                  <span className="lp-property-price">{p.priceLabel}</span>
                </div>
                <div className="lp-property-features">
                  {p.beds > 0 && <span><FaBed /> {p.beds} غرف</span>}
                  {p.baths > 0 && <span><FaBath /> {p.baths} حمام</span>}
                  {p.size > 0 && <span><FaRulerCombined /> {p.size}م²</span>}
                </div>
                <div className="lp-property-footer">
                  <button
                    className="lp-property-btn"
                    onClick={() => onPropertyClick && onPropertyClick(p.id)}
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        )}
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="lp-section lp-steps-section">
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
      <section id="about-us" className="lp-section lp-about-section">
        <div className="lp-about-grid">
          <div className="lp-about-img">
            <img src={whoImg} alt="فريق بيتي" />
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
                  <img src={t.image} alt={t.name} />
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
      <section id="support" className="lp-cta-wrapper">
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
      <LandingFooter />

      <AuthPromptModal
        property={prompt}
        intent={promptIntent}
        onClose={closeAuthPrompt}
      />

      <SharePropertyModal property={shareTarget} onClose={() => setShareTarget(null)} />
    </div>
  );
}