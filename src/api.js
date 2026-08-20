export const API_HOST = 'https://bayti-backend-sprint1.onrender.com';
export const API_BASE = import.meta.env.DEV ? '' : API_HOST;

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

  let res = await fetch(`${API_BASE}${path}`, { method, headers, body });

  if (res.status === 401) {
    const ok = await refreshTokens();
    if (ok) {
      headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
      res = await fetch(`${API_BASE}${path}`, { method, headers, body });
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