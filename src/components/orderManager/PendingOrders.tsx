"use client";

import React, { useState, useEffect } from "react";
import { get_order, change_status_order, BASE_URL } from "../../config";

interface Variant {
  color: string;
  size: string;
  quantity: number;
  price: number;
}

interface Product {
  firstImage: string;
  name: string;
  variants: Variant[];
  price: number;
}

interface Order {
  orderId: string;
  user_id: string;
  shipping_address: {
    address: string;
    phone: string;
  };
  order_status: string;
  payment_status: string;
  products: Product[];
  rawTotal: number;
  purchaseTotal: number;
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  cho_xac_nhan: "Chờ xác nhận",
};
const PAYMENT_STATUS_LABEL: Record<string, string> = {
  chua_thanh_toan: "Chưa thanh toán",
  da_thanh_toan: "Đã thanh toán",
};

const tabs = [
  { key: "da_thanh_toan", label: PAYMENT_STATUS_LABEL.da_thanh_toan },
  { key: "chua_thanh_toan", label: PAYMENT_STATUS_LABEL.chua_thanh_toan },
];

const PendingOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);
  const [selected, setSelected] = useState<string[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(`${get_order}?status=cho_xac_nhan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => o.payment_status === activeTab);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Xác nhận ${selected.length} đơn?`)) return;

    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(change_status_order, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_ids: selected,
          order_status: "cho_lay_hang",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi khi xác nhận đơn");
      alert("✅ Xác nhận thành công");
      setSelected([]);
      fetchOrders();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Đang tải đơn hàng…</div>;
  if (!filtered.length)
    return (
      <div className="text-center text-gray-400 py-10 italic">
        Không có đơn {PAYMENT_STATUS_LABEL[activeTab].toLowerCase()}.
      </div>
    );

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key);
              setSelected([]);
            }}
            className={`px-5 py-2 rounded-full text-sm font-medium shadow transition
              ${activeTab === t.key
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Button xác nhận */}
      {activeTab === "da_thanh_toan" && selected.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
          >
            ✅ Xác nhận ({selected.length})
          </button>
        </div>
      )}

      {/* Orders */}
      <div className="space-y-6">
        {filtered.map((o) => {
          const isSel = selected.includes(o.orderId);
          return (
            <div
              key={o.orderId}
              className={`border rounded-xl p-5 bg-white shadow-lg transition-all duration-300 ${
                isSel ? "ring-2 ring-green-400" : "hover:shadow-xl"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  {activeTab === "da_thanh_toan" && (
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleSelect(o.orderId)}
                      className="w-5 h-5 text-green-500 rounded border-gray-300 focus:ring-green-500"
                    />
                  )}
                  <h3 className="font-bold text-lg">📦 Mã đơn: {o.orderId}</h3>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    o.payment_status === "da_thanh_toan"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {PAYMENT_STATUS_LABEL[o.payment_status]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                <p><strong>User ID:</strong> {o.user_id}</p>
                <p><strong>SĐT:</strong> {o.shipping_address.phone}</p>
                <p><strong>Địa chỉ:</strong> {o.shipping_address.address}</p>
                <p><strong>Trạng thái:</strong> {ORDER_STATUS_LABEL[o.order_status]}</p>
                <p><strong>Giá gốc:</strong> {o.rawTotal.toLocaleString()}₫</p>
                <p><strong>Thanh toán:</strong> {o.purchaseTotal.toLocaleString()}₫</p>
              </div>

              <div className="space-y-4">
                {o.products.map((p, i) => (
                  <div key={i} className="flex gap-4 items-start border-t pt-4">
                    <img
                      src={BASE_URL + p.firstImage}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-xl border"
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-gray-700">Giá: {p.price.toLocaleString()}₫</p>
                      {p.variants.map((v, vi) => (
                        <p key={vi} className="text-gray-600">
                          – Màu: {v.color}, Size: {v.size}, SL: {v.quantity}, Giá đơn vị: {v.price.toLocaleString()}₫
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingOrders;