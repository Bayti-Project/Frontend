import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ResetPasswordForm from "./ResetPasswordForm";
import ChangePasswordForm from "./ChangePasswordForm";
import OwnerProfile from "./OwnerProfile";
import TenantProfile from "./TenantProfile";
import EditProfile from "./EditProfile";
import Home from "./Home";
import Login from "./Login";
import Register from "./register";
import ForgotPassword from "./ForgotPassword";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./style.css";

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
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      city: "غزة - الرمال",
      bio: "صاحب عقارات في قطاع غزة",
    };
  });

  const navProps = {
    onHomeClick: () => {
      setView("password");
      navigate("/home");
    },
    onProfileClick: () => {
      try {
        const saved = JSON.parse(localStorage.getItem("bayti_user") || "null");
        if (saved) setUser((prev) => ({ ...prev, ...saved }));
      } catch {}
      setView("profile");
    },
    onChangePasswordClick: () => {
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
    };
    return isOwner ? (
      <OwnerProfile {...profileProps} />
    ) : (
      <TenantProfile {...profileProps} />
    );
  }

  if (view === "edit") {
    return (
      <EditProfile
        currentUser={user}
        onSave={(updated) => {
          setUser({ ...user, ...updated });
          setView("profile");
        }}
        onCancel={() => setView("profile")}
        {...navProps}
      />
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/home" element={<Home {...navProps} />} />
      <Route
        path="/change-password"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <ChangePasswordForm />
            </main>
            <Footer />
          </div>
        }
      />
      <Route path="/reset-password" element={<ResetPasswordForm />} />
      <Route
        path="*"
        element={
          <div className="page">
            <Navbar {...navProps} />
            <main className="main">
              <ResetPasswordForm />
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}
