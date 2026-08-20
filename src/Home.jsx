import {
  FaSearch,
  FaBuilding,
  FaHandshake,
  FaShieldAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaHome,
  FaKey,
  FaUserPlus,
} from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Home.css";
import heroImg from "./assets/hero.jpg";

const featuredProperties = [
  {
    id: 1,
    title: "شقة فاخرة في الرمال",
    location: "غزة - الرمال",
    price: "250,000$",
    type: "للبيع",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    beds: 3,
    baths: 2,
    area: 150,
  },
  {
    id: 2,
    title: "منزل عائلي في النصر",
    location: "غزة - النصر",
    price: "1,800$ / شهرياً",
    type: "للإيجار",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    beds: 4,
    baths: 3,
    area: 220,
  },
  {
    id: 3,
    title: "شقة في الشيخ رضوان",
    location: "غزة - الشيخ رضوان",
    price: "1,400$ / شهرياً",
    type: "للإيجار",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    beds: 2,
    baths: 1,
    area: 95,
  },
  {
    id: 4,
    title: "أرض سكنية في بيت حانون",
    location: "شمال غزة - بيت حانون",
    price: "95,000$",
    type: "للبيع",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
    beds: 0,
    baths: 0,
    area: 400,
  },
  {
    id: 5,
    title: "شقة في تل الهوا",
    location: "غزة - تل الهوا",
    price: "210,000$",
    type: "للبيع",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    beds: 3,
    baths: 2,
    area: 140,
  },
  {
    id: 6,
    title: "متجر في شارع عمر المختار",
    location: "غزة - وسط المدينة",
    price: "600$ / شهرياً",
    type: "للإيجار",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
    beds: 0,
    baths: 1,
    area: 60,
  },
];

const whyUs = [
  {
    id: 1,
    icon: <FaShieldAlt />,
    title: "منصة موثوقة وآمنة",
    text: "حسابات موثقة وطلبات مضمونة تحميك من الاحتيال أثناء البحث أو التأجير.",
  },
  {
    id: 2,
    icon: <FaHandshake />,
    title: "تواصل مباشر",
    text: "اربط الملاك والمستأجرين مباشرة دون وسطاء، وتفاوض بكل شفافية.",
  },
  {
    id: 3,
    icon: <FaMoneyBillWave />,
    title: "أسعار منافسة",
    text: "عروض محدّثة باستمرار بأسعار تنافسية تناسب جميع الميزانيات.",
  },
  {
    id: 4,
    icon: <FaBuilding />,
    title: "تنوع واسع",
    text: "شقق، منازل، أراضي، مكاتب ومحلات في جميع مناطق قطاع غزة.",
  },
];

const steps = [
  {
    id: 1,
    icon: <FaUserPlus />,
    title: "أنشئ حسابك",
    text: "سجّل كملاك أو مستأجر خلال دقيقة واحدة.",
  },
  {
    id: 2,
    icon: <FaSearch />,
    title: "ابحث أو أضف عقاراً",
    text: "تصفح آلاف العقارات أو انشر عقارك بسهولة.",
  },
  {
    id: 3,
    icon: <FaKey />,
    title: "أتمم صفقتك",
    text: "تواصل مع الطرف الآخر وأتم الصفقة بأمان.",
  },
];

export default function Home({ onHomeClick, onProfileClick, onChangePasswordClick, onLogoutClick }) {
  return (
    <div className="home-page" dir="rtl">
      <Navbar
        onHomeClick={onHomeClick}
        onProfileClick={onProfileClick}
        onChangePasswordClick={onChangePasswordClick}
        onLogoutClick={onLogoutClick}
      />

      {/* Hero */}
      <section
        className="home-hero"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(14, 43, 69, 0.35) 0%, rgba(10, 25, 41, 0.75) 100%), url(${heroImg})`,
        }}
      >
        <div className="hero-content">
          <h1>اعثر على منزلك المثالي في قطاع غزة</h1>
          <p>
            شقق، منازل، أراضي ومكاتب... منصة بيتي تجمع الملاك والمستأجرين
            في مكان واحد بثقة وأمان.
          </p>

          <div className="hero-search">
            <div className="search-input-wrap">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="ابحث عن عقار، منطقة، أو نوع العقار..." />
            </div>
            <button className="search-btn">ابحث</button>
          </div>
        </div>
      </section>

      {/* إحصائيات سريعة */}
      <section className="home-stats">
        <div className="stat-item">
          <strong>+2,500</strong>
          <span>عقار متاح</span>
        </div>
        <div className="stat-item">
          <strong>+1,800</strong>
          <span>مستخدم نشط</span>
        </div>
        <div className="stat-item">
          <strong>+320</strong>
          <span>مكتب عقاري</span>
        </div>
        <div className="stat-item">
          <strong>+95%</strong>
          <span>رضا العملاء</span>
        </div>
      </section>

      {/* العقارات المميزة */}
      <section className="home-section">
        <div className="section-head">
          <h2>عقارات مميزة</h2>
          <a href="#all" className="section-link">عرض الكل ←</a>
        </div>

        <div className="properties-grid">
          {featuredProperties.map((p) => (
            <article key={p.id} className="property-card">
              <div className="property-img-wrap">
                <img src={p.image} alt={p.title} loading="lazy" />
                <span className={`property-type ${p.type === "للبيع" ? "sale" : "rent"}`}>
                  {p.type}
                </span>
              </div>
              <div className="property-body">
                <h3>{p.title}</h3>
                <p className="property-location">
                  <FaMapMarkerAlt /> {p.location}
                </p>
                <div className="property-features">
                  {p.beds > 0 && (
                    <span><FaBed /> {p.beds}</span>
                  )}
                  {p.baths > 0 && (
                    <span><FaBath /> {p.baths}</span>
                  )}
                  {p.area > 0 && (
                    <span><FaRulerCombined /> {p.area}م²</span>
                  )}
                </div>
                <div className="property-price">{p.price}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* لماذا بيتي */}
      <section className="home-section why-section">
        <div className="section-head center">
          <h2>لماذا بيتي؟</h2>
          <p>أفضل منصة عقارية في قطاع غزة</p>
        </div>

        <div className="why-grid">
          {whyUs.map((f) => (
            <article key={f.id} className="why-card">
              <div className="why-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* كيف تعمل المنصة */}
      <section className="home-section steps-section">
        <div className="section-head center">
          <h2>كيف تعمل المنصة؟</h2>
          <p>ثلاث خطوات بسيطة لتحصل على ما تريد</p>
        </div>

        <div className="steps-row">
          {steps.map((s) => (
            <article key={s.id} className="step-card">
              <div className="step-icon">{s.icon}</div>
              <span className="step-num">{s.id}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* دعوة لاتخاذ إجراء */}
      <section className="home-cta">
        <h2>هل تملك عقاراً؟</h2>
        <p>أضف عقارك اليوم واعرضه على آلاف المستخدمين في قطاع غزة.</p>
        <button className="cta-btn"><FaHome /> أضف عقارك الآن</button>
      </section>

      <Footer />
    </div>
  );
}
