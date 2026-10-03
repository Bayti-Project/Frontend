import { useState, useEffect } from 'react';
import './OwnerProfile.css';
import Navbar from '../components/Navbar';
import { apiFetch, normalizeUser, resolveMediaUrl } from '../services/api.js';
import { notifyUserChange, persistUser } from '../state/currentUser.js';
import defaultAvatar from '../components/default-avatar.svg';
import LandingFooter from '../components/LandingFooter';
import {
    FaBuilding, FaHome, FaKey, FaUsers, FaPlus, FaEdit,
    FaCheckCircle, FaUserCheck, FaCalendarAlt, FaSpinner
} from 'react-icons/fa';

const OwnerProfile = ({
    currentUser,
    onHomeClick,
    onProfileClick,
    onChangePasswordClick,
    onEditProfileClick,
    onLogoutClick,
    onAddPropertyClick,
      onSearchClick,
      onSavedClick,
      onRequestsClick,
  }) => {
      const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const [userData, setUserData] = useState({
        name: currentUser?.name || 'أحمد محمد',
        email: currentUser?.email || 'ahmed.mohamed@example.com',
        phone: currentUser?.phone || '',
        whatsapp: currentUser?.whatsapp || '',
        role: currentUser?.role || 'مالك',
        joinedYear: currentUser?.createdAt ? new Date(currentUser.createdAt).getFullYear() : '2023',
        avatar: currentUser?.avatar || defaultAvatar
    });

    const [statsData, setStatsData] = useState({
        published: 0,
        active: 0,
        rented: 0,
        requests: 0
    });

    const [recentProperties, setRecentProperties] = useState([]);
    const [interestRequests, setInterestRequests] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        apiFetch('/api/auth/profile/')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data) return;

                const u = normalizeUser(data);
                const year = data.created_at || data.createdAt
                    ? new Date(data.created_at || data.createdAt).getFullYear()
                    : '2024';

                setUserData((prev) => ({
                    ...prev,
                    name: u.name || prev.name,
                    email: u.email || prev.email,
                    phone: u.phone || prev.phone,
                    whatsapp: u.whatsapp || prev.whatsapp,
                    role: u.role || prev.role,
                    joinedYear: year,
                    avatar: u.avatar || prev.avatar,
                }));

                // إمكانية تحديث العقارات والطلبات من الاستجابة إن وجدت في API
                if (data.properties) setRecentProperties(data.properties);
                if (data.stats) setStatsData(data.stats);
                if (data.requests) setInterestRequests(data.requests);

                // تحديث بيانات المستخدم في LocalStorage
                const saved = JSON.parse(localStorage.getItem('bayti_user') || '{}');
                localStorage.setItem(
                    'bayti_user',
                    JSON.stringify({
                        ...saved,
                        name: u.name,
                        email: u.email,
                        phone: u.phone,
                        whatsapp: u.whatsapp,
                        role: u.role,
                        avatar: u.avatar
                    })
                );
                notifyUserChange();
            })
            .catch((err) => console.error("Error fetching profile:", err))
            .finally(() => setLoading(false));
    }, []);

    /* طلبات الاهتمام على عقارات المالك — endpoint خاص بالمالك
       GET /api/owner/interest-requests → [{ id, tenant, property, owner, status, created_at }] */
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        apiFetch('/api/owner/interest-requests')
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                const list = Array.isArray(data) ? data : data?.results || [];
                if (!Array.isArray(list) || list.length === 0) return;

                setInterestRequests(
                    list.map((item) => ({
                        id: item.id,
                        name: item.tenant_name || item.tenant_full_name || `مستأجر #${item.tenant ?? '—'}`,
                        property: item.property_title || `عقار #${item.property ?? '—'}`,
                        date: item.created_at
                            ? new Date(item.created_at).toLocaleDateString('ar-EG')
                            : '',
                        status: item.status || 'pending',
                        avatar: item.tenant_avatar || item.tenant_image || '',
                    }))
                );
            })
            .catch((err) => console.error('Error fetching interest requests:', err));
    }, []);

    // دالة لتحديث الصورة الشخصية عند التغيير
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
        { id: 1, title: 'العقارات المنشورة', count: statsData.published, icon: <FaBuilding />, color: '#0284c7', bg: '#e0f2fe' },
        { id: 2, title: 'العقارات النشطة', count: statsData.active, icon: <FaHome />, color: '#16a34a', bg: '#dcfce7' },
        { id: 3, title: 'العقارات المؤجرة', count: statsData.rented, icon: <FaKey />, color: '#0284c7', bg: '#e0f2fe' },
        { id: 4, title: 'طلبات الاهتمام', count: statsData.requests, icon: <FaUsers />, color: '#e11d48', bg: '#ffe4e6' },
    ];

    // قائمة افتراضية للعقارات في حال لم توجد داتا راجعة من API
    const displayProperties = recentProperties.length > 0 ? recentProperties : [
        { id: 1, title: 'شقة فاخرة في الرمال', location: 'الرمال - بالقرب من البحر', price: '1,800 شيكل', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80' },
        { id: 2, title: 'منزل في النصر', location: 'النصر - شارع الوحدة', price: '2,500 شيكل', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&q=80' },
        { id: 3, title: 'شقة في الشيخ رضوان', location: 'الشيخ رضوان - شارع الشهداء', price: '1,400 شيكل', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80' },
    ];

    // قائمة افتراضية لطلبات الاهتمام
    const displayRequests = interestRequests.length > 0 ? interestRequests : [
        { id: 1, name: 'خالد محمد', property: 'شقة في الرمال', date: '20 مايو 2024', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
        { id: 2, name: 'محمود محمد', property: 'منزل في النصر', date: '18 مايو 2024', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80' },
        { id: 3, name: 'سامي محمود', property: 'شقة في الشيخ رضوان', date: '19 مايو 2024', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
    ];

    return (
        <div className="owner-profile-app" dir="rtl">
            {/* ناف بار موحد */}
            <Navbar
                onHomeClick={onHomeClick}
                onProfileClick={onProfileClick}
                onChangePasswordClick={onChangePasswordClick}
                onLogoutClick={onLogoutClick}
                  onSearchClick={onSearchClick}
                  onSavedClick={onSavedClick}
                  onRequestsClick={onRequestsClick}
              />

            {/* Main Area */}
            <main className="main-content">
                <div className="breadcrumb">
                    <span>الرئيسية</span> / <span className="active-path">الملف الشخصي</span>
                </div>

                <h1 className="page-title"><FaUserCheck className="title-icon" /> الملف الشخصي</h1>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <FaSpinner className="spinner-icon" style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', color: '#0284c7' }} />
                        <p style={{ marginTop: '1rem', color: '#666' }}>جاري تحميل البيانات...</p>
                    </div>
                ) : (
                    <>
                        {/* Profile Card Header */}
                        <section className="profile-header-card">
                            <div className="profile-info-side">
                                <div className="avatar-wrapper">
                                    <img src={userData.avatar} alt={userData.name} className="profile-avatar-lg" />
                                    <label htmlFor="avatar-upload" className="edit-avatar-btn" style={{ cursor: 'pointer' }}>
                                        {uploadingAvatar ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaEdit />}
                                    </label>
                                    <input
                                        id="avatar-upload"
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
                                    <h2>{userData.name} <FaCheckCircle className="verified-badge" /></h2>
                                    <p className="email">{userData.email}</p>

                                    <div className="badges-row">
                                        <span className="badge-pill"><FaUserCheck /> {userData.role}</span>
                                        <span className="badge-pill"><FaCalendarAlt /> عضو منذ {userData.joinedYear}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-actions-side">
                                <button className="btn-primary" onClick={onAddPropertyClick}><FaPlus /> إضافة عقار جديد</button>
                                <button className="btn-secondary" onClick={onEditProfileClick}>تعديل الملف الشخصي</button>
                            </div>
                        </section>

                        {/* Stats */}
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

                        {/* Dashboard Grid */}
                        <section className="dashboard-grid">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h3><FaHome /> أحدث العقارات المضافة</h3>
                                </div>
                                <div className="card-body">
                                    {displayProperties.map((item) => (
                                        <div key={item.id} className="property-item">
                                            <img src={item.image} alt={item.title} className="prop-img" />
                                            <div className="prop-details">
                                                <h4>{item.title}</h4>
                                                <p>{item.location}</p>
                                                <span className="price">{item.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <a href="#all-properties" className="view-all-link">عرض جميع العقارات</a>
                                </div>
                            </div>

                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h3><FaUsers /> آخر طلبات الاهتمام</h3>
                                </div>
                                <div className="card-body">
                                    {displayRequests.map((req) => (
                                        <div key={req.id} className="op-request-item">
                                            <div className="op-request-user">
                                                <img src={req.avatar} alt={req.name} className="op-req-avatar" />
                                                <div>
                                                    <h4>{req.name}</h4>
                                                    <p>{req.property}</p>
                                                    <span className="op-req-date">{req.date}</span>
                                                </div>
                                            </div>
                                            <div className="op-request-actions">
                                                <button className="btn-accept">قبول</button>
                                                <button className="btn-reject">رفض</button>
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

            {/* الفوتر */}
            <LandingFooter />
        </div>
    );
};

export default OwnerProfile;