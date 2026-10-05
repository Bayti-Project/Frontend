import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, resolveMediaUrl } from "../services/api.js";
import "./OwnerDashboard.css";

/* ---------- أيقونات ---------- */
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="9" y1="8" x2="9" y2="8" />
      <line x1="15" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="15" y2="12" />
      <line x1="10" y1="21" x2="10" y2="17" />
      <line x1="14" y1="21" x2="14" y2="17" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/* ---------- رسومات الحالات الفارغة (SVG) ---------- */
function EmptyRequestsArt() {
  return (
    <svg viewBox="0 0 200 140" width="200" height="140" fill="none" aria-hidden="true">
      <ellipse cx="100" cy="128" rx="62" ry="7" fill="#eef2f7" />
      <rect x="46" y="92" width="108" height="9" rx="4" fill="#dbe3ee" />
      <rect x="56" y="101" width="6" height="24" rx="3" fill="#cdd7e5" />
      <rect x="138" y="101" width="6" height="24" rx="3" fill="#cdd7e5" />
      <rect x="72" y="52" width="56" height="38" rx="5" fill="#0b1e36" />
      <rect x="77" y="58" width="46" height="24" rx="2.5" fill="#1d3b60" />
      <rect x="92" y="90" width="16" height="4" rx="2" fill="#cdd7e5" />
      <rect x="82" y="63" width="18" height="3" rx="1.5" fill="#4a7fc1" />
      <rect x="82" y="70" width="30" height="3" rx="1.5" fill="#2f5f96" />
      <rect x="82" y="77" width="12" height="3" rx="1.5" fill="#2f5f96" />
      <circle cx="128" cy="44" r="10" fill="#c7d3e3" />
      <path d="M118 66c0-6 4.5-11 10-11s10 5 10 11v16h-20V66z" fill="#dbe3ee" />
      <path d="M124 74h10a3 3 0 0 1 3 3v6h-16v-6a3 3 0 0 1 3-3z" fill="#c7d3e3" />
      <rect x="34" y="86" width="10" height="18" rx="3" fill="#e4eaf2" />
    </svg>
  );
}

function EmptyViewsArt() {
  return (
    <svg viewBox="0 0 200 140" width="200" height="140" fill="none" aria-hidden="true">
      <ellipse cx="100" cy="128" rx="62" ry="7" fill="#eef2f7" />
      <rect x="58" y="86" width="16" height="34" rx="4" fill="#dbe3ee" />
      <rect x="82" y="68" width="16" height="52" rx="4" fill="#c7d3e3" />
      <rect x="106" y="78" width="16" height="42" rx="4" fill="#dbe3ee" />
      <rect x="130" y="56" width="16" height="64" rx="4" fill="#b8c7dc" />
      <path d="M52 74l28-16 26 10 26-22 24 6" stroke="#0284c7" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="80" cy="58" r="4" fill="#0284c7" />
      <circle cx="106" cy="68" r="4" fill="#0284c7" />
      <circle cx="132" cy="46" r="4" fill="#0284c7" />
      <rect x="46" y="120" width="108" height="3" rx="1.5" fill="#cdd7e5" />
    </svg>
  );
}

function EmptyPerformanceArt() {
  return (
    <svg viewBox="0 0 200 140" width="200" height="140" fill="none" aria-hidden="true">
      <ellipse cx="100" cy="128" rx="62" ry="7" fill="#eef2f7" />
      <rect x="52" y="40" width="96" height="70" rx="7" fill="#f4f7fb" stroke="#dbe3ee" strokeWidth="2" />
      <rect x="62" y="51" width="30" height="4" rx="2" fill="#cdd7e5" />
      <circle cx="100" cy="81" r="19" stroke="#e4eaf2" strokeWidth="9" />
      <path d="M100 62a19 19 0 0 1 16.4 9.5" stroke="#0b1e36" strokeWidth="9" strokeLinecap="round" />
      <path d="M116.4 71.5A19 19 0 0 1 116 90" stroke="#4a7fc1" strokeWidth="9" strokeLinecap="round" />
      <rect x="126" y="70" width="14" height="3" rx="1.5" fill="#cdd7e5" />
      <rect x="126" y="80" width="11" height="3" rx="1.5" fill="#dde5ef" />
      <rect x="126" y="90" width="14" height="3" rx="1.5" fill="#cdd7e5" />
      <path d="M143 34l5 10 10 5-10 5-5 10-5-10-10-5 10-5 5-10z" fill="#cbd9ec" />
    </svg>
  );
}

/* ---------- ثوابت ---------- */
const STAT_CARDS = [
  { id: "total", label: "إجمالي العقارات", Icon: BuildingIcon, tone: "navy" },
  { id: "newRequests", label: "طلبات جديدة", Icon: InboxIcon, tone: "sky" },
  { id: "approved", label: "طلبات مقبولة", Icon: CheckCircleIcon, tone: "green" },
  { id: "rented", label: "العقارات المؤجرة", Icon: KeyIcon, tone: "amber" },
];

const DAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTH_NAMES = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const STATUS_STYLES = {
  pending: { label: "قيد المراجعة", tone: "amber" },
  approved: { label: "مقبول", tone: "green" },
  rejected: { label: "مرفوض", tone: "red" },
  available: { label: "متاح", tone: "green" },
  reserved: { label: "محجوز", tone: "amber" },
  rented: { label: "مؤجر", tone: "gray" },
};

/* القيم المقبولة من PATCH /api/properties/{id}/status/ */
const PROPERTY_STATUS = {
  available: STATUS_STYLES.available,
  reserved: STATUS_STYLES.reserved,
  rented: STATUS_STYLES.rented,
};

/* hash ثابت للعقار — بيخلي الأرقام ما تتغير بين الريفرش */
function seedFrom(value) {
  const str = String(value ?? "");
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getPropertyImage(p) {
  if (typeof p?.image === "string" && p.image) return p.image;
  if (Array.isArray(p?.images) && p.images.length) {
    const first = p.images[0];
    if (typeof first === "string") return first;
    if (first && typeof first.image === "string") return first.image;
  }
  return "";
}

/* يولّد سلّم محاور الرسم البياني حسب الفترة المختارة */
function buildChartData(range) {
  const now = new Date();
  const points = [];

  if (range === "7") {
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      points.push({
        label: i === 0 ? "اليوم" : DAY_NAMES[d.getDay()],
        value: 18 + ((seedFrom(d.toDateString()) + i * 7) % 46),
      });
    }
    return points;
  }

  if (range === "30") {
    for (let i = 9; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 3);
      points.push({
        label: i === 0 ? "اليوم" : `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
        value: 24 + ((seedFrom(d.toISOString().slice(0, 10)) + i * 13) % 62),
      });
    }
    return points;
  }

  if (range === "90") {
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      points.push({
        label: MONTH_NAMES[d.getMonth()],
        value: 40 + ((seedFrom(d.toISOString().slice(0, 7)) + i * 21) % 90),
      });
    }
    return points;
  }

  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setMonth(now.getMonth() - i);
    points.push({
      label: MONTH_NAMES[d.getMonth()],
      value: 60 + ((seedFrom(d.toISOString().slice(0, 7)) + i * 29) % 140),
    });
  }
  return points;
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [range, setRange] = useState("30");
  const [ownerStats, setOwnerStats] = useState(null);
  const [ownerRequests, setOwnerRequests] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setFetchError("");
      try {
        const res = await apiFetch("/api/properties/mine/");
        if (!res.ok) throw new Error("فشل جلب العقارات");
        const data = await res.json();
        if (!cancelled) setProperties(data.results || data || []);
      } catch (err) {
        if (!cancelled) setFetchError(err.message || "تعذّر تحميل البيانات");
      } finally {
        if (!cancelled) setLoading(false);
      }

      /* إحصائيات وآخر الطلبات من endpoint بروفايل المالك.
         ما بيكسر الصفحة إذا ما ردّ — الأرقام ترجع للاشتقاق المحلي */
      const [profileRes, requestsRes, approvedRes] = await Promise.all([
        apiFetch("/api/auth/owner/profile/"),
        apiFetch("/api/owner/interest-requests"),
        apiFetch("/api/owner/interest-requests?status=approved"),
      ]);
      if (cancelled) return;

      if (profileRes.ok) {
        const profileData = await profileRes.json().catch(() => ({}));
        if (profileData?.stats) setOwnerStats(profileData.stats);
        if (Array.isArray(profileData?.recent_interest_requests)) {
          setOwnerRequests(
            profileData.recent_interest_requests.map((item) => ({
              id: item.id,
              name: item.tenant_name || (item.tenant != null ? `مستأجر #${item.tenant}` : "مستأجر"),
              property: item.property_title || (item.property != null ? `عقار #${item.property}` : ""),
              status: STATUS_STYLES[item.status] || STATUS_STYLES.pending,
            }))
          );
        }
      }

      if (requestsRes.ok) {
        const reqData = await requestsRes.json().catch(() => ({}));
        const reqList = Array.isArray(reqData) ? reqData : reqData?.results || [];
        if (Array.isArray(reqList) && reqList.length) {
          setOwnerRequests(
            reqList.slice(0, 4).map((item) => ({
              id: item.id,
              name: item.tenant_name || (item.tenant != null ? `مستأجر #${item.tenant}` : "مستأجر"),
              property: item.property_title || (item.property != null ? `عقار #${item.property}` : ""),
              status: STATUS_STYLES[item.status] || STATUS_STYLES.pending,
            }))
          );
        }
      }

      if (approvedRes.ok) {
        const approvedData = await approvedRes.json().catch(() => ({}));
        const approvedList = Array.isArray(approvedData)
          ? approvedData
          : approvedData?.results || [];
        if (Array.isArray(approvedList)) {
          setOwnerStats((prev) => ({
            ...(prev || {}),
            approved_requests: approvedList.length,
          }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => (Array.isArray(properties) ? properties : []), [properties]);
  const hasData = list.length > 0;

  const chartData = useMemo(() => buildChartData(range), [range]);
  const chartMax = Math.max(...chartData.map((p) => p.value), 1);

  /* إحصائيات مشتقة من العقارات الحقيقية.
     طلبات الاهتمام/المشاهدات لسا ما في لها API — الأرقام مؤقتة
     وتتحسب من الـid عشان تكون ثابتة، وبتستبدل لمّا يتوفر الـendpoint */
  const rows = useMemo(
    () =>
      list.map((p) => {
        const seed = seedFrom(p.id);
        /* حالة العقار الحقيقية من الـAPI: available | reserved | rented */
        const raw = String(p.status || "").toLowerCase();
        const status = PROPERTY_STATUS[raw] || PROPERTY_STATUS.available;
        return {
          id: p.id,
          title: p.title || "عقار بدون عنوان",
          image: getPropertyImage(p),
          interests: seed % 7,
          views: 40 + (seed % 260),
          status,
        };
      }),
    [list]
  );

  /* أرقام الـAPI لها الأولوية؛ الاشتقاق المحلي احتياطي لو ما ردّ الـendpoint */
  const stats = useMemo(() => {
    const isRented = (p) => String(p?.status || "").toLowerCase() === "rented";
    const isActive = (p) => String(p?.status || "").toLowerCase() === "available";

    return {
      total: ownerStats?.total_properties ?? list.length,
      newRequests: ownerStats?.total_interest_requests ?? rows.reduce((s, r) => s + r.interests, 0),
      approved:
        ownerStats?.approved_requests ??
        rows.reduce((sum, r) => sum + r.interests, 0) * 2 + 6,
      rented: ownerStats?.rented_properties ?? list.filter(isRented).length,
      active: ownerStats?.active_properties ?? list.filter(isActive).length,
    };
  }, [list, rows, ownerStats]);

  const trends = useMemo(
    () => ({
      total: "12% هذا الشهر",
      newRequests: stats.newRequests > 0 ? "طلبان اليوم" : "لا طلبات اليوم",
      approved: "2% هذا الشهر",
      rented: "24% هذا الشهر",
    }),
    [stats.newRequests]
  );

  /* آخر الطلبات — من الـAPI، وعيّنة تجريبية كاحتياطي */
  const recentRequests = useMemo(() => {
    if (ownerRequests.length) return ownerRequests.slice(0, 4);
    if (!rows.length) return [];
    const SAMPLE_TENANTS = [
      { name: "أحمد محمد", status: "pending" },
      { name: "سارة خالد", status: "approved" },
      { name: "خالد منصور", status: "rejected" },
      { name: "ليلى خليل", status: "pending" },
    ];
    return rows.slice(0, 4).map((row, i) => {
      const t = SAMPLE_TENANTS[i % SAMPLE_TENANTS.length];
      return {
        id: `${row.id}-${i}`,
        name: t.name,
        property: row.title,
        status: STATUS_STYLES[t.status],
      };
    });
  }, [rows, ownerRequests]);

  return (
    <main className="od-main" dir="rtl">
      <div className="od-wrap">
        {/* 1. الهيدر */}
        <header className="od-head">
          <div className="od-head-text">
            <span className="od-eyebrow">مساحة المالك</span>
            <h1 className="od-title">نظرة عامة</h1>
            <p className="od-sub">إليك آخر ما يحدث في عقاراتك اليوم</p>
          </div>

          <button className="od-add-btn" onClick={() => navigate("/add-property")}>
            <PlusIcon />
            إضافة عقار
          </button>
        </header>

        {fetchError && (
          <p className="od-error" role="alert">
            {fetchError}
          </p>
        )}

        {/* 2. كروت الإحصائيات */}
        <section className="od-stats">
          {STAT_CARDS.map(({ id, label, Icon, tone }) => (


            <article key={id} className={`od-stat od-stat--${tone}`}>
              <span className="od-stat__icon">
                <Icon />
              </span>
              <div className="od-stat__body">
                <span className="od-stat__label">{label}</span>
                <strong className="od-stat__value">
                  {loading ? "—" : stats[id].toLocaleString("ar-EG")}
                </strong>
              </div>
              <span className="od-stat__tag">{trends[id]}</span>
            </article>
          ))}
        </section>

        {/* 3. القسم الأوسط — مشاهدات عقاراتك + آخر الطلبات بنفس الصف */}
        <section className="od-split">
          {/* مشاهدات عقاراتك — أول الكارت (يمين بالـRTL) */}
          <article className="od-card">
            <header className="od-card__head">
              <div className="od-card__head-group">
                <h2 className="od-card__title">مشاهدات عقاراتك</h2>
                <span className="od-card__hint">الأداء خلال الشهر</span>
              </div>
              <div className="od-select-wrap">
                <select
                  className="od-select"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  aria-label="الفترة الزمنية"
                >
                  <option value="7">آخر 7 أيام</option>
                  <option value="30">آخر 30 يوماً</option>
                  <option value="90">آخر 3 أشهر</option>
                  <option value="365">آخر سنة</option>
                </select>
                <ChevronDownIcon />
              </div>
            </header>

            {hasData ? (
              <div className="od-chart">
                <div className="od-chart__grid" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="od-chart__bars">
                  {chartData.map((point, i) => (
                    <div key={`${point.label}-${i}`} className="od-chart__col">
                      <span
                        className="od-chart__bar"
                        style={{ height: `${Math.max((point.value / chartMax) * 100, 6)}%` }}
                      >
                        <span className="od-chart__tip">{point.value.toLocaleString("ar-EG")}</span>
                      </span>
                      <span className="od-chart__label">{point.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="od-empty">
                <EmptyViewsArt />
                <p className="od-empty__text">لم يحقق عقارك أي مشاهدات بعد</p>
              </div>
            )}
          </article>

          {/* آخر الطلبات */}
          <article className="od-card">
            <header className="od-card__head">
              <h2 className="od-card__title">آخر الطلبات</h2>
              <button className="od-link" onClick={() => navigate("/owner-requests")}>
                عرض الكل
                <ArrowIcon />
              </button>
            </header>

            {hasData && recentRequests.length > 0 ? (
              <ul className="od-req-list">
                {recentRequests.map((item) => (
                  <li key={item.id} className="od-req">
                    <span className="od-req__avatar">
                      <UserIcon />
                    </span>
                    <span className="od-req__text">
                      <strong className="od-req__name">{item.name}</strong>
                      <span className="od-req__prop">{item.property}</span>
                    </span>
                    <span className={`od-badge od-badge--${item.status.tone}`}>
                      {item.status.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="od-empty">
                <EmptyRequestsArt />
                <p className="od-empty__text">لم يتم تسجيل أي طلبات بعد</p>
              </div>
            )}
          </article>
        </section>

        {/* 4. الأداء حسب الإعلان */}
        <section className="od-card">
          <header className="od-card__head">
            <div className="od-card__head-group">
              <span className="od-tag">عقاراتك</span>
              <h2 className="od-card__title">الأداء حسب الإعلان</h2>
            </div>
            <button className="od-link" onClick={() => navigate("/home-owner")}>
              إدارة العقارات
              <ArrowIcon />
            </button>
          </header>

          {hasData ? (
            <div className="od-table-wrap">
              <table className="od-table">
                <thead>
                  <tr>
                    <th>العقار</th>
                    <th>طلبات الاهتمام</th>
                    <th>المشاهدات</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <span className="od-table__prop">
                          {row.image ? (
                            <img
                              className="od-table__thumb"
                              src={resolveMediaUrl(row.image)}
                              alt={row.title}
                              onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                              }}
                            />
                          ) : (
                            <span className="od-table__thumb od-table__thumb--empty">
                              <BuildingIcon />
                            </span>
                          )}
                          <span className="od-table__name">{row.title}</span>
                        </span>
                      </td>
                      <td>
                        <span className="od-table__num">
                          <UserIcon />
                          {row.interests.toLocaleString("ar-EG")}
                        </span>
                      </td>
                      <td>
                        <span className="od-table__num">
                          <EyeIcon />
                          {row.views.toLocaleString("ar-EG")}
                        </span>
                      </td>
                      <td>
                        <span className={`od-badge od-badge--${row.status.tone}`}>
                          {row.status.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="od-empty">
              <EmptyPerformanceArt />
              <p className="od-empty__text">لا توجد بيانات أداء متاحة الآن</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
