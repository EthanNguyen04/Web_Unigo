'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'login' | 'otp'>('login'); // Quản lý bước: login hoặc otp
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/'; // Lấy redirect từ query parameter

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Thêm timeout 10 giây cho yêu cầu API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('http://192.168.0.20:3000/api/user/login_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(step === 'login' ? { email, password } : { email, password, otp }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Hủy timeout nếu yêu cầu hoàn tất

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      if (step === 'login' && data.message === 'OTP đã được gửi đến email của bạn.') {
        setStep('otp');
        setLoading(false);
        return;
      }

      if (step === 'otp' && data.message === 'Đăng nhập thành công') {
        // In thông tin đăng nhập thành công ra console
        console.log('Đăng nhập thành công:', {
          email,
          token: data.token,
          redirect,
        });

        // Lưu token vào cookie
        document.cookie = `auth_token=${data.token}; path=/; max-age=36000; SameSite=Strict`;
        // Chuyển hướng đến trang redirect hoặc trang chính (dashboard)
        router.push(redirect);
      }
    } catch (err) {
      setLoading(false);
      if (err.name === 'AbortError') {
        setError('Yêu cầu đã hết thời gian. Vui lòng kiểm tra kết nối và thử lại.');
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        console.error('Login error:', err);
      }
    }
  };

  // Hàm xử lý khi nhấn "Quay lại"
  const handleBack = () => {
    setStep('login'); // Quay lại bước đăng nhập
    setEmail(''); // Xóa dữ liệu email
    setPassword(''); // Xóa dữ liệu password
    setOtp(''); // Xóa dữ liệu OTP (nếu cần)
    setError(''); // Xóa thông báo lỗi (nếu có)
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-500 to-indigo-600">
      {/* Container chính chiếm toàn bộ màn hình */}
      <div className="w-full h-screen flex items-center justify-center">
        {/* Form container với chiều rộng tối đa nhưng vẫn có padding */}
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Đăng nhập Admin</h1>
            <p className="text-gray-500 mt-2">Quản lý hệ thống Unigo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {step === 'login' ? (
              <>
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Email"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Mật khẩu"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Mã OTP"
                    required
                  />
                  <p className="mt-3 text-sm text-gray-500">
                    Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm thư mục spam).
                  </p>
                </div>
              </>
            )}

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium text-lg ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors duration-200`}
            >
              {loading
                ? 'Đang xử lý...'
                : step === 'login'
                ? 'Đăng nhập'
                : 'Xác nhận OTP'}
            </button>
          </form>

          {step === 'otp' && (
            <button
              onClick={handleBack} // Sử dụng hàm handleBack thay vì setStep trực tiếp
              className="mt-6 w-full text-center text-blue-600 hover:underline text-sm"
            >
              Quay lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}