// src/components/maketingManager/PendingOrders.tsx
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

// Nhãn cho các trạng thái
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

  // Tải danh sách đơn chờ xác nhận
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

  // Lọc theo trạng thái thanh toán
  const filtered = orders.filter(o => o.payment_status === activeTab);

  // Chọn / bỏ chọn 1 đơn
  const toggleSelect = (id: string) => {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]
    );
  };

  // Gọi API xác nhận
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

  if (loading) return <div>Đang tải đơn hàng…</div>;
  if (!filtered.length)
    return <div>Không có đơn {PAYMENT_STATUS_LABEL[activeTab].toLowerCase()}.</div>;

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key);
              setSelected([]);
            }}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition ${
              activeTab === t.key
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Button xác nhận chỉ hiện ở tab "Đã thanh toán" */}
      {activeTab === "da_thanh_toan" && selected.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Xác nhận ({selected.length})
          </button>
        </div>
      )}

      {/* Danh sách đơn */}
      <div className="space-y-6">
        {filtered.map(o => {
          const isSel = selected.includes(o.orderId);
          return (
            <div
              key={o.orderId}
              className={`border rounded p-4 bg-white shadow-sm ${
                isSel ? "ring-2 ring-green-400" : ""
              }`}
            >
              {/* Chọn đơn (checkbox giả) */}
              {activeTab === "da_thanh_toan" && (
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggleSelect(o.orderId)}
                  className="mb-2"
                />
              )}
              <h3 className="font-bold mb-2">Mã đơn: {o.orderId}</h3>
              <p>
                <span className="font-semibold">User ID:</span> {o.user_id}
              </p>
              <p>
                <span className="font-semibold">Địa chỉ:</span>{" "}
                {o.shipping_address.address}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {o.shipping_address.phone}
              </p>
              <p>
                <span className="font-semibold">Trạng thái:</span>{" "}
                {ORDER_STATUS_LABEL[o.order_status] || o.order_status}
              </p>
              <p>
                <span className="font-semibold">Thanh toán:</span>{" "}
                {PAYMENT_STATUS_LABEL[o.payment_status] ||
                  o.payment_status}
              </p>
              <p>
                <span className="font-semibold">Giá gốc:</span>{" "}
                {o.rawTotal.toLocaleString()}₫
              </p>
              <p>
                <span className="font-semibold">Thanh toán:</span>{" "}
                {o.purchaseTotal.toLocaleString()}₫
              </p>
              <div className="mt-4 space-y-4">
                {o.products.map((p, i) => (
                  <div key={i} className="flex border-t pt-4">
                    <img
                      src={BASE_URL + p.firstImage}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-medium">{p.name}</p>
                      <p>Giá: {p.price.toLocaleString()}₫</p>
                      {p.variants.map((v, vi) => (
                        <p key={vi} className="text-sm text-gray-700">
                          – Màu: {v.color}, Size: {v.size}, Số lượng:{" "}
                          {v.quantity}, Giá đơn vị:{" "}
                          {v.price.toLocaleString()}₫
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
