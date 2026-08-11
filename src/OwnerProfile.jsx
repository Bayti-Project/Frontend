import { useState } from 'react';
import './OwnerProfile.css';
import {
    FaBuilding, FaHome, FaKey, FaUsers, FaPlus, FaEdit,
    FaCheckCircle, FaBell, FaUserCheck, FaCalendarAlt, FaEnvelope, FaPhoneAlt,
    FaFacebookF, FaInstagram, FaLinkedinIn
} from 'react-icons/fa';

const OwnerProfile = ({ currentUser }) => {
    const [userData] = useState({
        name: currentUser?.name || 'أحمد محمد',
        email: currentUser?.email || 'ahmed.mohamed@example.com',
        role: currentUser?.role || 'مالك',
        joinedYear: currentUser?.createdAt ? new Date(currentUser.createdAt).getFullYear() : '2023',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
    });

    const stats = [
        { id: 1, title: 'العقارات المنشورة', count: 20, icon: <FaBuilding />, color: '#0284c7', bg: '#e0f2fe' },
        { id: 2, title: 'العقارات النشطة', count: 12, icon: <FaHome />, color: '#16a34a', bg: '#dcfce7' },
        { id: 3, title: 'العقارات المؤجرة', count: 8, icon: <FaKey />, color: '#0284c7', bg: '#e0f2fe' },
        { id: 4, title: 'طلبات الاهتمام', count: 24, icon: <FaUsers />, color: '#e11d48', bg: '#ffe4e6' },
    ];

    const recentProperties = [
        { id: 1, title: 'شقة فاخرة في الرمال', location: 'الرمال - بالقرب من البحر', price: '1,800 شيكل', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80' },
        { id: 2, title: 'منزل في النصر', location: 'النصر - شارع الوحدة', price: '2,500 شيكل', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200&q=80' },
        { id: 3, title: 'شقة في الشيخ رضوان', location: 'الشيخ رضوان - شارع الشهداء', price: '1,400 شيكل', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80' },
    ];

    const interestRequests = [
        { id: 1, name: 'خالد محمد', property: 'شقة في الرمال', date: '20 مايو 2024', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
        { id: 2, name: 'محمود محمد', property: 'منزل في النصر', date: '18 مايو 2024', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80' },
        { id: 3, name: 'سامي محمود', property: 'شقة في الشيخ رضوان', date: '19 مايو 2024', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
    ];

    return (
        <div className="owner-profile-app" dir="rtl">
            {/* Header */}
            <header className="navbar">
                <div className="nav-container">
                    <div className="nav-logo">
                        <span className="logo-text">بيتي <small>Bayti</small></span>
                    </div>
                    <nav className="nav-links">
                        <a href="#home" className="active">الرئيسية</a>
                        <a href="#properties">العقارات</a>
                        <a href="#favorites">المفضلة</a>
                        <a href="#support">الدعم</a>
                    </nav>
                    <div className="nav-actions">
                        <button className="icon-btn"><FaBell /></button>
                        <img src={userData.avatar} alt={userData.name} className="user-avatar-small" />
                    </div>
                </div>
            </header>

            {/* Main Area */}
            <main className="main-content">
                <div className="breadcrumb">
                    <span>الرئيسية</span> / <span className="active-path">الملف الشخصي</span>
                </div>

                <h1 className="page-title"><FaUserCheck className="title-icon" /> الملف الشخصي</h1>

                {/* Profile Card Header */}
                <section className="profile-header-card">
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
                        <button className="btn-primary"><FaPlus /> إضافة عقار جديد</button>
                        <button className="btn-secondary">تعديل الملف الشخصي</button>
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
                            {recentProperties.map((item) => (
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
                            {interestRequests.map((req) => (
                                <div key={req.id} className="request-item">
                                    <div className="request-user">
                                        <img src={req.avatar} alt={req.name} className="req-avatar" />
                                        <div>
                                            <h4>{req.name}</h4>
                                            <p>{req.property}</p>
                                            <span className="req-date">{req.date}</span>
                                        </div>
                                    </div>
                                    <div className="request-actions">
                                        <button className="btn-accept">قبول</button>
                                        <button className="btn-reject">رفض</button>
                                    </div>
                                </div>
                            ))}
                            <a href="#all-requests" className="view-all-link">عرض جميع الطلبات</a>
                        </div>
                    </div>
                </section>
            </main>

            {/* الفوتر المماثل لـ Figma */}
            <footer className="footer-full">
                <div className="footer-container">
                    <div className="footer-col brand-col">
                        <div className="footer-logo">
                            <span className="logo-text-footer">بيتي <small>Bayti</small></span>
                        </div>
                        <p className="footer-desc">
                            بيتي هي وجهتك الموثوقة لكل ما يتعلق بالعقارات في قطاع غزة. الجودة والسرعة والأمان شعارنا.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>روابط سريعة</h4>
                        <ul>
                            <li><a href="#home">الرئيسية</a></li>
                            <li><a href="#properties">العقارات</a></li>
                            <li><a href="#about">من نحن</a></li>
                            <li><a href="#how">كيف تعمل المنصة</a></li>
                            <li><a href="#support">الدعم الفني</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>أنواع العقارات</h4>
                        <ul>
                            <li><a href="#apartments">شقق</a></li>
                            <li><a href="#houses">منازل</a></li>
                            <li><a href="#lands">أراضي</a></li>
                            <li><a href="#offices">مكاتب</a></li>
                            <li><a href="#stores">محلات</a></li>
                            <li><a href="#warehouses">مخازن</a></li>
                        </ul>
                    </div>

                    <div className="footer-col contact-col">
                        <h4>تواصل معنا</h4>
                        <p><FaEnvelope /> info@bayti.ps</p>
                        <p><FaPhoneAlt /> 0598 123 456</p>
                        <p><FaPhoneAlt /> 0598 123 456</p>

                        <div className="social-links">
                            <span>تابعنا على</span>
                            <div className="social-icons">
                                <a href="#fb"><FaFacebookF /></a>
                                <a href="#insta"><FaInstagram /></a>
                                <a href="#linkedin"><FaLinkedinIn /></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2024 بيتي - جميع الحقوق محفوظة لقطاع غزة</p>
                </div>
            </footer>
        </div>
    );
};

export default OwnerProfile;