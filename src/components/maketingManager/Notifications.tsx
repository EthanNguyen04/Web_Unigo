// src/components/maketingManager/Notifications.tsx

"use client";
import React, { useState, useEffect } from "react";
import { Post_notification, Get_Noti } from "../../config";

interface NotificationItem {
  title: string;
  message: string;
  time: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch existing notifications (default type = user)
  const fetchNoti = async () => {
    try {
      const res = await fetch(`${Get_Noti}?type=user`);
      const data = await res.json();
      if (data.notifications) {
        const list: NotificationItem[] = data.notifications.map((n: any) => ({
          title: n.title,
          message: n.content,
          time: n.time
        }));
        setNotifications(list);
      }
    } catch (err: any) {
      alert("❌ Lỗi khi tải thông báo: " + err.message);
    }
  };

  useEffect(() => {
    fetchNoti();
  }, []);

  const handleAdd = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung.");
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

      // Clear form and close dialog
      setShowDialog(false);
      setTitle("");
      setMessage("");

      // Refetch list to include new notification
      fetchNoti();
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Thông báo</h2>
        <button
          onClick={() => setShowDialog(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Thêm thông báo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Tiêu đề</th>
              <th className="p-2 border">Nội dung</th>
              <th className="p-2 border">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-2 border">{n.title}</td>
                <td className="p-2 border">{n.message}</td>
                <td className="p-2 border">{n.time}</td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  Chưa có thông báo nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex justify-center items-center z-50">
          <div className="bg-[#FFF] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tạo thông báo mới</h3>
            <div className="space-y-3">
              <input
                type="text"
                className="border w-full p-2 rounded"
                placeholder="Tiêu đề thông báo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="border w-full p-2 rounded h-24"
                placeholder="Nội dung thông báo"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 border rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {loading ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
