import React from "react";
import "./NotFoundPage.css";
import notFoundHero from "./assets/listings/not-found-hero.jpg";
import apartmentSeaView from "./assets/listings/apartment-sea-view.png";
import villaExterior from "./assets/listings/villa-exterior.png";
import officeSpace from "./assets/listings/office-space.png";

// نفس عقارات قسم "اقتراحات قد تعجبك" وبنفس ترتيب الفيجما (من اليمين لليسار):
// شقة مطلة على البحر ← فيلا ← مكتب تجاري
const recommendedProperties = [
  {
    id: "rec-apartment",
    title: "شقة فاخرة مطلة على البحر",
    location: "غزة، الرمال الجنوبي",
    price: 4000,
    currency: "₪",
    bedrooms: 3,
    bathrooms: 2,
    area: 160,
    image: apartmentSeaView,
  },
  {
    id: "rec-villa",
    title: "فيلا عصرية مع حديقة",
    location: "غزة، تل الهوا",
    price: 80000,
    currency: "$",
    bedrooms: 4,
    bathrooms: 3,
    area: 260,
    image: villaExterior,
  },
  {
    id: "rec-office",
    title: "مكتب تجاري في موقع حيوي",
    location: "غزة، النصر",
    price: 40000,
    currency: "$",
    bedrooms: 3,
    bathrooms: 2,
    area: 160,
    image: officeSpace,
    imagePosition: "50% 58%",
  },
];

/* ---------- أيقونات ---------- */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ArrowLeftSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <g transform="translate(0.5,6) scale(0.6)" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </g>
      <g transform="translate(12,0.5) scale(0.42)" fill="currentColor">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </g>
      <g transform="translate(12.5,13) scale(0.3)" fill="currentColor">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </g>
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="2.6" stroke="#1F2937" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.6" stroke="#1F2937" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="2.6" stroke="#1F2937" strokeWidth="1.8" />
      <path d="m8.3 13.3 7.4 4.3M15.7 6.4l-7.4 4.3" stroke="#1F2937" strokeWidth="1.8" />
    </svg>
  );
}
function BookmarkOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M6.5 3h11v18l-5.5-4.2L6.5 21V3Z" stroke="#1F2937" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
        stroke="#1F2937"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="3" stroke="#1F2937" strokeWidth="1.8" />
    </svg>
  );
}
function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"
        stroke="#0282AD"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M3.5 13h17v2a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 15v-2ZM7 19.5V21M17 19.5V21"
        stroke="#0282AD"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 13V6.5A2.5 2.5 0 0 0 15.5 4H14" stroke="#0282AD" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="7.5" cy="7.8" r="1.6" fill="#0282AD" />
      <path d="M5.5 13v-1.2a2 2 0 0 1 4 0V13" stroke="#0282AD" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function AreaIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"
        stroke="#0282AD"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NotFoundPage({ onOpenDetails, onBrowseAll, onGoSearch }) {
  return (
    <main className="notfound-page">
      <div className="notfound-inner">
        {/* ---------- البطل: 404 ---------- */}
        <section className="notfound-hero" style={{ backgroundImage: `url(${notFoundHero})` }}>
          <p className="notfound-code">404</p>
          <h1 className="notfound-title">عذراً، لم نتمكن من العثور على هذا العقار</h1>
          <p className="notfound-desc">
            يبدو أن الرابط الذي اتبعته غير صحيح أو انتهت صلاحيته، أو قد يكون مالك العقار قد قام بحذف
            الإعلان بعد إتمام عقد الإيجار بنجاح. لا تقلق، تتوفر الآن خيارات سكنية آمنة وموثقة بانتظارك
            في مختلف مناطق القطاع.
          </p>
          <div className="notfound-actions">
            <button type="button" className="notfound-btn notfound-btn-primary" onClick={onGoSearch}>
              الذهاب الى البحث
              <SearchIcon />
            </button>
            <button type="button" className="notfound-btn notfound-btn-outline" onClick={onBrowseAll}>
              تصفح كافة العقارات
            </button>
          </div>
        </section>

        {/* ---------- عقارات مقترحة قد تهمك للبدء ---------- */}
        <div className="nf-recommend">
          <div className="nf-recommend-head">
            <div className="nf-recommend-heading">
              <h3>
                <SparkleIcon />
                عقارات مقترحة قد تهمك للبدء
              </h3>
              <p>شقق ومنازل موثقة ومتاحة للإيجار حالياً يمكنك حفظها بالضغط على رمز القلب</p>
            </div>
            <a href="#" className="nf-recommend-link">
              عرض جميع عقارات غزة المتاحة
              <ArrowLeftSmallIcon />
            </a>
          </div>

          <div className="nf-grid">
            {recommendedProperties.map((property) => (
              <article key={property.id} className="nf-card">
                <div className="nf-card-media">
                  <img
                    src={property.image}
                    alt={property.title}
                    style={property.imagePosition ? { objectPosition: property.imagePosition } : undefined}
                  />
                  <span className="nf-badge">للايجار</span>
                  <div className="nf-card-tools">
                    <button type="button" className="nf-round-btn" aria-label="مشاركة">
                      <ShareIcon />
                    </button>
                    <button type="button" className="nf-round-btn" aria-label="حفظ العقار">
                      <BookmarkOutlineIcon />
                    </button>
                  </div>
                </div>

                <div className="nf-card-body">
                  <h3 className="nf-card-title">{property.title}</h3>

                  <div className="nf-meta-row">
                    <span className="nf-location">
                      <PinIcon />
                      {property.location}
                    </span>
                    <span className="nf-price" dir="ltr">
                      {property.currency}
                      {property.price.toLocaleString("en-US")}
                    </span>
                  </div>

                  <div className="nf-divider" />

                  <div className="nf-stats">
                    <span className="nf-stat">
                      <BedIcon />
                      {property.bedrooms}
                    </span>
                    <span className="nf-stat">
                      <BathIcon />
                      {property.bathrooms}
                    </span>
                    <span className="nf-stat">
                      <AreaIcon />
                      {property.area}م²
                    </span>
                  </div>

                  <button type="button" className="nf-view-btn" onClick={onOpenDetails}>
                    عرض التفاصيل
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
