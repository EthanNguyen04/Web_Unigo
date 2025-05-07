// src/components/maketingManager/CanceledOrders.tsx
"use client";

import React, { useState, useEffect } from "react";
import { get_order, BASE_URL } from "../../config";

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
  huy: "Đã hủy",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  chua_thanh_toan: "Chưa thanh toán",
  da_thanh_toan: "Đã thanh toán",
};

const CanceledOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCanceled = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(`${get_order}?status=huy`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Lỗi khi tải đơn đã hủy:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanceled();
  }, []);

  if (loading) return <div>Đang tải đơn đã hủy…</div>;
  if (!orders.length) return <div>Chưa có đơn nào đã hủy.</div>;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold mb-4">Đơn hàng đã hủy</h2>
      {orders.map(o => (
        <div key={o.orderId} className="border rounded p-4 bg-white shadow-sm">
          <h3 className="font-bold mb-2">Mã đơn: {o.orderId}</h3>
          <p>
            <span className="font-semibold">User ID:</span> {o.user_id}
          </p>
          <p>
            <span className="font-semibold">Địa chỉ:</span> {o.shipping_address.address}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {o.shipping_address.phone}
          </p>
          <p>
            <span className="font-semibold">Trạng thái đơn:</span>{" "}
            {ORDER_STATUS_LABEL[o.order_status] || o.order_status}
          </p>
          <p>
            <span className="font-semibold">Thanh toán:</span>{" "}
            {PAYMENT_STATUS_LABEL[o.payment_status] || o.payment_status}
          </p>
          <p>
            <span className="font-semibold">Giá gốc:</span> {o.rawTotal.toLocaleString()}₫
          </p>
          <p>
            <span className="font-semibold">Thanh toán:</span> {o.purchaseTotal.toLocaleString()}₫
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
                      – Màu: {v.color}, Size: {v.size}, Số lượng: {v.quantity}, Giá đơn vị: {v.price.toLocaleString()}₫
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CanceledOrders;
