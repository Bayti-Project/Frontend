import { useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingFooter from "./components/LandingFooter";
import AuthPromptModal from "./components/AuthPromptModal";
import { resolveMediaUrl, clearCredentials, isOwnerRole, isTenantRole } from "./services/api.js";
import defaultAvatar from "./components/default-avatar.svg";
import "./styles/style.css";

import ResetPasswordForm from "./ResetPasswordForm/ResetPasswordForm";
import ChangePasswordForm from "./ChangePasswordForm/ChangePasswordForm";
import OwnerProfile from "./OwnerProfile/OwnerProfile";
import TenantProfile from "./TenantProfile/TenantProfile";
import EditProfile from "./EditProfile/EditProfile";
import Home from "./HomeVisitor/HomeVisitor";
import HomeTenant from "./HomeTenant/HomeTenant";
import OwnerHome from "./OwnerHome/OwnerHome";
import OwnerDashboard from "./ownerDashboard/OwnerDashboard";
import PropertyEditPage from "./PropertyEditPage/PropertyEditPage";
import AddPropertyPage from "./AddPropertyPage/AddPropertyPage";
import AddPropertyPhotosPage from "./AddPropertyPhotosPage/AddPropertyPhotosPage";
import AddPropertyPreviewPage from "./AddPropertyPreviewPage/AddPropertyPreviewPage";
import Login from "./Login/Login";
import Register from "./Register/Register";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import PropertyDetailsOwner from "./PropertyDetailsOwner/PropertyDetailsOwner";
import SavedPropertiesPage from "./SavedPropertiesPage/SavedPropertiesPage";
import SearchPage from "./Search/search";
import PropertySearchPage from "./PropertySearch/PropertySearch";
import MyRequests from "./myRequests/my requests.jsx";
import Notifications from "./notifications/Notifications.jsx";
import OwnerRequests from "./ownerRequests/OwnerRequests.jsx";


const isLoggedIn = () => Boolean(localStorage.getItem("access_token"));

/**
 * يمنع الزائر غير المسجّل من الوصول لصفحة تفاصيل العقار من أي رابط،
 * ويعرض نافذة "يجب إنشاء حساب لعرض التفاصيل" بدلاً منها.
 */
function RequireAuth({ children }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [token] = useState(isLoggedIn);

  if (token) return children;

  return (
    <div className="page" dir="rtl">
      <AuthPromptModal
        property={{ id }}
        intent="details"
        onClose={() => navigate(-1)}
      />
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [view, setView] = useState("password");

  const [user, setUser] = useState(() => {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem("bayti_user") || "null");
    } catch {
      saved = null;
    }
    /* ما في fallback ثابت لـrole — لو ما في مستخدم محفوظ بيضل "" (زائر)
      Fallback "مالك" كان بيسبّب المستأجر يفتح صفحات المالك */
    return {
      name: saved?.name || "",
      email: saved?.email || "",
      role: saved?.role || "",
      accountType: saved?.accountType || "",
      phone: saved?.phone || "",
      createdAt: saved?.createdAt || "",
      avatar: resolveMediaUrl(saved?.avatar) || defaultAvatar,
      city: saved?.city || "",
      bio: saved?.bio || "",
    };
  });

  const navProps = {
    onPropertyClick: (id) => navigate(`/property/${id}`),
    onSearchClick: () => navigate("/search"),
    /* صفحة الطلبات تختلف حسب دور المستخدم: للمالك "طلبات الاهتمام"، وللمستأجر "طلباتي" */
    onRequestsClick: () => {
      navigate(isOwnerRole(user.role) ? "/owner-requests" : "/my-requests");
    },
    onSavedClick: () => navigate("/saved"),
    onHomeClick: () => {
      setView("password");
      if (isTenantRole(user.role)) navigate("/home-tenant");
      else if (isOwnerRole(user.role)) navigate("/home-owner");
      else navigate("/");
    },
    onProfileClick: () => {
      try {
        const saved = JSON.parse(localStorage.getItem("bayti_user") || "null");
        if (saved) setUser((prev) => ({ ...prev, ...saved }));
      } catch {
        /* تجاهل بيانات localStorage غير الصالحة */
      }
      setView("profile");
    },
    onChangePasswordClick: () => {
      setView("password");
      navigate("/change-password");
    },
    onLogoutClick: () => {
      setView("password");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("bayti_user");
      // مهم: بدون مسح بيانات الاعتماد يبقى refreshTokens يعيد تسجيل الدخول تلقائياً
      clearCredentials();
      setUser({
        name: "",
        email: "",
        role: "",
        accountType: "",
        phone: "",
        createdAt: "",
        avatar: defaultAvatar,
        city: "",
        bio: "",
      });
      navigate("/login");
    },
  };

  if (view === "profile") {
    const isOwner = isOwnerRole(user.role);
    const profileProps = {
      currentUser: user,
      ...navProps,
      onEditProfileClick: () => setView("edit"),
      onAddPropertyClick: () => {
        setView("password");
        navigate("/add-property");
      },
    };
    return isOwner ? <OwnerProfile {...profileProps} /> : <TenantProfile {...profileProps} />;
  }

  if (view === "edit") {
    return (
      <EditProfile
        currentUser={user}
        onSave={(updated) => {
          setUser((prev) => {
            const merged = { ...prev, ...updated };
            try {
              localStorage.setItem("bayti_user", JSON.stringify(merged));
            } catch {
              /* تجاهل تعذر الحفظ */
            }
            return merged;
          });
          setView("profile");
        }}
        onCancel={() => setView("profile")}
        {...navProps}
      />
    );
  }

  return (
    <Routes>
      {/* 1. إضافة مسار الصفحة الرئيسية للرابط الأساسي "/" */}

      <Route path="/" element={<Home {...navProps} />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/home" element={<Home {...navProps} />} />
      <Route path="/home-tenant" element={<HomeTenant {...navProps} />} />
      <Route
        path="/saved"
        element={
          <div className="page" dir="rtl">
            <Navbar {...navProps} />
            <SavedPropertiesPage
              onOpenDetails={(id) => navigate(id ? `/property/${id}` : "/search")}
            />
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/my-requests"
        element={
          <RequireAuth>
            <div className="page" dir="rtl">
              <Navbar {...navProps} />
              <MyRequests />
              <LandingFooter />
            </div>
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <div className="page" dir="rtl">
              <Navbar {...navProps} />
              <Notifications onOpenLink={(path) => navigate(path)} />
              <LandingFooter />
            </div>
          </RequireAuth>
        }
      />
      <Route
        path="/owner-requests"
        element={
          <RequireAuth>
            <div className="page" dir="rtl">
              <Navbar {...navProps} />
              <OwnerRequests />
              <LandingFooter />
            </div>
          </RequireAuth>
        }
      />
      <Route path="/search" element={<SearchPage {...navProps} />} />
      <Route path="/property-search" element={<PropertySearchPage {...navProps} />} />
      <Route
        path="/owner-dashboard"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <OwnerDashboard />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/home-owner"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <OwnerHome />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/property-edit/:id"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <PropertyEditPage />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/property-owner/:id"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <PropertyDetailsOwner />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/add-property/photos"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <AddPropertyPhotosPage />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/add-property/preview"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <AddPropertyPreviewPage />
            </main>
            <LandingFooter />
          </div>
        }
      />
      <Route
        path="/add-property"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <AddPropertyPage />
            </main>
            <LandingFooter />
          </div>
        }
      />

      <Route
        path="/property/:id"
        element={
          <RequireAuth>
            <div className="page">
              <Navbar {...navProps} />
              <main className="main">
                <PropertyDetailsOwner />
              </main>
              <LandingFooter />
            </div>
          </RequireAuth>
        }
      />
      <Route
        path="/change-password"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <ChangePasswordForm />
            </main>
            <LandingFooter />
          </div>
        }
      />
      {/* صفحة إعادة تعيين كلمة المرور بكل الصيغ الممكنة، مع ناف بار مثل باقي الصفحات */}
      <Route path="/reset-password" element={<ResetPasswordForm />} />
      <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
      <Route
        path="/ResetPasswordForm"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <ResetPasswordForm />
            </main>
          </div>
        }
      />

      {/* المسار الاحتياطي يحوّل لأي رابط غير معروف إلى الصفحة الرئيسية */}
      <Route path="*" element={<Home {...navProps} />} />
    </Routes>
  );
}
