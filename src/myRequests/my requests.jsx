import { useState } from 'react';
import './my requests.css';

const MyRequests = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedRequestId, setSelectedRequestId] = useState(4); // تعيين الطلب رقم 4 افتراضياً

    const requestsList = [
        {
            id: 1,
            title: "شقة في الشمس وإطلالة مفتوحة",
            location: "الرمال، غزة",
            time: "منذ ساعتين",
            status: "قيد المراجعة",
            statusType: "pending",
            ownerName: "محمد أبو سليم",
            ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
            orderNum: "#0001",
            propertyType: "شقة عائلية",
            date: "29 سبتمبر 2026",
            region: "الرمال، غزة",
            message: "مرحباً، أود استفسار عن إمكانية معاينة الشقة خلال هذا الأسبوع."
        },
        {
            id: 2,
            title: "بيت عائلي هادئ قرب البحر",
            location: "النصر، غزة",
            time: "أمس 06:42 م",
            status: "مقبولة",
            statusType: "approved",
            ownerName: "أحمد العبد",
            ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
            orderNum: "#0002",
            propertyType: "بيت مستقل",
            date: "15 سبتمبر 2026",
            region: "النصر، غزة",
            message: "مرحباً، أود معرفة التفاصيل المتاحة لشروط العقد والتأمين."
        },
        {
            id: 3,
            title: "شقة في الشمس وإطلالة مفتوحة",
            location: "الرمال، غزة",
            time: "12 سبتمبر 2024",
            status: "مرفوضة",
            statusType: "rejected",
            ownerName: "خالد منصور",
            ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
            orderNum: "#0003",
            propertyType: "دوبلكس مفروش",
            date: "12 سبتمبر 2024",
            region: "الرمال، غزة",
            message: "تم رفض الطلب نظراً لحجز العقار لمستأجر آخر."
        },
        {
            id: 4,
            title: "دوبلكس مشمس للعائلات الصغيرة",
            location: "الشيخ رضوان، غزة",
            time: "10 سبتمبر 2024",
            status: "قيد المراجعة",
            statusType: "pending",
            ownerName: "محمد أبو سليم",
            ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
            orderNum: "#0004",
            propertyType: "دوبلكس مشمس للعائلات الصغيرة",
            date: "10 سبتمبر 2024",
            region: "الشيخ رضوان، غزة",
            message: "مرحباً، أنا مهتم بهذا العقار وأرغب في معرفة المزيد من التفاصيل وموعد مناسب للمعاينة."
        }
    ];

    // فلترة العناصر للعرض القائمة
    const filteredRequests = requestsList.filter((req) => {
        if (activeTab === 'approved') return req.statusType === 'approved';
        if (activeTab === 'rejected') return req.statusType === 'rejected';
        if (activeTab === 'pending') return req.statusType === 'pending';
        return true;
    });

    // جلب معلومات الطلب المحدد (افتراضياً طلب رقم 4)
    const selectedRequest = requestsList.find(req => req.id === selectedRequestId) || requestsList[3];

    return (
        <div className="page-layout" dir="rtl">

            {/* المحتوى الرئيسي */}
            <main className="main-container">

                {/* عنوان الصفحة والعنوان الفرعي */}
                <div className="page-header">
                    <span className="sub-title">متابعة التواصل</span>
                    <h1 className="main-title">طلباتي</h1>
                    <p className="header-desc">تابع حالة طلبات التواصل مع المالكيين</p>
                </div>

                {/* التبويبات الفلاتر (Tabs) */}
                <div className="tabs-bar">
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        كل الطلبات <span className="tab-badge blue">{requestsList.length}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rejected')}
                    >
                        مرفوضة <span className="tab-badge gray">{requestsList.filter(r => r.statusType === 'rejected').length}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approved')}
                    >
                        مقبولة <span className="tab-badge gray">{requestsList.filter(r => r.statusType === 'approved').length}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        قيد المراجعة <span className="tab-badge gray">{requestsList.filter(r => r.statusType === 'pending').length}</span>
                    </button>
                </div>

                {/* شبكة محتوى الطلبات */}
                <div className="requests-grid">

                    {/* قائمة الطلبات */}
                    <div className="requests-list">
                        {filteredRequests.map((item) => (
                            <div
                                key={item.id}
                                className={`request-item ${selectedRequestId === item.id ? 'active' : ''}`}
                                onClick={() => setSelectedRequestId(item.id)}
                            >
                                <div className="item-right">
                                    <img src={item.ownerAvatar} alt="Avatar" className="item-avatar" />
                                    <div className="item-details">
                                        <h4 className="item-title">{item.title}</h4>
                                        <span className="item-location">{item.location}</span>
                                    </div>
                                </div>

                                <div className="item-left">
                                    <span className={`status-pill ${item.statusType}`}>
                                        • {item.status}
                                    </span>
                                    <span className="item-time">{item.time}</span>
                                    <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* تفاصيل الطلب المحدد */}
                    <div className="request-details-card">
                        {/* تم نقل "تفاصيل الطلب" ليكون الأول وحالة الطلب ليكون الثاني */}
                        <div className="card-top-bar">
                            <span className="order-number">تفاصيل الطلب {selectedRequest.orderNum}</span>
                            <span className={`status-pill ${selectedRequest.statusType}`}>
                                • {selectedRequest.status}
                            </span>
                        </div>

                        <div className="owner-info">
                            <img src={selectedRequest.ownerAvatar} alt="Owner" className="owner-avatar" />
                            <div className="owner-text">
                                <span className="owner-label">مالك العقار</span>
                                <h4 className="owner-name" style={{ margin: 0 }}>{selectedRequest.ownerName}</h4>
                            </div>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">العقار</span>
                                <span className="info-val">{selectedRequest.propertyType}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">تاريخ الطلب</span>
                                <span className="info-val">{selectedRequest.date}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">المنطقة</span>
                                <span className="info-val">{selectedRequest.region}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">الحالة</span>
                                <span className={`status-pill-small ${selectedRequest.statusType}`}>
                                    • {selectedRequest.status}
                                </span>
                            </div>
                        </div>

                        <div className="message-box">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00a896" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>{selectedRequest.message}</span>
                        </div>
                    </div>

                </div>

            </main>

        </div>
    );
};

export default MyRequests;
