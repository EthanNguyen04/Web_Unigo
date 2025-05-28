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
  hoan_thanh: "Hoàn thành",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
};

const CompletedOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(`${get_order}?status=hoan_thanh`, {
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

  if (loading) return <div className="text-center py-10 text-gray-500">Đang tải đơn hàng…</div>;
  if (!orders.length)
    return (
      <div className="text-center text-gray-400 py-10 italic">
        Không có đơn hàng.
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng hoàn thành</h1>
      </div>

      {/* Orders */}
      <div className="space-y-8">
        {orders.map((o, index) => (
          <div
            key={o.orderId}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 
              transform hover:-translate-y-1 border-2 border-teal-200 relative"
          >
            {/* Order Header */}
            <div className="p-6 border-b-2 border-teal-200 bg-gradient-to-r from-teal-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl text-gray-900">📦 Mã đơn: {o.orderId}</h3>
                  <p className="text-sm text-gray-500 mt-1">User ID: {o.user_id}</p>
                </div>
                <span
                  className={`px-4 py-2 text-sm rounded-xl font-medium shadow-sm
                    ${o.payment_status === "da_thanh_toan"
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "bg-red-50 text-red-700 border border-red-200"}`}
                >
                  {PAYMENT_STATUS_LABEL[o.payment_status]}
                </span>
              </div>
            </div>

            {/* Order Info */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                  <p className="text-gray-500 text-sm mb-1">Số điện thoại</p>
                  <p className="font-medium">{o.shipping_address.phone}</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                  <p className="text-gray-500 text-sm mb-1">Địa chỉ</p>
                  <p className="font-medium">{o.shipping_address.address}</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                  <p className="text-gray-500 text-sm mb-1">Trạng thái</p>
                  <p className="font-medium">{ORDER_STATUS_LABEL[o.order_status]}</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                  <p className="text-gray-500 text-sm mb-1">Giá gốc</p>
                  <p className="font-medium text-teal-600">{o.rawTotal.toLocaleString()}₫</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                  <p className="text-gray-500 text-sm mb-1">Thanh toán</p>
                  <p className="font-medium text-teal-600">{o.purchaseTotal.toLocaleString()}₫</p>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Sản phẩm</h4>
                {o.products.map((p, i) => (
                  <div key={i} className="flex gap-6 items-start border-t-2 border-teal-100 pt-6">
                    <div className="relative">
                      <img
                        src={BASE_URL + p.firstImage}
                        alt={p.name}
                        className="w-28 h-28 object-cover rounded-xl border-2 border-teal-200 shadow-sm hover:shadow-md transition-all duration-300"
                      />
                      <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                        {p.variants.reduce((acc, v) => acc + v.quantity, 0)} sản phẩm
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">{p.name}</h4>
                      <p className="text-teal-600 font-medium mb-3">Giá: {p.price.toLocaleString()}₫</p>
                      <div className="space-y-2">
                        {p.variants.map((v, vi) => (
                          <div key={vi} className="flex items-center gap-4 text-sm bg-teal-50 p-3 rounded-lg border border-teal-100">
                            <span className="w-24 text-gray-500">Màu: {v.color}</span>
                            <span className="w-24 text-gray-500">Size: {v.size}</span>
                            <span className="w-20 text-gray-500">SL: {v.quantity}</span>
                            <span className="text-teal-600 font-medium">
                              {v.price.toLocaleString()}₫
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Footer */}
            <div className="p-4 bg-teal-50 rounded-b-2xl border-t-2 border-teal-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Đơn hàng #{index + 1}</span>
                <span>{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedOrders;