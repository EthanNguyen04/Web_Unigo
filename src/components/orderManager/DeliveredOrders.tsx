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
  da_giao: "Đã giao",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  chua_thanh_toan: "Chưa thanh toán",
  da_thanh_toan: "Đã thanh toán",
};

const formatCurrency = (amount: number) =>
  `${amount.toLocaleString("vi-VN")}₫`;

const DeliveredOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDelivered();
  }, []);

  const fetchDelivered = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(`${get_order}?status=da_giao`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Lỗi khi tải đơn đã giao:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-4 text-center text-gray-600">⏳ Đang tải đơn đã giao…</div>;
  if (!orders.length)
    return (
      <div className="p-4 text-center text-gray-500">📭 Chưa có đơn nào đã giao.</div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">📦 Đơn hàng đã giao</h2>
      {orders.map((order) => (
        <div
          key={order.orderId}
          className="bg-white rounded-lg shadow-md p-5 border border-gray-200"
        >
          <h3 className="text-lg font-semibold mb-2 text-blue-800">
            🧾 Mã đơn: {order.orderId}
          </h3>
          <p>
            <strong>User ID:</strong> {order.user_id}
          </p>
          <p>
            <strong>📍 Địa chỉ:</strong> {order.shipping_address.address}
          </p>
          <p>
            <strong>📞 Phone:</strong> {order.shipping_address.phone}
          </p>
          <p>
            <strong>📦 Trạng thái:</strong>{" "}
            {ORDER_STATUS_LABEL[order.order_status] || order.order_status}
          </p>
          <p>
            <strong>💳 Thanh toán:</strong>{" "}
            {PAYMENT_STATUS_LABEL[order.payment_status] || order.payment_status}
          </p>
          <p>
            <strong>💰 Giá gốc:</strong> {formatCurrency(order.rawTotal)}
          </p>
          <p>
            <strong>✅ Thanh toán:</strong> {formatCurrency(order.purchaseTotal)}
          </p>

          <div className="mt-4 space-y-4">
            {order.products.map((product, i) => (
              <div key={i} className="flex gap-4 border-t pt-4">
                <img
                  src={BASE_URL + product.firstImage}
                  alt={product.name}
                  className="w-20 h-20 rounded object-cover border"
                />
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p>Giá: {formatCurrency(product.price)}</p>
                  {product.variants.map((v, vi) => (
                    <p key={vi} className="text-sm text-gray-700">
                      – Màu: {v.color}, Size: {v.size}, Số lượng: {v.quantity}, Giá đơn
                      vị: {formatCurrency(v.price)}
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

export default DeliveredOrders;