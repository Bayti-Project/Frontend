import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingFooter from "./components/LandingFooter";
import { resolveMediaUrl } from "./services/api.js";
import "./styles/style.css";

import ResetPasswordForm from "./ResetPasswordForm/ResetPasswordForm";
import ChangePasswordForm from "./ChangePasswordForm/ChangePasswordForm";
import OwnerProfile from "./OwnerProfile/OwnerProfile";
import TenantProfile from "./TenantProfile/TenantProfile";
import EditProfile from "./EditProfile/EditProfile";
import Home from "./HomeVisitor/HomeVisitor";
import HomeTenant from "./HomeTenant/HomeTenant";
import OwnerHome from "./OwnerHome/OwnerHome";
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
    return {
      name: saved?.name || "أحمد محمد",
      email: saved?.email || "ahmed.mohamed@example.com",
      role: saved?.role || "مالك",
      accountType: saved?.accountType || "فرد",
      phone: saved?.phone || "0598 123 456",
      createdAt: "2023-01-01",
      avatar: resolveMediaUrl(saved?.avatar) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      city: "غزة - الرمال",
      bio: "صاحب عقارات في قطاع غزة",
    };
  });

  const navProps = {
    onPropertyClick: (id) => navigate(`/property/${id}`),
    onSearchClick: () => navigate("/search"),
    onSavedClick: () => navigate("/saved"),
    onHomeClick: () => {
      setView("password");
      const role = user.role || "";
      const isTenant = role.includes("مستأجر") || role === "tenant";
      const isOwner = role.includes("مالك") || role === "owner";
      if (isTenant) navigate("/home-tenant");
      else if (isOwner) navigate("/home-owner");
      else navigate("/home");
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
      setUser({
        name: "أحمد محمد",
        email: "ahmed.mohamed@example.com",
        role: "مالك",
        accountType: "فرد",
        phone: "0598 123 456",
        createdAt: "2023-01-01",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
        city: "غزة - الرمال",
        bio: "صاحب عقارات في قطاع غزة",
      });
      navigate("/login");
    },
  };

  if (view === "profile") {
    const isOwner = (user.role || "").includes("مالك");
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
      <Route path="/search" element={<SearchPage {...navProps} />} />
      <Route path="/property-search" element={<PropertySearchPage {...navProps} />} />
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
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <PropertyDetailsOwner />   {/* بدل PropertyDetailsPage */}
            </main>
            <LandingFooter />
          </div>
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
