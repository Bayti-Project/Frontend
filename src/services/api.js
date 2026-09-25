export const API_HOST = 'https://bayti-backend.onrender.com';
export const API_BASE = API_HOST; // اجعليها تستخدم API_HOST مباشرة

// يحوّل أي مسار صورة من الخادم (مثل /profile_images/x.png) إلى رابط كامل
export function resolveMediaUrl(path) {
  if (!path) return '';
  if (/^(https?:\/\/|data:)/i.test(path)) return path;
  return API_HOST + (path.startsWith('/') ? path : `/${path}`);
}

export function authHeaders(json = true) {
  const h = {
    Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
  };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

// ─── إدارة الجلسة: حفظ بيانات الدخول لاستعادة التوكن تلقائياً عند 401 ───
const CREDS_KEY = 'bayti_creds';

export function storeCredentials(email, password) {
  sessionStorage.setItem(CREDS_KEY, JSON.stringify({ email, password }));
}

export function clearCredentials() {
  sessionStorage.removeItem(CREDS_KEY);
}

function getCredentials() {
  try {
    return JSON.parse(sessionStorage.getItem(CREDS_KEY) || 'null');
  } catch {
    return null;
  }
}

async function refreshTokens() {
  const creds = getCredentials();
  if (!creds) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creds.email, password: creds.password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return true;
  } catch {
    return false;
  }
}

// إعادة محاولة عند فشل الشبكة مع مهلة زمنية لتفادي التعليق الطويل
async function fetchWithRetry(path, { method, headers, body }, retries = 2) {
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch(path, { method, headers, body, signal: controller.signal });
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

// طلب آمن: يجرب أولاً، وعند 401 يعيد تسجيل الدخول ويعيد المحاولة مرة واحدة
export async function apiFetch(path, { method = 'GET', json, formData, headers: extraHeaders } = {}) {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
    ...(extraHeaders || {}),
  };
  let body;
  if (formData) {
    body = formData;
  } else if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }

  let res = await fetchWithRetry(`${API_BASE}${path}`, { method, headers, body });

  if (res.status === 401) {
    const ok = await refreshTokens();
    if (ok) {
      headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
      res = await fetchWithRetry(`${API_BASE}${path}`, { method, headers, body });
    }
  }

  return res;
}

const LABEL_MAP = {
  full_name: 'الاسم',
  phone_number: 'رقم الهاتف',
  whatsapp_number: 'رقم الواتس',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  confirm_password: 'تأكيد كلمة المرور',
  current_password: 'كلمة المرور الحالية',
  new_password: 'كلمة المرور الجديدة',
  role: 'صفة المستخدم',
  account_type: 'نوع الحساب',
};

export function mapApiError(data) {
  if (!data) return 'حدث خطأ غير متوقع، حاول مرة أخرى';
  if (typeof data.message === 'string' && data.message) return data.message;
  if (typeof data.detail === 'string' && data.detail) return data.detail;
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors[0];

  const key = Object.keys(data)[0];
  if (key && Array.isArray(data[key])) {
    const msg = data[key][0];
    return /^(required|This field|expected|Enter|Ensure)/i.test(msg)
      ? `${LABEL_MAP[key] || key}: ${msg}`
      : msg;
  }

  return 'حدث خطأ غير متوقع، حاول مرة أخرى';
}

export function normalizeUser(u) {
  return {
    id: u?.id,
    name: u?.full_name || u?.name || '',
    email: u?.email || '',
    phone: u?.phone_number || u?.phone || '',
    whatsapp: u?.whatsapp_number || u?.whatsapp || '',
    accountType:
      u?.account_type === 'office' ? 'مكتب عقاري' : 'فرد',
    role:
      u?.role === 'owner' ? 'مالك عقار'
        : u?.role === 'tenant' ? 'مستأجر'
          : u?.role || 'مستأجر',
    avatar: resolveMediaUrl(u?.profile_image || u?.avatar || ''),
  };
}

export function roleToApi(value) {
  return value === 'مالك عقار' ? 'owner' : 'tenant';
}

export function accountTypeToApi(value) {
  return value === 'مكتب عقاري' ? 'office' : 'individual';
}

// ─── البحث عن العقارات ───
// params: search, governorate, area, neighborhood, property_type, bedrooms,
//         min_price, max_price, electricity (array), water (array), page
export function buildPropertySearchQuery({
  search,
  governorate,
  area,
  neighborhood,
  property_type,
  bedrooms,
  min_price,
  max_price,
  electricity,
  water,
  page,
} = {}) {
  const q = new URLSearchParams();
  if (search) q.append('search', search);
  if (governorate) q.append('governorate', governorate);
  if (area) q.append('area', area);
  if (neighborhood) q.append('neighborhood', neighborhood);
  if (property_type) q.append('property_type', property_type);
  if (bedrooms) q.append('bedrooms', bedrooms);
  if (min_price) q.append('min_price', min_price);
  if (max_price) q.append('max_price', max_price);
  if (Array.isArray(electricity) && electricity.length) q.append('electricity', electricity.join(','));
  if (Array.isArray(water) && water.length) q.append('water', water.join(','));
  if (page) q.append('page', page);
  return q.toString();
}

export async function searchProperties(params = {}) {
  const qs = buildPropertySearchQuery(params);
  return apiFetch(`/api/properties/search/${qs ? `?${qs}` : ''}`);
}

// ─── قيم البحث القابلة للعرض ───
export const GOVERNORATE_OPTIONS = [
  { label: 'كل المناطق', value: '' },
  { label: 'شمال غزة', value: 'north_gaza' },
  { label: 'غزة', value: 'gaza' },
  { label: 'وسط غزة', value: 'middle_gaza' },
  { label: 'خانيونس', value: 'khan_younis' },
  { label: 'رفح', value: 'rafah' },
];

export const GOVERNORATE_LABELS = Object.fromEntries(
  GOVERNORATE_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label])
);

export const PROPERTY_TYPE_OPTIONS = [
  { label: 'شقة', value: 'apartment' },
  { label: 'فيلا', value: 'villa' },
  { label: 'قطعة أرض', value: 'land' },
  { label: 'حاصل', value: 'store_room' },
  { label: 'بركس', value: 'barracks' },
  { label: 'محل تجاري', value: 'shop' },
];

export const PROPERTY_TYPE_LABELS = Object.fromEntries(
  PROPERTY_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

export const AREA_OPTIONS = [
  { label: 'بيت لاهيا', value: 'beit_lahia' },
  { label: 'أم النصر', value: 'umm_al_nasr' },
  { label: 'مخيم جباليا', value: 'jabalia_camp' },
  { label: 'جباليا', value: 'jabalia' },
  { label: 'بيت حانون', value: 'beit_hanoun' },
  { label: 'غزة', value: 'gaza_city' },
  { label: 'الشاطئ', value: 'shati_camp' },
  { label: 'المغراقة', value: 'mughraqa' },
  { label: 'جحر الديك', value: 'juhr_al_dik' },
  { label: 'الزهراء', value: 'zahra' },
  { label: 'مصدر', value: 'masdar' },
  { label: 'النصيرات', value: 'nuseirat' },
  { label: 'مخيم النصيرات', value: 'nuseirat_camp' },
  { label: 'البريج', value: 'bureij' },
  { label: 'الزوايدة', value: 'zawayda' },
  { label: 'المغازي', value: 'maghazi' },
  { label: 'مخيم المغازي', value: 'maghazi_camp' },
  { label: 'وادي السلقا', value: 'wadi_salqa' },
  { label: 'مخيم دير البلح', value: 'deir_al_balah_camp' },
  { label: 'دير البلح', value: 'deir_al_balah' },
  { label: 'القرارة', value: 'qarara' },
  { label: 'خان يونس', value: 'khan_younis_city' },
  { label: 'مخيم خان يونس', value: 'khan_younis_camp' },
  { label: 'بني سهيلا', value: 'bani_suheila' },
  { label: 'عبسان الكبيرة', value: 'abasan_kabira' },
  { label: 'عبسان الصغيرة', value: 'abasan_saghira' },
  { label: 'خزاعة', value: 'khuzaa' },
  { label: 'الفخاري', value: 'fukhari' },
  { label: 'رفح', value: 'rafah_city' },
  { label: 'مخيم رفح', value: 'rafah_camp' },
  { label: 'النصر', value: 'nasr' },
  { label: 'الشوكة', value: 'shawka' },
];

export const AREA_LABELS = Object.fromEntries(
  AREA_OPTIONS.map((o) => [o.value, o.label])
);

export const STATUS_LABELS = { available: 'متاح', reserved: 'محجوز', rented: 'مؤجر' };