import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { FaThLarge, FaListUl, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaShare, FaBookmark, FaBed, FaBath, FaRulerCombined } from "react-icons/fa";
import AuthPromptModal from "../components/AuthPromptModal";
import {
  searchProperties,
  resolveMediaUrl,
  hasPropertyImage,
  getPropertyImagePath,
  PROPERTY_TYPE_LABELS,
  STATUS_LABELS,
} from "../services/api.js";
import Navbar from "../components/Navbar";
import LandingFooter from "../components/LandingFooter";
import LandingHeader from "../components/LandingHeader";
import PropertySearchBar from "../components/PropertySearchBar";
import SharePropertyModal from "../components/SharePropertyModal";
import { useSaved, addSaved, removeSaved } from "../state/savedProperties";
import "./search.css";

const PAGE_SIZE = 6;

// الزائر غير المسجّل لا يستطيع فتح التفاصيل أو الحفظ
const isLoggedIn = () => Boolean(localStorage.getItem("access_token"));

const ELECTRICITY_OPTIONS = [
  { label: "الكهرباء العامة", value: "main_grid" },
  { label: "طاقة شمسية", value: "solar" },
  { label: "مولد كهربائي", value: "generator" },
];

const WATER_OPTIONS = [
  { label: "خزان", value: "tank" },
  { label: "بئر", value: "well" },
];

// المناطق الرئيسية في كل محافظة (لحقل "المدينة والمنطقة الرئيسية")
const AREAS_BY_GOV = [
  {
    govValue: "north_gaza",
    govLabel: "شمال غزة",
    areas: [
      { value: "beit_lahia", label: "بيت لاهيا" },
      { value: "umm_al_nasr", label: "أم النصر" },
      { value: "jabalia_camp", label: "مخيم جباليا" },
      { value: "jabalia", label: "جباليا" },
      { value: "beit_hanoun", label: "بيت حانون" },
    ],
  },
  {
    govValue: "gaza",
    govLabel: "غزة",
    areas: [
      { value: "gaza_city", label: "غزة" },
      { value: "shati_camp", label: "الشاطئ" },
      { value: "mughraqa", label: "المغراقة" },
      { value: "juhr_al_dik", label: "جحر الديك" },
      { value: "zahra", label: "الزهراء" },
      { value: "masdar", label: "مصدر" },
    ],
  },
  {
    govValue: "middle_gaza",
    govLabel: "وسط غزة",
    areas: [
      { value: "nuseirat", label: "النصيرات" },
      { value: "nuseirat_camp", label: "مخيم النصيرات" },
      { value: "bureij", label: "البريج" },
      { value: "zawayda", label: "الزوايدة" },
      { value: "maghazi", label: "المغازي" },
      { value: "maghazi_camp", label: "مخيم المغازي" },
      { value: "wadi_salqa", label: "وادي السلقا" },
      { value: "deir_al_balah_camp", label: "مخيم دير البلح" },
      { value: "deir_al_balah", label: "دير البلح" },
    ],
  },
  {
    govValue: "khan_younis",
    govLabel: "خانيونس",
    areas: [
      { value: "qarara", label: "القرارة" },
      { value: "khan_younis_city", label: "خان يونس" },
      { value: "khan_younis_camp", label: "مخيم خان يونس" },
      { value: "bani_suheila", label: "بني سهيلا" },
      { value: "abasan_kabira", label: "عبسان الكبيرة" },
      { value: "abasan_saghira", label: "عبسان الصغيرة" },
      { value: "khuzaa", label: "خزاعة" },
      { value: "fukhari", label: "الفخاري" },
    ],
  },
  {
    govValue: "rafah",
    govLabel: "رفح",
    areas: [
      { value: "rafah_city", label: "رفح" },
      { value: "rafah_camp", label: "مخيم رفح" },
      { value: "nasr", label: "النصر" },
      { value: "shawka", label: "الشوكة" },
    ],
  },
];

const LOCATION_OPTIONS = AREAS_BY_GOV.flatMap((gov) =>
  gov.areas.map((area) => ({
    key: `${gov.govValue}__${area.value}`,
    label: `${gov.govLabel} - ${area.label}`,
    gov: gov.govValue,
    area: area.value,
  }))
);

export function FilterSidebar({ onApply, onReset }) {
  const [electric, setElectric] = useState([]);
  const [water, setWater] = useState([]);
  const [locationKey, setLocationKey] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const toggle = (list, val) =>
    list.includes(val) ? list.filter((x) => x !== val) : [...list, val];

  const apply = () => {
    const loc = LOCATION_OPTIONS.find((o) => o.key === locationKey);
    onApply({
      cityArea: loc ? { gov: loc.gov, area: loc.area } : null,
      neighborhood: neighborhood.trim(),
      electric,
      water,
    });
  };

  const clearAll = () => {
    setElectric([]);
    setWater([]);
    setLocationKey("");
    setNeighborhood("");
    onReset();
  };

  return (
    <aside className="props-sidebar">
      <div className="props-sidebar-head">
        <h3>تصفية النتائج</h3>
        <button type="button" onClick={onReset}>إعادة تعيين</button>
      </div>

      <div className="props-filter-group">
        <h4>المدينة والمنطقة الرئيسية</h4>
        <select
          className="props-select"
          value={locationKey}
          onChange={(e) => setLocationKey(e.target.value)}
        >
          <option value="">كل المواقع</option>
          {LOCATION_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="props-filter-group">
        <h4>الحي الفرعي</h4>
        <input
          className="props-input"
          type="text"
          placeholder="مثال: الرمال الشمالي"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
        />
      </div>

      <div className="props-filter-group">
        <h4>الكهرباء</h4>
        {ELECTRICITY_OPTIONS.map((o) => (
          <label className="props-check" key={o.value}>
            <input
              type="checkbox"
              checked={electric.includes(o.value)}
              onChange={() => setElectric(toggle(electric, o.value))}
            />
            <span className="fake-check" />
            {o.label}
          </label>
        ))}
      </div>

      <div className="props-filter-group">
        <h4>المياه</h4>
        {WATER_OPTIONS.map((o) => (
          <label className="props-check" key={o.value}>
            <input
              type="checkbox"
              checked={water.includes(o.value)}
              onChange={() => setWater(toggle(water, o.value))}
            />
            <span className="fake-check" />
            {o.label}
          </label>
        ))}
      </div>

      <div className="props-sidebar-actions">
        <button className="props-apply-btn" type="button" onClick={apply}>
          تطبيق الفلاتر
        </button>
        <button className="props-reset-btn" type="button" onClick={clearAll}>
          مسح الكل
        </button>
      </div>
    </aside>
  );
}

function PropertyCard({ property, onClick, onSave }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const savedItems = useSaved();
  const isSaved = savedItems.some((s) => String(s.id) === String(property.id));

  const typeLabel = PROPERTY_TYPE_LABELS[property.property_type || property.type] || "";
  const statusLabel = STATUS_LABELS[property.status] || (property.listing_type || property.purpose || "");
  const badge = typeLabel || statusLabel;

  const location =
    property.location ||
    property.address ||
    [property.neighborhood, property.area, property.governorate].filter(Boolean).join(", ") ||
    property.governorate ||
    "";

  const imgUrl = resolveMediaUrl(getPropertyImagePath(property));
  const beds = property.bedrooms || 0;
  const baths = property.bathrooms || 0;
  const area = property.area_sqm || property.area || 0;

  return (
    <article className="props-card">
      <div className="props-card-img">
        {imgUrl && !imgFailed ? (
          <img src={imgUrl} alt={property.title} onError={() => setImgFailed(true)} />
        ) : (
          <div style={{ height: "100%", minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "#eef1f4", color: "#718096", fontSize: 14 }}>
            لا توجد صورة
          </div>
        )}
        {badge && <span className="props-card-badge">{badge}</span>}
        <button
          className="props-card-icon share"
          type="button"
          aria-label="مشاركة"
          onClick={(e) => {
            e.stopPropagation();
            setShareTarget(property);
          }}
        >
          <FaShare />
        </button>
        <button
          className={`props-card-icon saved${isSaved ? " active" : ""}`}
          type="button"
          aria-label={isSaved ? "إزالة من المحفوظات" : "حفظ"}
          onClick={(e) => {
            e.stopPropagation();
            onSave?.(property);
          }}
        >
          <FaBookmark />
        </button>
      </div>
      <div className="props-card-body">
        <h3>{property.title || "عقار"}</h3>
        <p className="props-card-loc">
          <FaMapMarkerAlt /> {location || "غزة"}
        </p>
        <p className="props-card-price">₪{Number(property.price || 0).toLocaleString()}</p>
        <div className="props-card-meta">
          {beds > 0 && (
            <span><FaBed /> {beds} غرف</span>
          )}
          {baths > 0 && (
            <span><FaBath /> {baths} حمام</span>
          )}
          {area > 0 && (
            <span><FaRulerCombined /> {area}م²</span>
          )}
        </div>
        <button type="button" className="props-card-btn" onClick={() => onClick?.(property)}>
          عرض التفاصيل
        </button>
      </div>

      <SharePropertyModal property={shareTarget} onClose={() => setShareTarget(null)} />
    </article>
  );
}

function PropertyGrid({ properties, view, onPropertyClick, onSave }) {
  if (view === "map") {
    return (
      <div className="props-map-placeholder">
        <FaMapMarkerAlt size={34} />
        <p>عرض الخريطة</p>
        <span>اضغط على أي عقار لمعرفة تفاصيله على الخريطة</span>
      </div>
    );
  }

  return (
    <div className={`props-grid${view === "list" ? " list-view" : ""}`}>
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} onClick={onPropertyClick} onSave={onSave} />
      ))}
    </div>
  );
}

function Pagination({ current, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="props-pagination">
      <button
        className="props-page-arrow"
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="السابق"
      >
        <FaChevronRight />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={`props-page-num${n === current ? " active" : ""}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <button
        className="props-page-arrow"
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
        aria-label="التالي"
      >
        <FaChevronLeft />
      </button>
    </div>
  );
}

function SuggestionBar({ suggestions, onPick }) {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div className="props-sidebar">
      <div className="props-sidebar-head">
        <h3>بحث ذكي</h3>
      </div>
      <p style={{ fontSize: 13, color: "#718096", margin: "0 0 12px" }}>
        لا توجد نتائج لهذه المنطقة، هل تقصد؟
      </p>
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          className="props-apply-btn"
          style={{ marginBottom: 8, width: "100%" }}
          onClick={() => onPick(s)}
        >
          <FaMapMarkerAlt style={{ marginLeft: 6 }} /> {s}
        </button>
      ))}
    </div>
  );
}

function SearchPage({ onHomeClick, onSearchClick, onProfileClick, onChangePasswordClick, onLogoutClick, onSavedClick, onRequestsClick }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const showLandingNav = Boolean(location.state?.landingNav);
  const currentSearch = searchParams.toString();

  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("الأحدث إضافة");
  const [page, setPage] = useState(1);
  const [prompt, setPrompt] = useState(null);
  const savedItems = useSaved();
  const savedIds = new Set(savedItems.map((s) => String(s.id)));

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
  const reverseGovSlugs = {
    north_gaza: 'شمال غزة',
    gaza: 'غزة',
    middle_gaza: 'وسط غزة',
    khan_younis: 'خانيونس',
    rafah: 'رفح',
  };
  const reverseTypeSlugs = {
    apartment: 'شقق سكنية',
    villa: 'فيلا',
    land: 'قطعة أرض',
    store_room: 'حاصل',
    barracks: 'بركس',
    shop: 'محل تجاري',
  };
  const reversePriceMax = {
    '500': 'اقل من 500 ₪',
    '1000': '500 ₪',
    '1500': '1,000 ₪',
    '2000': '1,500 ₪',
    '2500': '2,000 ₪',
    '3000': '2,500 ₪',
  };
  const initialBar = {
    region: reverseGovSlugs[searchParams.get("governorate") || ""] || "",
    propertyType: reverseTypeSlugs[searchParams.get("property_type") || ""] || "",
    rooms: searchParams.get("bedrooms") || "",
    priceRange: searchParams.get("min_price")
      ? "2,500 ₪ فاكثر"
      : reversePriceMax[searchParams.get("max_price") || ""] || "",
  };

  // حالة البحث الأساسية (من الـ Hero أو من رابط مباشر)
  const [query, setQuery] = useState({
    governorate: searchParams.get("governorate") || "",
    property_type: searchParams.get("property_type") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    suggestionsArea: "",
  });

  const [filters, setFilters] = useState(null); // {electric: [], water: []}
  const [properties, setProperties] = useState([]);
  const [count, setCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // جلب النتائج من الـ API عند تغيّر معايير البحث أو الصفحة
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    const params = { ...query, page };
    if (filters?.electric?.length) params.electricity = filters.electric;
    if (filters?.water?.length) params.water = filters.water;
    if (filters?.cityArea?.gov) params.governorate = filters.cityArea.gov;
    if (filters?.cityArea?.area) params.area = filters.cityArea.area;
    if (filters?.neighborhood) params.neighborhood = filters.neighborhood;
    delete params.suggestionsArea;
    if (query.suggestionsArea) params.area = query.suggestionsArea;

    searchProperties(params)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error("فشل البحث في العقارات");
        const data = await res.json().catch(() => ({}));
        // العقارات بدون صور ما بتنعرض
        const results = Array.isArray(data.results)
          ? data.results.filter(hasPropertyImage)
          : [];
        const nextSuggestions = Array.isArray(data.suggestions) ? data.suggestions : [];

        setProperties(results);
        setCount(results.length);
        setSuggestions(nextSuggestions);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "تعذر الاتصال بالخادم");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [query, filters, page, currentSearch, navigate]);

  // الترتيب يتم محليًا بعد الجلب
  const sorted = useMemo(() => {
    const list = [...properties];
    if (sortBy === "السعر الأقل أولاً") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "السعر الأعلى أولاً") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }
    return list;
  }, [properties, sortBy]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

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
    setQuery({
      governorate: params.get('governorate') || '',
      property_type: params.get('property_type') || '',
      bedrooms: params.get('bedrooms') || '',
      min_price: params.get('min_price') || '',
      max_price: params.get('max_price') || '',
      suggestionsArea: '',
    });
    setFilters(null);
    setPage(1);
  };

  const handleApply = (f) => {
    setFilters(f);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(null);
    setPage(1);
  };

  const handleSuggestion = (area) => {
    setQuery((prev) => ({ ...prev, governorate: "", suggestionsArea: area }));
    setFilters(null);
    setPage(1);
  };

  const handlePropertyClick = (property) => {
    if (!isLoggedIn()) {
      setPrompt({ property, intent: "details" });
      return;
    }
    navigate(`/property/${property.id}`);
  };

  // زر الحفظ في الكارد: يمنع الحفظ للزائر ويطلب حساباً
  const handleSaveClick = (property) => {
    if (!isLoggedIn()) {
      setPrompt({ property, intent: "save" });
      return;
    }
    const saved = savedIds.has(String(property.id));
    if (saved) removeSaved(property.id);
    else addSaved(property);
  };

  return (
    <div className="page" dir="rtl">
      {showLandingNav ? (
        <LandingHeader linkBase="/home" />
      ) : (
        <Navbar
          onHomeClick={onHomeClick}
          onSearchClick={onSearchClick}
          onProfileClick={onProfileClick}
          onChangePasswordClick={onChangePasswordClick}
          onLogoutClick={onLogoutClick}
          onSavedClick={onSavedClick}
          onRequestsClick={onRequestsClick}
        />
      )}

      <section className="props-hero">
        <div className="props-hero-pattern" />
        <div className="props-hero-content">
          <h1>ابحث عن عقارك المثالي في غزة</h1>
          <p>اكتشف آلاف العقارات المتاحة في مختلف مناطق قطاع غزة بأسعار تنافسية وموثوقة.</p>

          <div className="w-full max-w-5xl mx-auto mt-6">
            <PropertySearchBar
              regions={regions}
              propertyTypes={propertyTypes}
              priceRanges={priceRanges}
              roomOptions={roomOptions}
              initial={initialBar}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>

      <main className="props-main">
        <div className="props-results-head">
          <div className="props-results-title">
            <h2>نتائج البحث عن عقارات</h2>
            <span className="props-badge">
              <FaMapMarkerAlt /> قطاع غزة
            </span>
            <p>
              {error
                ? "تعذر تحميل النتائج"
                : loading
                  ? "جاري البحث عن العقارات..."
                  : `تم العثور على ${count} عقار متاح`}
            </p>
          </div>

          <div className="props-results-controls">
            <span className="props-sort-label">الترتيب حسب:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option>الأحدث إضافة</option>
              <option>السعر الأقل أولاً</option>
              <option>السعر الأعلى أولاً</option>
            </select>

            <div className="props-view-btns">
              <button
                className={view === "grid" ? "active" : ""}
                onClick={() => setView("grid")}
                aria-label="عرض شبكي"
              >
                <FaThLarge />
              </button>
              <button
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
                aria-label="عرض قائمة"
              >
                <FaListUl />
              </button>
              <button
                className={view === "map" ? "active" : ""}
                onClick={() => setView("map")}
                aria-label="عرض الخريطة"
              >
                <FaMapMarkerAlt />
              </button>
            </div>
          </div>
        </div>

        <div className="props-layout">
          <FilterSidebar onApply={handleApply} onReset={handleReset} />

          <div className="props-results">
            {error ? (
              <div className="props-map-placeholder" style={{ minHeight: 200 }}>
                <p>{error}</p>
                <span>يرجى المحاولة مرة أخرى</span>
              </div>
            ) : loading ? (
              <div className="props-map-placeholder" style={{ minHeight: 200 }}>
                <p>جاري تحميل النتائج...</p>
              </div>
            ) : filteredCount(sorted) === 0 ? (
              suggestions.length > 0 ? (
                <div style={{ width: "100%" }}>
                  <SuggestionBar suggestions={suggestions} onPick={handleSuggestion} />
                </div>
              ) : (
                <div className="props-map-placeholder" style={{ minHeight: 200 }}>
                  <p>لا توجد عقارات مطابقة</p>
                  <span>جرّب تعديل معايير البحث</span>
                </div>
              )
            ) : (
              <>
                <PropertyGrid
                  properties={sorted}
                  view={view}
                  onPropertyClick={handlePropertyClick}
                  onSave={handleSaveClick}
                />
                <Pagination current={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>
        </div>
      </main>

      <LandingFooter />

      <AuthPromptModal
        property={prompt?.property}
        intent={prompt?.intent}
        onClose={() => setPrompt(null)}
      />
    </div>
  );
}

function filteredCount(list) {
  return list.length;
}

export default SearchPage;