export const API_HOST = 'https://bayti-backend.onrender.com';
export const API_BASE = API_HOST; // اجعليها تستخدم API_HOST مباشرة

// يحوّل أي مسار صورة من الخادم (مثل /profile_images/x.png) إلى رابط كامل
export function resolveMediaUrl(path) {
  if (!path) return '';
  if (/^(https?:\/\/|data:)/i.test(path)) return path;
  return API_HOST + (path.startsWith('/') ? path : `/${path}`);
}

export function authHeaders(json = true) {
  const h = {};
  const token = localStorage.getItem('access_token');
  // لا نرسل ترويسة Authorization بدون توكن، لأن الباك اند يرجّع 401 بدل اعتبار الطلب زائرًا
  if (token) h.Authorization = `Bearer ${token}`;
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
  const headers = { ...(extraHeaders || {}) };
  const token = localStorage.getItem('access_token');
  // الترويسة تُرسل فقط عند وجود توكن فعلي، وإلا ردّ الباك اند بـ 401 على الزائر
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (formData) {
    body = formData;
  } else if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }

  let res = await fetchWithRetry(`${API_BASE}${path}`, { method, headers, body });

  if (res.status === 401 && token) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
      res = await fetchWithRetry(`${API_BASE}${path}`, { method, headers, body });
    } else {
      // التوكن غير صالح ولا توجد بيانات اعتماد لتجديده:
      // ننظّف الجلسة ونترك المسارات العامة تشتغل كزائر
      clearCredentials();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete headers.Authorization;
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
          /* بدون fallback "مستأجر" — كان بيخلي صفحة المالك تعرض "مستأجر"
             لما الـAPI ما يرجّع role، والـcaller بيستخدم قيمته المحفوظة */
          : u?.role || '',
    avatar: resolveMediaUrl(u?.profile_image || u?.avatar || ''),
  };
}

export function roleToApi(value) {
  return value === 'مالك عقار' ? 'owner' : 'tenant';
}

/* فحص الدور من مصدر واحد — كان مكرر بأربع ملفات وكل نسخةفحصت بشكل مختلف،
   فالمستخدم المستأجر كان بياخد صفحات المالك */
const OWNER_ROLES = new Set(['owner', 'مالك', 'مالك عقار', 'مالك عقارات']);
const TENANT_ROLES = new Set(['tenant', 'مستأجر', 'مستاجر', 'مستأجر عقار']);

export function isOwnerRole(role) {
  const value = String(role ?? '').trim().toLowerCase();
  return OWNER_ROLES.has(value);
}

export function isTenantRole(role) {
  const value = String(role ?? '').trim().toLowerCase();
  return TENANT_ROLES.has(value);
}

/* الدور يقدر ييجي من الـAPI بالإنجليزية أو من localStorage بالعربية */
export function resolveRole(role) {
  if (isOwnerRole(role)) return 'owner';
  if (isTenantRole(role)) return 'tenant';
  return '';
}

/* الدور الحقيقي من الـAPI — الملف الشخصي أولاً، وبعدها endpoints المالك.
   قاعدة مهمة: ما بنرجّع 'tenant' أبداً من رد غير ناجح (403/404/401).
   أي تخمين بـ'tenant' كان بيقلب حساب المالك لصفحة المستأجر، لأن كل
   الواجهةافتراضيها "إذا مو مالك = مستأجر" */
export async function fetchCurrentRole() {
  const trace = {};

  /* 1) الملف الشخصي هو المرجع الأول: يقبل role أو account_type أو user_type */
  try {
    const res = await apiFetch('/api/auth/profile/');
    if (res.ok) {
      const data = await res.json().catch(() => null);
      const raw = data?.user || data;
      trace.profileStatus = res.status;
      trace.profileFields = raw ? Object.keys(raw).slice(0, 20) : null;
      const role =
        resolveRole(raw?.role) || resolveRole(raw?.account_type) || resolveRole(raw?.user_type);
      if (role) {
        trace.result = role;
        console.info('[role] الدور من الملف الشخصي:', trace);
        return role;
      }
    } else {
      trace.profileStatus = res.status;
    }
  } catch {
    trace.profileStatus = 'network-error';
  }

  /* 2) أي endpoint مالك بيرجّع 200 = مالك مؤكد. غير ذلك ما بنستنتج ولا شي */
  for (const path of ['/api/owner/interest-requests', '/api/properties/mine/']) {
    try {
      const res = await apiFetch(path);
      trace[path] = res.status;
      if (res.ok) {
        trace.result = 'owner';
        console.info('[role] الدور من endpoint المالك:', trace);
        return 'owner';
      }
    } catch {
      trace[path] = 'network-error';
    }
  }

  trace.result = 'unknown';
  console.info('[role] تعذّر تحديد الدور — بنخلي الواجهة تعرض افتراضي المستأجر:', trace);
  return '';
}

/* --------------------------------------------------------------------------
   Contact Settings — تفعيل/إلغاء استقبال طلبات الاهتمام لعقار واحد
   PUT /api/properties/{id}/contact-settings/  body: { interest_enabled: bool }
   للمالك فقط: 401 غير مسجّل · 403 مو مالك · 404 العقار مو موجود · 400 قيمة مو Boolean
   القيم الافتراضية للـbackend = true
   -------------------------------------------------------------------------- */
export function isInterestEnabled(property) {
  if (!property) return true;
  if (typeof property.interest_enabled === 'boolean') return property.interest_enabled;
  if (typeof property.interestEnabled === 'boolean') return property.interestEnabled;
  return true;
}

export async function setPropertyInterestEnabled(id, enabled) {
  return apiFetch(`/api/properties/${id}/contact-settings/`, {
    method: 'PUT',
    json: { interest_enabled: Boolean(enabled) },
  });
}

/* --------------------------------------------------------------------------
   Interest Requests — US-17 / US-18 / US-19 / Sprint 4

   US-17  POST /api/properties/{property_id}/interest-request
          ⚠️ بدون trailing slash — مع "/" بيرجع 404
          body فاضي · 201 Created · لازم role=tenant
   US-18  PUT  /api/interest-request/{request_id}/status
          body: { status: "approved" | "rejected" } · لازم صاحب العقار
          ⚠️ Sprint 4: مع status=rejected صار rejection_reason إجباري
          (أحد القيم بـ REJECTION_REASONS) + rejection_note اختياري (200 حرف)
   US-19  GET  /api/owner/interest-requests[?status=...]
          { results: [...], count } — طلبات عقارات المستخدم الحالي فقط
   Sprint4 GET  /api/tenant/interest-requests[?status=...]
          نفس الشكل بس من جهة المستأجر — request_code بكل الـ responses
   -------------------------------------------------------------------------- */
export const INTEREST_REQUEST_STATUSES = ['pending', 'approved', 'rejected'];

/* القيم اللي الـbackend بيقبلها في PUT /status — "pending" ما مقبول */
const SETTABLE_STATUSES = ['approved', 'rejected'];

/* slugs المسموحة عند الرفض — أي قيمة تانية بتعطي 400 validation */
export const REJECTION_REASONS = [
  'property_unavailable',
  'payment_terms_not_compatible',
  'rental_period_too_short',
];

export const REJECTION_NOTE_MAX = 200;

/* رد الـbackend رجع IDs بس (tenant/property/owner) — بنوحّد الشكل مرة واحدة */
export function normalizeInterestRequest(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const status = String(raw.status || 'pending').toLowerCase();
  return {
    id: raw.id,
    /* request_code: REQ-00001 — الطلبات القديمة بترجع "" فنرجع null */
    requestCode: typeof raw.request_code === 'string' && raw.request_code ? raw.request_code : '',
    tenantId: raw.tenant ?? raw.tenant_id ?? null,
    propertyId: raw.property ?? raw.property_id ?? null,
    ownerId: raw.owner ?? raw.owner_id ?? null,
    status: INTEREST_REQUEST_STATUSES.includes(status) ? status : 'pending',
    rejectionReason: typeof raw.rejection_reason === 'string' ? raw.rejection_reason : '',
    rejectionNote: typeof raw.rejection_note === 'string' ? raw.rejection_note : '',
    createdAt: raw.created_at || raw.createdAt || '',
    updatedAt: raw.updated_at || raw.updatedAt || '',
    raw,
  };
}

export async function sendInterestRequest(propertyId) {
  /* ⚠️ المسار بدون slash بالآخر — هاي نقطة بتنسى وبتعطي 404 */
  return apiFetch(`/api/properties/${propertyId}/interest-request`, { method: 'POST' });
}

export async function setInterestRequestStatus(requestId, status, extra = {}) {
  const value = String(status || '').toLowerCase();
  if (!SETTABLE_STATUSES.includes(value)) {
    throw new Error(`حالة الطلب غير صالحة: ${status} — المسموح approved أو rejected فقط`);
  }

  const payload = { status: value };

  if (value === 'rejected') {
    const reason = String(extra.rejection_reason || '').trim();
    if (!REJECTION_REASONS.includes(reason)) {
      /* نمنع الطلب من عندنا بدل ما نستقبل 400 من الـbackend */
      throw new Error('يجب اختيار سبب الرفض من القائمة قبل التأكيد.');
    }
    payload.rejection_reason = reason;

    const note = String(extra.rejection_note || '').trim();
    if (note) payload.rejection_note = note.slice(0, REJECTION_NOTE_MAX);
  }
  /* مع status=approved الـbackend بيتجاهل rejection_reason/rejection_note
     حتى لو انبعتوا — فما بنبعتهم أصلاً */

  return apiFetch(`/api/interest-request/${requestId}/status`, {
    method: 'PUT',
    json: payload,
  });
}

export async function fetchOwnerInterestRequests(status) {
  /* الـbackend يرفض أي status خارج الثلاث بقيمته، فبنمرّر القيم الصالحة بس */
  const qs = INTEREST_REQUEST_STATUSES.includes(String(status || '').toLowerCase())
    ? `?status=${String(status).toLowerCase()}`
    : '';
  return apiFetch(`/api/owner/interest-requests${qs}`);
}

/* US-Sprint4 — طلبات الاهتمام من جهة المستأجر (نفس شكل US-19) */
export async function fetchTenantInterestRequests(status) {
  const qs = INTEREST_REQUEST_STATUSES.includes(String(status || '').toLowerCase())
    ? `?status=${String(status).toLowerCase()}`
    : '';
  return apiFetch(`/api/tenant/interest-requests${qs}`);
}

/* --------------------------------------------------------------------------
   Google Login
   POST /api/auth/google/   body: { id_token }

   200 → { message, access, refresh, user }
   400 → الـid_token مفقود
   401 → الـid_token غير صالح أو غير موثّق
   403 → ما في حساب Bayti مرتبط بهذا الإيميل

   ملاحظة: ما في register — الحساب لازم يكون موجود مسبقاً بالبريد.
   أول دخول بالـGoogle بيربط الحساب، وكل دخول بعده مباشرة.

   الدالة بترجع { state, data } بدل رمي exception عشان صفحة الدخول
   تقدر تميّز 400/401/403 وتعرض رسالة مناسبة لكل حالة.
   -------------------------------------------------------------------------- */
const GOOGLE_ERROR_AR = {
  400: 'ما وصلنا بيانات Google. حاول مرة أخرى.',
  401: 'بيانات Google غير صالحة أو غير موثّقة. حاول مرة أخرى.',
  403: 'ما في حساب Bayti مرتبط بهذا الإيميل. أنشئ حسابك بالبريد وكلمة المرور أولاً، وبعدها ادخل بحساب Google.',
};

export async function googleLogin(idToken) {
  if (!idToken) {
    return { state: 'error', status: 400, data: null, message: GOOGLE_ERROR_AR[400] };
  }

  let res;
  try {
    /* بدون apiFetch: تسجيل الدخول ما بيكون فيه token، وapiFetch بيحاول
       يجدد التوكن على 401 — ما إله داعي بهالمسار */
    res = await fetch(`${API_BASE}/api/auth/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken }),
    });
  } catch {
    return {
      state: 'error',
      status: 0,
      data: null,
      message: 'تعذر الاتصال بالخادم، تأكد من الاتصال بالإنترنت وحاول مرة أخرى.',
    };
  }

  const data = await res.json().catch(() => null);

  /* سطر واحد بالكونسول بيوفّر كل التشخيص: كود الحالة + جسم الرد */
  console.warn('[google-login] POST /api/auth/google/ ->', res.status, data);

  if (!res.ok) {
    /* 400/401/403 لها رسائل جاهزة. أي كود ثاني (500 مثلاً) كنرجّع رقمه
       بالرسالة بدل "خطأ غير متوقع" اللي كان بيخفي السبب الحقيقي */
    const known = GOOGLE_ERROR_AR[res.status];
    const detail = typeof data?.detail === 'string' ? data.detail : '';
    return {
      state: 'error',
      status: res.status,
      data,
      message: known
        || (detail ? mapApiError(data) : `تعذّر تسجيل الدخول عبر Google — استجابة ${res.status} من الخادم.`),
    };
  }

  if (!data?.access) {
    return {
      state: 'error',
      status: res.status,
      data,
      message: 'رد الخادم بدون توكن، حاول مرة أخرى.',
    };
  }

  return { state: 'success', status: res.status, data, message: '' };
}

/* --------------------------------------------------------------------------
   US-20 — بيانات التواصل لصاحب العقار
   GET /api/properties/{property_id}/contact/     (Bearer token مطلوب)

   200 → { phone_number, whatsapp_number }   interest_enabled = false أو الطلب approved
   403 → { message }                     interest_enabled = true والطلب مو approved
   401 → ما في session                   الزائر أو التوكن منتهي

   whatsapp_number ممكن يكون null لو المالك ما حط رقم واتساب —
   الواجهة بترجع تستعمله كـ fallback للرقم العادي.

   الدالة بترجع نتيجة جاهزة للعرض بدل Response عشان كل صفحة تتعامل مع
   الحالة بنفس الشكل: available · locked · unauthenticated · notfound · error
   -------------------------------------------------------------------------- */
export const CONTACT_LOCKED_MESSAGE =
  'Contact information is available only after your interest request is approved.';

/* الباك اند بيرجّع رسائل إنجليزية — بنترجمها قبل ما توصل للمستخدم */
const CONTACT_MESSAGES_AR = {
  [CONTACT_LOCKED_MESSAGE]: 'بيانات التواصل متاحة فقط بعد الموافقة على طلب الاهتمام.',
  'Authentication credentials were not provided.': 'انتهت الجلسة، يرجى تسجيل الدخول من جديد.',
  'You do not have permission to view this contact information.':
    'لا يمكنك عرض بيانات التواصل لهذا العقار.',
};

function contactMessageAr(data, fallback) {
  const raw =
    (typeof data?.message === 'string' && data.message) ||
    (typeof data?.detail === 'string' && data.detail) ||
    '';
  return CONTACT_MESSAGES_AR[raw] || fallback;
}

export async function fetchPropertyContact(propertyId) {
  if (propertyId === undefined || propertyId === null || propertyId === '') {
    return { state: 'error', phone: '', whatsapp: '', message: 'تعذر تحديد العقار.', interestEnabled: null };
  }

  let res;
  try {
    res = await apiFetch(`/api/properties/${propertyId}/contact/`);
  } catch {
    return {
      state: 'error',
      phone: '',
      whatsapp: '',
      message: 'تعذر الاتصال بالخادم، تحقق من الإنترنت وحاول مرة أخرى.',
      interestEnabled: null,
    };
  }

  const data = await res.json().catch(() => null);
  const interestEnabled =
    typeof data?.interest_enabled === 'boolean' ? data.interest_enabled : null;

  /* 200 — الرقم ظاهر: إما interest_enabled=false أو الطلب اتقبل */
  if (res.ok) {
    return {
      state: 'available',
      phone: data?.phone_number || data?.phone || '',
      /* ممكن null لو المالك ما حط واتساب — الواجهة بتعمل fallback للرقم */
      whatsapp: data?.whatsapp_number || data?.whatsapp || '',
      message: '',
      interestEnabled,
    };
  }

  /* 403 — المالك فعّل طلبات الاهتمام وما في طلب مقبول لهذا المستأجر */
  if (res.status === 403) {
    return {
      state: 'locked',
      phone: '',
      whatsapp: '',
      message: contactMessageAr(data, CONTACT_MESSAGES_AR[CONTACT_LOCKED_MESSAGE]),
      interestEnabled,
    };
  }

  if (res.status === 401) {
    return {
      state: 'unauthenticated',
      phone: '',
      whatsapp: '',
      message: contactMessageAr(data, 'انتهت الجلسة، يرجى تسجيل الدخول من جديد.'),
      interestEnabled,
    };
  }

  if (res.status === 404) {
    return { state: 'notfound', phone: '', whatsapp: '', message: 'العقار غير موجود.', interestEnabled };
  }

  return {
    state: 'error',
    phone: '',
    whatsapp: '',
    message: contactMessageAr(data, 'تعذر جلب بيانات التواصل، حاول مرة أخرى.'),
    interestEnabled,
  };
}

/* --------------------------------------------------------------------------
   US-22 + Sprint 4 — الإشعارات (كل الـ endpoints تحتاج Bearer token)
   GET   /api/notifications/?filter=...        قائمة إشعارات المستخدم
         filter: بدونه أو all = الكل · unread = غير المقروءة ·
                 أو نوع الإشعار (interest_request مثلاً)
   PATCH /api/notifications/{id}/read/         تحديد إشعار واحد كمقروء
   PATCH /api/notifications/mark-all-read/     تحديد كل الإشعارات كمقروءة
         (Sprint 4 — بنرجع تلقائياً للمسار القديم read-all/ لو ما زال متاح)
   -------------------------------------------------------------------------- */

/* قيم filter المسموحة بالـquery — أي قيمة تانية ما بنبعتها */
const NOTIFICATION_FILTER_RE = /^[a-z0-9_]+$/i;

/* الـbackend بيرجّع القيم بأشكال مختلفة — بنوحّدها للفلاتر في الواجهة */
const NOTIFICATION_STATUS_MAP = {
  approved: 'approved',
  accepted: 'approved',
  accept: 'approved',
  confirmed: 'approved',
  rejected: 'rejected',
  declined: 'rejected',
  declined_by_owner: 'rejected',
  reject: 'rejected',
  pending: 'pending',
  new: 'pending',
  created: 'pending',
  interest: 'pending',
  interest_request: 'pending',
  interest_request_created: 'pending',
  viewing_request: 'pending',
};

export function normalizeNotification(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw.id ?? raw.notification_id ?? raw.reference ?? `index-${index}`;
  const rawStatus = String(
    raw.status || raw.state || raw.type || raw.notification_type || ''
  )
    .trim()
    .toLowerCase();
  const readValue = raw.is_read ?? raw.read ?? raw.isRead;
  const propertyId = raw.property_id ?? raw.property?.id ?? null;
  const createdAt = raw.created_at || raw.createdAt || raw.timestamp || raw.time || '';

  return {
    id,
    title: raw.title || raw.subject || '',
    description:
      raw.description || raw.message || raw.body || raw.text || raw.detail || '',
    /* الوقت الخام — التنسيق بالعربي مسؤولية الواجهة */
    createdAt,
    read: typeof readValue === 'boolean' ? readValue : !!(raw.is_read ?? raw.read),
    status: NOTIFICATION_STATUS_MAP[rawStatus] || 'pending',
    /* الرابط اختياري: لو الـAPI بعت واحد، وإلا ندخل على العقار المرتبط */
    link:
      typeof raw.link === 'string' && raw.link.startsWith('/')
        ? raw.link
        : propertyId
          ? `/property/${propertyId}`
          : '',
  };
}

/* الرد ممكن يكون قائمة مباشرة أو غلاف paginated (results / data / items) */
function extractNotificationList(data) {
  const raw = Array.isArray(data)
    ? data
    : data?.results ?? data?.data ?? data?.notifications ?? data?.items ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeNotification).filter(Boolean);
}

/* filter: 'all' (أو فاضي) → بدون query · 'unread' أو نوع الإشعار → ?filter=... */
export async function fetchNotifications(filter) {
  const value = String(filter || '').trim().toLowerCase();
  const qs =
    value && value !== 'all' && NOTIFICATION_FILTER_RE.test(value)
      ? `?filter=${encodeURIComponent(value)}`
      : '';

  let res;
  try {
    res = await apiFetch(`/api/notifications/${qs}`);
  } catch {
    return { state: 'error', items: [], message: 'تعذر الاتصال بالخادم، تحقق من الإنترنت وحاول مرة أخرى.' };
  }

  if (res.status === 401) {
    return {
      state: 'unauthenticated',
      items: [],
      message: 'انتهت الجلسة، يرجى تسجيل الدخول من جديد.',
    };
  }

  if (res.status === 403) {
    return {
      state: 'error',
      items: [],
      message: 'ليس لديك صلاحية لعرض الإشعارات.',
    };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { state: 'error', items: [], message: mapApiError(data) };
  }

  const data = await res.json().catch(() => null);
  return { state: 'ready', items: extractNotificationList(data), message: '' };
}

export async function markNotificationRead(id) {
  return apiFetch(`/api/notifications/${id}/read/`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  /* Sprint 4: المسار الرسمي mark-all-read/ — لو الباك لسا على المسار القديم
     (404/405) بنجرب read-all/ تلقائياً عشان الزر ما يفشل عند المستخدم */
  const res = await apiFetch('/api/notifications/mark-all-read/', { method: 'PATCH' });
  if (res.status === 404 || res.status === 405) {
    return apiFetch('/api/notifications/read-all/', { method: 'PATCH' });
  }
  return res;
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

// نفس search/ بالضبط، بس للرئيسية ويتطلب تسجيل دخول
export async function homeProperties(params = {}) {
  const qs = buildPropertySearchQuery(params);
  const path = `/api/properties/home/${qs ? `?${qs}` : ''}`;
  const res = await apiFetch(path);
  // لحد ما يُنشر /home/ على الباكاند، نرجع لـsearch/: نفس الـshape ونفس استبعاد rented
  if (res.ok) return res;
  return apiFetch(`/api/properties/search/${qs ? `?${qs}` : ''}`);
}

// ─── حفظ العقارات ومشاركتها ───
export async function saveProperty(id) {
  return apiFetch(`/api/properties/${id}/save/`, { method: 'POST' });
}

export async function unsaveProperty(id) {
  return apiFetch(`/api/properties/${id}/save/`, { method: 'DELETE' });
}

export async function fetchSavedProperties() {
  return apiFetch('/api/users/saved-properties/');
}

// مشاركة العقار — بدون توكن، وبترجع { link }
export async function fetchShareLink(id) {
  return apiFetch(`/api/properties/${id}/share/`);
}

// مسار أول صورة للعقار من أي حقل يحملها
export function getPropertyImagePath(property) {
  if (!property || typeof property !== 'object') return '';
  const direct = property.image || property.main_image || property.thumbnail;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  if (Array.isArray(property.images) && property.images.length) {
    const first = property.images[0];
    const raw = typeof first === 'string' ? first : first?.image;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return '';
}

// الموقع يعرض العقارات بصورها فقط؛ العقار بدون صورة ما بيظهر
export const hasPropertyImage = (property) => Boolean(getPropertyImagePath(property));

// بطاقة العرض: تحافظ على حقول الـAPI الأصلية للمشاركة والحفظ وتضيف مفاتيح العرض
export function toPropertyCard(property) {
  const location =
    property.address ||
    [property.neighborhood, property.area, property.governorate].filter(Boolean).join('، ') ||
    'غزة';
  return {
    ...property,
    image: resolveMediaUrl(getPropertyImagePath(property)),
    location,
    priceLabel: `${Number(property.price || 0).toLocaleString('en-US')} ₪`,
    typeLabel: PROPERTY_TYPE_LABELS[property.property_type] || '',
    beds: property.bedrooms || 0,
    baths: property.bathrooms || 0,
    size: property.area_sqm || 0,
  };
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