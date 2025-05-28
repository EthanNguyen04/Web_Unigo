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
  const [isCheckingToken, setIsCheckingToken] = useState(true);
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
      setIsCheckingToken(false);
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
      {isCheckingToken && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Đang kiểm tra phiên đăng nhập...</p>
        </div>
      )}
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
              disabled={isLoggingIn || !otp.trim()}
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
          background: linear-gradient(135deg, #fff5e6 0%, #fff 100%);
        }
        .login-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
        }
        .login-right {
          width: 65%;
          margin-left: -30px;
          position: relative;
          z-index: 2;
          background: linear-gradient(135deg, #ff8000 0%, #ff6b00 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border-top-left-radius: 30px;
          border-bottom-left-radius: 30px;
          box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
        }
        .form-wrapper {
          width: 85%;
          max-width: 450px;
          background-color: #fff;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          text-align: center;
        }
        .logo-section {
          margin-bottom: 24px;
        }
        .logo-img {
          position: relative;
          width: 35%;
          aspect-ratio: 1;
          margin: 0 auto 16px;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }
        h2 {
          font-weight: 700;
          margin: 0;
          color: #ff8000;
          font-size: 28px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .login-form {
          display: flex;
          flex-direction: column;
          text-align: left;
          gap: 16px;
        }
        label {
          color: #ff8000;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
          display: block;
        }
        input {
          color: #333;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          background-color: #f8f8f8;
        }
        input:focus {
          outline: none;
          border-color: #ff8000;
          box-shadow: 0 0 0 3px rgba(255, 128, 0, 0.1);
          background-color: #fff;
        }
        .otp-group {
          display: flex;
          gap: 12px;
        }
        .otp-group input {
          flex: 1;
        }
        .otp-btn {
          background: linear-gradient(135deg, #ff8000 0%, #ff6b00 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0 20px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          white-space: nowrap;
          min-width: 120px;
        }
        .otp-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 0, 0.2);
        }
        .otp-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .submit-btn {
          margin-top: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #ff8000 0%, #ff6b00 100%);
          color: #fff;
          font-weight: 600;
          font-size: 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 0, 0.2);
        }
        .submit-btn:disabled {
          background: #e0e0e0;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
          opacity: 0.7;
        }
        p {
          margin-top: 20px;
          color: #0066ff;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          padding: 8px;
          border-radius: 6px;
          background-color: rgba(0, 102, 255, 0.1);
        }
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #ff8000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-overlay p {
          color: #ff8000;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
          background: none;
        }
      `}</style>
    </div>
  );
}
