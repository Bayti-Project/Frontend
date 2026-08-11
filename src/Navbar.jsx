import { useState } from "react";
import { FaBell, FaUserCircle, FaUser, FaKey } from "react-icons/fa";

export default function Navbar({ onProfileClick, onChangePasswordClick }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="site-header">
      <a href="#" className="logo">
        <img src="/logo.png" alt="بيتي Bayti" className="logo-img" />
      </a>

      <nav>
        <ul className="main-nav">
          <li><a href="#">الرئيسية</a></li>
          <li><a href="#">الوحدات</a></li>
          <li><a href="#">الخدمات</a></li>
          <li><a href="#">تواصل معنا</a></li>
        </ul>
      </nav>

      <div className="header-actions">
        <div className="notif-menu">
          <button
            className="icon-btn"
            aria-label="الإشعارات"
            onClick={() => setShowNotif((prev) => !prev)}
          >
            <FaBell />
            <span className="notif-badge">3</span>
          </button>

          {showNotif && (
            <div className="notif-panel">
              <div className="notif-head">الإشعارات</div>
              <div className="notif-item">
                <span className="notif-dot"></span>
                <div>
                  <div>عرض جديد على وحدتك</div>
                  <div className="notif-time">قبل 5 دقائق</div>
                </div>
              </div>
              <div className="notif-item">
                <span className="notif-dot"></span>
                <div>
                  <div>تم قبول طلبك بنجاح</div>
                  <div className="notif-time">قبل ساعة</div>
                </div>
              </div>
              <div className="notif-empty">لا توجد إشعارات أخرى</div>
            </div>
          )}
        </div>

        <div className="avatar-menu">
          <button
            className="avatar"
            aria-label="الملف الشخصي"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            <FaUserCircle />
          </button>

          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={onProfileClick}>
                <FaUser /> الملف الشخصي
              </button>
              <button onClick={onChangePasswordClick}>
                <FaKey /> تغيير كلمة المرور
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
