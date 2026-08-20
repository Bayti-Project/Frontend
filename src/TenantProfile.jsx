import { useState } from 'react';
import './OwnerProfile.css';
import './TenantProfile.css';
import Navbar from './Navbar';
import Footer from './Footer';
import {
    FaBookmark, FaPaperPlane, FaCheckCircle, FaTimesCircle, FaEdit,
    FaUserCheck, FaCalendarAlt, FaUserCircle
} from 'react-icons/fa';

const STATUS_MAP = {
    pending: 'قيد الانتظار',
    accepted: 'مقبول',
    rejected: 'مرفوض',
};

const TenantProfile = ({ currentUser, onHomeClick, onProfileClick, onChangePasswordClick, onEditProfileClick, onLogoutClick }) => {
    const [userData] = useState({
        name: currentUser?.name || 'أحمد محمد',
        email: currentUser?.email || 'ahmed.mohamed@example.com',
        role: currentUser?.role || 'مستأجر',
        joinedYear: currentUser?.createdAt ? new Date(currentUser.createdAt).getFullYear() : '2023',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
    });

    const [stats] = useState([
        { id: 1, title: 'العقارات المحفوظة', count: 18, icon: <FaBookmark />, color: '#0284c7', bg: '#e0f2fe' },
        { id: 2, title: 'الطلبات المرسلة', count: 12, icon: <FaPaperPlane />, color: '#16a34a', bg: '#dcfce7' },
        { id: 3, title: 'الطلبات المقبولة', count: 6, icon: <FaCheckCircle />, color: '#0284c7', bg: '#e0f2fe' },
        { id: 4, title: 'الطلبات المرفوضة', count: 4, icon: <FaTimesCircle />, color: '#e11d48', bg: '#ffe4e6' },
    ]);

    const [savedProperties] = useState([
        { id: 1, title: 'شقة فاخرة في الرمال', location: 'الرمال - بالقرب من البحر', price: '1,800 شيكل', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80' },
        { id: 2, title: 'منزل في النصر', location: 'النصر - شارع الوحدة', price: '2,500 شيكل', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&q=80' },
        { id: 3, title: 'شقة في الشيخ رضوان', location: 'الشيخ رضوان - شارع الشهداء', price: '1,400 شيكل', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80' },
    ]);

    const [interestRequests] = useState([
        { id: 1, property: 'شقة في الرمال', date: '20 مايو 2024', status: 'pending', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80' },
        { id: 2, property: 'منزل في النصر', date: '18 مايو 2024', status: 'accepted', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&q=80' },
        { id: 3, property: 'شقة في الشيخ رضوان', date: '19 مايو 2024', status: 'rejected', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80' },
    ]);

    return (
        <div className="owner-profile-app tenant-profile-app" dir="rtl">
            <Navbar
                onHomeClick={onHomeClick}
                onProfileClick={onProfileClick}
                onChangePasswordClick={onChangePasswordClick}
                onLogoutClick={onLogoutClick}
            />

            <main className="main-content">
                <div className="breadcrumb">
                    <span>الرئيسية</span> / <span className="active-path">الملف الشخصي</span>
                </div>

                <h1 className="page-title"><FaUserCircle className="title-icon" /> الملف الشخصي</h1>

                <section className="profile-header-card tenant-header-card">

                    <div className="profile-info-side">
                        <div className="avatar-wrapper">
                            <img src={userData.avatar} alt={userData.name} className="profile-avatar-lg" />
                            <button className="edit-avatar-btn"><FaEdit /></button>
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
                            {savedProperties.map((item) => (
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
                            {interestRequests.map((req) => (
                                <div key={req.id} className="request-item">
                                    <div className="request-user">
                                        <img src={req.image} alt={req.property} className="req-img" />
                                        <div>
                                            <h4>{req.property}</h4>
                                            <span className="req-date">{req.date}</span>
                                        </div>
                                    </div>
                                    <span className={`status-badge ${req.status}`}>
                                        {STATUS_MAP[req.status]}
                                    </span>
                                </div>
                            ))}
                            <a href="#all-requests" className="view-all-link">عرض جميع الطلبات</a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default TenantProfile;
