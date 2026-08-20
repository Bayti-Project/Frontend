import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import building from "./assets/building.png";

import {
  FaCamera,
  FaUserTie,
  FaBuilding,
  FaArrowLeft,
} from "react-icons/fa";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("مالك عقار");
  const [accountType, setAccountType] = useState("فرد");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [avatar, setAvatar] = useState("");

  const fileInputRef = useRef(null);

  function clearFieldError(fieldName) {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  }

  function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setFieldErrors((prev) => ({ ...prev, avatar: "حجم الصورة يتجاوز 2MB" }));
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.avatar;
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSubmit(e) {
    e.preventDefault();

    const errors = {};
    if (!name.trim()) errors.name = "يرجى تعبئة الحقل";
    if (!phone.trim()) errors.phone = "يرجى تعبئة الحقل";
    if (!email.trim()) errors.email = "يرجى تعبئة الحقل";
    if (!password.trim()) errors.password = "يرجى تعبئة الحقل";

    if (!agree) {
      setError("يجب الموافقة على شروط الخدمة وسياسة الخصوصية.");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("");
      return;
    }

    setError("");
    setFieldErrors({});

    const user = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
      role,
      accountType,
      avatar,
    };

    localStorage.setItem("bayti_user", JSON.stringify(user));
    navigate("/home");
  }

  return (
    <div className="register">

      {/* الصورة */}
      <div className="image-section">

        <img src={building} alt="Building" />

        <div className="overlay"></div>

        <div className="logo">
          Bayti
        </div>

        <div className="image-content">

          <h1>
            مستقبلك يبدأ من هنا
          </h1>

          <p>
            المساحات المكتبية العصرية. بيتي هي وجهتك الموثوقة للاستثمار.
            <br />
            اكتشف أرقى العقارات في قطاع غزة، من الشقق الفاخرة إلى البحث عن السكن المثالي.
          </p>

        </div>

      </div>


      {/* الفورم */}
      <form className="form-section" onSubmit={handleSubmit} noValidate>

        <h2>
          إنشاء حساب جديد
        </h2>

        <p className="subtitle">
          انضم إلى مجتمع بيتي العقاري الرائد في قطاع غزة.
        </p>


        {/* صورة المستخدم */}
        <button
          type="button"
          className="avatar avatar-upload"
          onClick={() => fileInputRef.current?.click()}
          style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
        >
          {!avatar && <FaCamera />}

          <span className="edit-dot"></span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          hidden
          onChange={handleAvatarSelect}
        />

        <p className="upload-text">
          {avatar ? "انقر لتغيير الصورة" : "صورة الملف الشخصي"}
        </p>
        {fieldErrors.avatar && <p className="reg-error" role="alert">{fieldErrors.avatar}</p>}


        {/* الاسم ورقم الهاتف */}
        <div className="row">

          <div className="field">

            <label htmlFor="regName">
              الاسم
            </label>

            <input
              id="regName"
              type="text"
              placeholder="أدخل اسمك"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError("name");
              }}
              className={fieldErrors.name ? "field-error-input" : ""}
            />
            {fieldErrors.name && <span className="field-error-msg">{fieldErrors.name}</span>}

          </div>
          <div className="field">
            <label htmlFor="regPhone">رقم الهاتف</label>

            <input
              id="regPhone"
              type="tel"
              placeholder="059 000 0000"
              dir="ltr"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                clearFieldError("phone");
              }}
              className={fieldErrors.phone ? "field-error-input" : ""}
            />
            {fieldErrors.phone && <span className="field-error-msg">{fieldErrors.phone}</span>}
          </div>

        </div>

        {/* البريد الإلكتروني */}
        <div className="field full">

          <label htmlFor="regEmail">
            البريد الإلكتروني
          </label>

          <input
            id="regEmail"
            type="email"
            placeholder="أدخل البريد الإلكتروني"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            className={fieldErrors.email ? "field-error-input" : ""}
          />
          {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}

        </div>


        {/* كلمة المرور */}
        <div className="field full">

          <label htmlFor="regPassword">
            كلمة المرور
          </label>

          <input
            id="regPassword"
            type="password"
            placeholder="أدخل كلمة المرور"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError("password");
            }}
            className={fieldErrors.password ? "field-error-input" : ""}
          />
          {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}

        </div>


        {/* صفة المستخدم */}
        <div className="field full">

          <label>
            صفة المستخدم
          </label>

          <div className="buttons" role="group" aria-label="صفة المستخدم">

            <button
              type="button"
              className={role === "مالك عقار" ? "option active" : "option"}
              aria-pressed={role === "مالك عقار"}
              onClick={() => setRole("مالك عقار")}
            >

              <FaBuilding />

              مالك عقار

            </button>


            <button
              type="button"
              className={role === "مستأجر" ? "option active" : "option"}
              aria-pressed={role === "مستأجر"}
              onClick={() => setRole("مستأجر")}
            >

              <FaUserTie />

              مستأجر

            </button>

          </div>

        </div>


        {/* نوع الحساب */}
        <div className="field full">

          <label>
            نوع الحساب
          </label>

          <div className="buttons" role="group" aria-label="نوع الحساب">

            <button
              type="button"
              className={accountType === "فرد" ? "option active" : "option"}
              aria-pressed={accountType === "فرد"}
              onClick={() => setAccountType("فرد")}
            >
              فرد
            </button>


            <button
              type="button"
              className={accountType === "مكتب عقاري" ? "option active" : "option"}
              aria-pressed={accountType === "مكتب عقاري"}
              onClick={() => setAccountType("مكتب عقاري")}
            >
              مكتب عقاري
            </button>

          </div>

        </div>


        {/* الموافقة */}
        <div className="agree">

          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => {
              setAgree(e.target.checked);
              setError("");
            }}
          />

          <span>
            أوافق على&nbsp;<a href="#">شروط الخدمة</a>&nbsp;و&nbsp;<a href="#">سياسة الخصوصية</a>&nbsp;الخاصة بمنصة بيتي.
          </span>

        </div>

        {error && <p className="reg-error" role="alert">{error}</p>}


        {/* زر إنشاء الحساب */}
        <button type="submit" className="register-btn">

          إنشاء حساب

          <FaArrowLeft />

        </button>


        {/* تسجيل الدخول */}
        <p className="login">

          لديك حساب بالفعل؟

          <a href="/login">
            تسجيل الدخول
          </a>

        </p>

      </form>

    </div>
  );
}

export default Register;
