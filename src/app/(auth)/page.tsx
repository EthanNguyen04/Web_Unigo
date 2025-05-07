"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/public/logo.png";
import imgLogin from "@/public/img_login.png";
import { API_LOGIN } from "../../config";

// Hàm kiểm tra định dạng email hợp lệ
const validateEmail = (email: string) => {
  const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return re.test(email);
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const router = useRouter();

  // Kiểm tra token khi trang được tải hoặc làm mới
  useEffect(() => {
    const checkToken = async () => {
      const tokenver = localStorage.getItem("tkn");
      console.log(tokenver)
      if (tokenver) {
        const tokena = "Bearer " + tokenver;
        try {
          const res = await fetch(API_LOGIN, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: tokena,
            },
          });
          const data = await res.json();
          if (res.status === 200) {
            localStorage.setItem("name", data.fullname);
            router.replace("/manager");
          } else {
            router.replace("/");
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra token:", error);
          router.replace("/");
        }
      } else {
        router.replace("/");
      }
    };

    checkToken();
  }, [router]);

  // Countdown cho nút gửi OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpCooldown > 0) {
      interval = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpCooldown]);

  // Validate khi gửi OTP: chỉ cần email hợp lệ
  const validateSendOTP = (): boolean => {
    if (!email.trim()) {
      setMessage("Vui lòng nhập email.");
      return false;
    }
    if (!validateEmail(email)) {
      setMessage("Email không hợp lệ.");
      return false;
    }
    return true;
  };

  // Validate khi đăng nhập: cần email hợp lệ và nhập OTP
  const validateLogin = (): boolean => {
    if (!email.trim()) {
      setMessage("Vui lòng nhập email.");
      return false;
    }
    if (!validateEmail(email)) {
      setMessage("Email không hợp lệ.");
      return false;
    }
    if (!otp.trim()) {
      setMessage("Vui lòng nhập OTP.");
      return false;
    }
    return true;
  };

  // Hàm gửi yêu cầu OTP
  const handleSendOTP = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSending || otpCooldown > 0) return; // Ngăn chặn gửi nhiều lần
    setIsSending(true);
    setMessage("");
    if (!validateSendOTP()) {
      setIsSending(false);
      return;
    }

    try {
      const res = await fetch(API_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Chỉ gửi email, API sẽ tự động tạo OTP nếu không có otp trong body
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Có lỗi xảy ra khi gửi OTP.");
        // Cho phép gửi lại nếu API báo lỗi
        setIsSending(false);
      } else {
        setMessage(data.message || "OTP đã được gửi đến email của bạn.");
        // Sau khi gửi thành công, bắt đầu đếm ngược 60 giây
        setOtpCooldown(60);
        setIsSending(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage("Lỗi: " + error.message);
      } else {
        setMessage("Lỗi không xác định.");
      }
      setIsSending(false);
    }
  };

  // Hàm xử lý đăng nhập với OTP
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoggingIn) return; // Ngăn chặn bấm nhiều lần
    setIsLoggingIn(true);
    setMessage("");
    if (!validateLogin()) {
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await fetch(`${API_LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Gửi cả email và otp để xác thực đăng nhập
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Đăng nhập thất bại.");
        // Cho phép đăng nhập lại nếu API báo lỗi
        setIsLoggingIn(false);
      } else {
        setMessage(data.message + " Đăng nhập thành công.");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("tkn", data.token);
        localStorage.setItem("name", data.fullname);
        localStorage.setItem("role", data.role);
        router.replace("/manager");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage("Lỗi: " + error.message);
      } else {
        setMessage("Lỗi không xác định.");
      }
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      {/* Cột trái: Hình nền */}
      <div className="login-left">
        <Image
          src={imgLogin}
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* Cột phải: Form đăng nhập */}
      <div className="login-right">
        <div className="form-wrapper">
          <div className="logo-section">
            <div className="logo-img">
              <Image
                src={logo}
                alt="Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <h2>Quản trị bán hàng UNIGO</h2>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="otp">OTP</label>
            <div className="otp-group">
              <input
                id="otp"
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                type="button"
                className="otp-btn"
                onClick={handleSendOTP}
                disabled={isSending || otpCooldown > 0}
              >
                {isSending
                  ? "Đang gửi..."
                  : otpCooldown > 0
                  ? `Gửi lại sau ${otpCooldown}s`
                  : "Gửi mã"}
              </button>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }
        .login-left {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        .login-right {
          width: 70%;
          margin-left: -50px;
          position: relative;
          z-index: 2;
          background-color: #ff8000;
          display: flex;
          align-items: center;
          justify-content: center;
          border-top-left-radius: 20px;
          border-bottom-left-radius: 20px;
        }
        .form-wrapper {
          width: 80%;
          max-width: 500px;
          background-color: #fff;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .logo-section {
          margin-bottom: 16px;
        }
        .logo-img {
          position: relative;
          width: 30%;
          aspect-ratio: 1;
          margin: 0 auto 8px;
        }
        h2 {
          font-weight: 600;
          margin: 0;
          color: #ff8000;
          font-size: 24px;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        label {
          color: #ff8000;
          margin-top: 8px;
          font-weight: 500;
        }
        input {
          color: #797780;
          margin-top: 4px;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .otp-group {
          display: flex;
          gap: 8px;
        }
        .otp-group input {
          flex: 1;
        }
        .otp-btn {
          background-color: #ff6b00;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 0 12px;
          cursor: pointer;
        }
        .otp-btn:hover {
          opacity: 0.9;
        }
        .submit-btn {
          margin-top: 16px;
          padding: 12px;
          background-color: #ff6b00;
          color: #fff;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .submit-btn:hover {
          opacity: 0.9;
        }
        p {
          margin-top: 16px;
          color: rgb(0, 26, 255);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
