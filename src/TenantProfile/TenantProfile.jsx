import { useState, useEffect } from 'react';
import '../OwnerProfile/OwnerProfile.css';
import './TenantProfile.css';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/LandingFooter';
import { apiFetch, normalizeUser, resolveMediaUrl, getPropertyImagePath } from '../services/api.js';
import { notifyUserChange, persistUser } from '../state/currentUser.js';
import defaultAvatar from '../components/default-avatar.svg';
import {
    FaBookmark, FaPaperPlane, FaCheckCircle, FaTimesCircle, FaEdit,
    FaUserCheck, FaCalendarAlt, FaUserCircle, FaSpinner
} from 'react-icons/fa';

const STATUS_MAP = {
    pending: 'قيد الانتظار',
    accepted: 'مقبول',
    approved: 'مقبول',
    rejected: 'مرفوض',
};

const formatPrice = (value) => `${Number(value || 0).toLocaleString('en-US')} ₪`;

function mapSavedProperty(entry) {
    const p = entry?.property || entry || {};
    return {
        id: p.id,
        title: p.title || 'عقار',
        location: p.address || '',
        price: formatPrice(p.price),
        image: resolveMediaUrl(getPropertyImagePath(p)) || defaultAvatar,
    };
}

function mapTenantRequest(item) {
    return {
        id: item?.id,
        property: item?.property_title || 'عقار',
        date: item?.created_at ? new Date(item.created_at).toLocaleDateString('ar-EG') : '',
        status: item?.status || 'pending',
        image: resolveMediaUrl(item?.property_thumbnail || '') || defaultAvatar,
    };
}

const TenantProfile = ({ currentUser, onHomeClick, onProfileClick, onChangePasswordClick, onEditProfileClick, onLogoutClick, onSearchClick, onSavedClick, onRequestsClick }) => {
    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const [userData, setUserData] = useState({
        name: currentUser?.name || 'أحمد محمد',
        email: currentUser?.email || 'ahmed.mohamed@example.com',
        phone: currentUser?.phone || '',
        whatsapp: currentUser?.whatsapp || '',
        role: currentUser?.role || 'مستأجر',
        joinedYear: currentUser?.createdAt ? new Date(currentUser.createdAt).getFullYear() : '2023',
avatar: currentUser?.avatar || defaultAvatar,
        isVerified: false
    });

    const [statsData, setStatsData] = useState({
        saved: 0,
        sent: 0,
        accepted: 0,
        rejected: 0
    });

    const [savedProperties, setSavedProperties] = useState([]);
    const [interestRequests, setInterestRequests] = useState([]);

useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        const applyUser = (raw) => {
            const u = normalizeUser(raw || {});
            const created = raw?.created_at || raw?.createdAt;
            setUserData((prev) => ({
                ...prev,
                name: u.name || prev.name,
                email: u.email || prev.email,
                phone: u.phone || prev.phone,
                whatsapp: u.whatsapp || prev.whatsapp,
                role: u.role || prev.role,
                joinedYear: created ? new Date(created).getFullYear() : prev.joinedYear,
                avatar: u.avatar || prev.avatar,
                isVerified: Boolean(raw?.is_verified),
            }));

            const saved = JSON.parse(localStorage.getItem('bayti_user') || '{}');
            localStorage.setItem(
                'bayti_user',
                JSON.stringify({
                    ...saved,
                    name: u.name,
                    email: u.email,
                    phone: u.phone,
                    /* لازم نحافظ على الدور المحفوظ إذا الـAPI ما رجّع role */
                    role: u.role || saved.role,
                    whatsapp: u.whatsapp,
                    avatar: u.avatar
                })
            );
            notifyUserChange();
        };

        (async () => {
            /* endpoint واحد: المستخدم + الإحصائيات + آخر الطلبات والمحفوظات */
            try {
                const res = await apiFetch('/api/auth/tenant/profile/');
                if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    if (cancelled) return;

                    applyUser(data.user);
                    setStatsData({
                        saved: data.stats?.saved_properties_count ?? 0,
                        sent: data.stats?.total_interest_requests ?? 0,
                        accepted: data.stats?.approved_requests ?? 0,
                        rejected: data.stats?.rejected_requests ?? 0,
                    });
                    setInterestRequests(
                        (Array.isArray(data.recent_interest_requests) ? data.recent_interest_requests : [])
                            .map(mapTenantRequest)
                    );
                    setSavedProperties(
                        (Array.isArray(data.recent_saved_properties) ? data.recent_saved_properties : [])
                            .map(mapSavedProperty)
                    );
                    return;
                }
            } catch {
                /* بنكمل بالطريقة القديمة */
            }

            /* fallback لحد ما ينشر /api/auth/tenant/profile/ على الباكاند */
            const [profileRes, savedRes] = await Promise.all([
                apiFetch('/api/auth/profile/'),
                apiFetch('/api/users/saved-properties/'),
            ]);
            if (cancelled) return;

            if (profileRes.ok) applyUser(await profileRes.json().catch(() => ({})));

            if (savedRes.ok) {
                const savedData = await savedRes.json().catch(() => ({}));
                const list = savedData?.saved_properties || savedData?.results || [];
                if (Array.isArray(list) && list.length) {
                    setSavedProperties(list.slice(0, 3).map(mapSavedProperty));
                    setStatsData((prev) => ({ ...prev, saved: list.length }));
                }
            }
        })().finally(() => {
            if (!cancelled) setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    // دالة لتحديث الصورة الشخصية عند الاختيار
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadError('');
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('profile_image', file);

        setUploadingAvatar(true);
        try {
            const res = await apiFetch('/api/auth/profile/', {
                // السيرفر يسمح بـ GET, PUT, HEAD, OPTIONS فقط — بدون PATCH
                method: 'PUT',
                formData
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.detail || `فشل الرفع (${res.status})`);
            }

            const data = await res.json().catch(() => ({}));
            let resolved = resolveMediaUrl(
                data?.profile_image || data?.avatar || data?.user?.profile_image || data?.user?.avatar || ''
            );

            // بعض الواجهات ما بترجّع الصورة بالرد، فبنجيب الرابط من طلب GET
            if (!resolved) {
                const refetch = await apiFetch('/api/auth/profile/');
                if (refetch.ok) {
                    const fresh = await refetch.json().catch(() => ({}));
                    resolved = resolveMediaUrl(fresh?.profile_image || fresh?.avatar || '');
                }
            }

            if (!resolved) throw new Error('لم يُرجع الخادم رابط الصورة');

            setUserData((prev) => ({ ...prev, avatar: resolved }));
            // نحدّث localStorage حتىorefّ Navbar الصورة الجديدة فوراً
            persistUser({ avatar: resolved });
        } catch (err) {
            console.error("Avatar upload failed:", err);
            setUploadError('تعذّر رفع الصورة، حاول مرة أخرى.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const stats = [
        { id: 1, title: 'العقارات المحفوظة', count: statsData.saved, icon: <FaBookmark />, color: '#0284c7', bg: '#e0f2fe' },
        { id: 2, title: 'الطلبات المرسلة', count: statsData.sent, icon: <FaPaperPlane />, color: '#16a34a', bg: '#dcfce7' },
        { id: 3, title: 'الطلبات المقبولة', count: statsData.accepted, icon: <FaCheckCircle />, color: '#0284c7', bg: '#e0f2fe' },
        { id: 4, title: 'الطلبات المرفوضة', count: statsData.rejected, icon: <FaTimesCircle />, color: '#e11d48', bg: '#ffe4e6' },
    ];

return (
        <div className="owner-profile-app tenant-profile-app" dir="rtl">
            <Navbar
                onHomeClick={onHomeClick}
                onProfileClick={onProfileClick}
                onChangePasswordClick={onChangePasswordClick}
                onLogoutClick={onLogoutClick}
                onSearchClick={onSearchClick}
                onSavedClick={onSavedClick}
                onRequestsClick={onRequestsClick}
            />

            <main className="main-content">
                <div className="breadcrumb">
                    <span>الرئيسية</span> / <span className="active-path">الملف الشخصي</span>
                </div>

                <h1 className="page-title"><FaUserCircle className="title-icon" /> الملف الشخصي</h1>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', color: '#0284c7' }} />
                        <p style={{ marginTop: '1rem', color: '#666' }}>جاري تحميل البيانات...</p>
                    </div>
                ) : (
                    <>
                        <section className="profile-header-card tenant-header-card">
                            <div className="profile-info-side">
                                <div className="avatar-wrapper">
                                    <img src={userData.avatar} alt={userData.name} className="profile-avatar-lg" />
                                    <label htmlFor="tenant-avatar-upload" className="edit-avatar-btn" style={{ cursor: 'pointer' }}>
                                        {uploadingAvatar ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaEdit />}
                                    </label>
                                    <input
                                        id="tenant-avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        style={{ display: 'none' }}
                                    />
                                    {uploadError && (
                                        <p className="avatar-upload-error">{uploadError}</p>
                                    )}
                                </div>
                                <div className="user-details">
                                    <h2>{userData.name} {userData.isVerified && <FaCheckCircle className="verified-badge" />}</h2>
                                    <p className="email">{userData.email}</p>

                                    <div className="badges-row">
                                        <span className="badge-pill"><FaUserCheck /> {userData.role}</span>
                                        <span className="badge-pill"><FaCalendarAlt /> عضو منذ {userData.joinedYear}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-actions-side">
                                <button className="btn-primary" onClick={onEditProfileClick}><FaEdit /> تعديل الملف الشخصي</button>
                                <button className="btn-secondary" onClick={onChangePasswordClick}>تغيير كلمة المرور</button>
                            </div>
                        </section>

                        {/* الإحصائيات */}
                        <section className="stats-section">
                            <h3>إحصائياتك</h3>
                            <div className="stats-grid">
                                {stats.map((stat) => (
                                    <div key={stat.id} className="stat-card">
                                        <div className="stat-icon" style={{ color: stat.color, backgroundColor: stat.bg }}>
                                            {stat.icon}
                                        </div>
                                        <span className="stat-title">{stat.title}</span>
                                        <span className="stat-count">{stat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* القسم السفلي */}
                        <section className="dashboard-grid">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h3><FaBookmark /> آخر العقارات المحفوظة</h3>
                                </div>
<div className="card-body">
                                    {savedProperties.length === 0 ? (
                                        <p className="op-empty">لا توجد عقارات محفوظة بعد.</p>
                                    ) : savedProperties.map((item) => (
                                        <div key={item.id} className="property-item">
                                            <img src={item.image} alt={item.title} className="prop-img" />
                                            <div className="prop-details">
                                                <h4>{item.title}</h4>
                                                <p>{item.location}</p>
                                                <span className="price">{item.price}</span>
                                            </div>
                                            <button className="bookmark-btn" aria-label="إزالة من المحفوظات"><FaBookmark /></button>
                                        </div>
                                    ))}
                                    <a href="#all-saved" className="view-all-link">عرض جميع المحفوظات</a>
                                </div>
                            </div>

                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h3><FaPaperPlane /> آخر طلبات الاهتمام</h3>
                                </div>
<div className="card-body">
                                    {interestRequests.length === 0 ? (
                                        <p className="op-empty">لا توجد طلبات اهتمام بعد.</p>
                                    ) : interestRequests.map((req) => (
<div key={req.id} className="request-item">
                                            <div className="request-user">
                                                <img src={req.image} alt={req.property} className="req-img" />
                                                <div className="req-info">
                                                    <div className="req-title-row">
                                                        <h4>{req.property}</h4>
                                                        <span className={`status-badge ${req.status}`}>
                                                            {STATUS_MAP[req.status] || req.status}
                                                        </span>
                                                    </div>
                                                    <span className="req-date">{req.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <a href="#all-requests" className="view-all-link">عرض جميع الطلبات</a>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>

            <LandingFooter />
        </div>
    );
};

export default TenantProfile;