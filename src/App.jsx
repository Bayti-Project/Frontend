import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ResetPasswordForm from "./ResetPasswordForm";
import ChangePasswordForm from "./ChangePasswordForm";
import OwnerProfile from "./OwnerProfile";
import Login from "./Login";
import Register from "./register";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./style.css";

export default function App() {
  const [page, setPage] = useState("reset");
  const [view, setView] = useState("password");

  if (view === "profile") {
    return <OwnerProfile />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="*"
        element={
          <div className="page">
            <Navbar
              onProfileClick={() => setView("profile")}
              onChangePasswordClick={() => {
                setPage("change");
                setView("password");
              }}
            />

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
