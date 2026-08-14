import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ResetPasswordForm from "./ResetPasswordForm";
import ChangePasswordForm from "./ChangePasswordForm";
import OwnerProfile from "./OwnerProfile";
import EditProfile from "./EditProfile";
import Login from "./Login";
import Register from "./register";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./style.css";

export default function App() {
  const [page, setPage] = useState("reset");
  const [view, setView] = useState("password");
  const [user, setUser] = useState({
    name: "أحمد محمد",
    email: "ahmed.mohamed@example.com",
    role: "مالك",
    createdAt: "2023-01-01",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    phone: "0598 123 456",
    city: "غزة - الرمال",
    bio: "صاحب عقارات في قطاع غزة",
  });

  const navProps = {
    onProfileClick: () => setView("profile"),
    onChangePasswordClick: () => {
      setPage("change");
      setView("password");
    },
  };

  if (view === "profile") {
    return (
      <OwnerProfile
        currentUser={user}
        {...navProps}
        onEditProfileClick={() => setView("edit")}
      />
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
      <Route
        path="*"
        element={
          <div className="page">
            <Navbar {...navProps} />

            <div className="tabs" role="tablist">
              <button
                className={page === "reset" ? "tab active" : "tab"}
                onClick={() => setPage("reset")}
              >
                إعادة تعيين كلمة المرور
              </button>
              <button
                className={page === "change" ? "tab active" : "tab"}
                onClick={() => setPage("change")}
              >
                تغيير كلمة المرور
              </button>
            </div>

            <main className="main">
              {page === "reset" ? <ResetPasswordForm /> : <ChangePasswordForm />}
            </main>

            <Footer />
          </div>
        }
      />
    </Routes>
  );
}
