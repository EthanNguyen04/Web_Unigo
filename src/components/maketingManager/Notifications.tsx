"use client";
import React, { useState, useEffect } from "react";
import { Post_notification, Get_Noti } from "../../config";
import { FiPlusCircle, FiX, FiSend, FiLoader } from "react-icons/fi";

interface NotificationItem {
  title: string;
  message: string;
  time: string;
}

// Simple Toast Component
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timeout = setTimeout(onClose, 3500);
    return () => clearTimeout(timeout);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded shadow-lg font-semibold drop-shadow-lg animate-fade-in-out z-50">
      {message}
    </div>
  );
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showError = (msg: string) => setToastMsg(msg);

  const fetchNoti = async () => {
    try {
      const res = await fetch(`${Get_Noti}?type=user`);
      const data = await res.json();
      if (data.notifications) {
        const list: NotificationItem[] = data.notifications.map((n: any) => ({
          title: n.title,
          message: n.content,
          time: new Date(n.time).toLocaleString("vi-VN", { hour12: false }),
        }));
        setNotifications(list);
      }
    } catch (err: any) {
      showError("❌ Lỗi khi tải thông báo: " + err.message);
    }
  };

  useEffect(() => {
    fetchNoti();
  }, []);

  const handleAdd = async () => {
    if (!title.trim() || !message.trim()) {
      showError("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("tkn");
      if (!token) throw new Error("Chưa đăng nhập, không thể gửi thông báo.");

      const res = await fetch(Post_notification, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), message: message.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi khi gửi thông báo");

      setShowDialog(false);
      setTitle("");
      setMessage("");
      fetchNoti();
    } catch (err: any) {
      showError("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Thông báo</h2>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg shadow hover:bg-green-700 transition"
          aria-label="Thêm thông báo mới"
        >
          <FiPlusCircle size={20} />
          <span className="font-semibold">Thêm thông báo</span>
        </button>
      </header>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              {["Tiêu đề", "Nội dung", "Thời gian"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {notifications.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400 italic">
                  Chưa có thông báo nào.
                </td>
              </tr>
            )}
            {notifications.map((n, idx) => (
              <tr
                key={idx}
                className="hover:bg-green-50 transition cursor-default"
                title={`${n.title} - ${n.message}`}
              >
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-700">{n.title}</td>
                <td className="px-6 py-4 whitespace-pre-wrap max-w-xl">{n.message}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{n.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => !loading && setShowDialog(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !loading && setShowDialog(false)}
              aria-label="Đóng cửa sổ"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              disabled={loading}
            >
              <FiX size={24} />
            </button>
            <h3 className="text-2xl font-semibold mb-5 text-gray-800">Tạo thông báo mới</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                className="border border-gray-300 rounded-md px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Tiêu đề thông báo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
                required
                maxLength={100}
                aria-label="Tiêu đề thông báo"
              />
              <textarea
                className="border border-gray-300 rounded-md px-4 py-3 text-gray-700 resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Nội dung thông báo"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                required
                maxLength={500}
                aria-label="Nội dung thông báo"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => !loading && setShowDialog(false)}
                  className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <FiLoader className="animate-spin" size={20} /> : <FiSend size={20} />}
                  {loading ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}

      <style jsx>{`
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(10px);}
          10%, 90% { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in-out {
          animation: fade-in-out 4s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default Notifications;