"use client";

import React, { useEffect, useState } from "react";
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
  dang_giao: "Đang giao",
  da_giao: "Đã giao",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  chua_thanh_toan: "Chưa thanh toán",
  da_thanh_toan: "Đã thanh toán",
};

const formatCurrency = (amount: number) =>
  `${amount.toLocaleString("vi-VN")}₫`;

const ShippingOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(`${get_order}?status=dang_giao`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setSelectedIds([]);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const markDelivered = async () => {
    if (!selectedIds.length) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(change_status_order, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_ids: selectedIds,
          order_status: "da_giao",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại.");
      alert("✅ Cập nhật trạng thái giao thành công.");
      await fetchOrders();
    } catch (error: any) {
      alert("❌ " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-gray-600">⏳ Đang tải đơn hàng...</div>
    );

  if (!orders.length)
    return (
      <div className="p-4 text-center text-gray-500">📦 Không có đơn đang giao.</div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">🚚 Đơn hàng đang giao</h2>

      <button
        onClick={markDelivered}
        disabled={!selectedIds.length || updating}
        className={`mb-6 px-6 py-2 rounded text-white transition-colors ${
          selectedIds.length && !updating
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {updating ? "🔄 Đang xử lý..." : `✅ Đã giao (${selectedIds.length})`}
      </button>

      <div className="space-y-6">
        {orders.map((order) => (
          <OrderCard
            key={order.orderId}
            order={order}
            selected={selectedIds.includes(order.orderId)}
            onToggle={() => toggleSelect(order.orderId)}
          />
        ))}
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  selected: boolean;
  onToggle: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, selected, onToggle }) => {
  const {
    orderId,
    user_id,
    shipping_address: { address, phone },
    order_status,
    payment_status,
    rawTotal,
    purchaseTotal,
    products,
  } = order;

  return (
    <div className="flex gap-4 p-5 bg-white border rounded-lg shadow-md">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-2 h-5 w-5 accent-blue-600"
      />

      <div className="flex-1 space-y-1">
        <h3 className="text-lg font-semibold text-blue-800">🧾 Mã đơn: {orderId}</h3>

        <p>
          <strong>User ID:</strong> {user_id}
        </p>
        <p>
          <strong>📍 Địa chỉ:</strong> {address}
        </p>
        <p>
          <strong>📞 SĐT:</strong> {phone}
        </p>
        <p>
          <strong>📦 Trạng thái:</strong>{" "}
          {ORDER_STATUS_LABEL[order_status] || order_status}
        </p>
        <p>
          <strong>💰 Thanh toán:</strong>{" "}
          {PAYMENT_STATUS_LABEL[payment_status] || payment_status}
        </p>
        <p>
          <strong>🧾 Giá gốc:</strong> {formatCurrency(rawTotal)}
        </p>
        <p>
          <strong>✅ Đã thanh toán:</strong> {formatCurrency(purchaseTotal)}
        </p>

        <div className="mt-4 space-y-3">
          {products.map((product, i) => (
            <ProductItem key={i} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ProductItemProps {
  product: Product;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const { firstImage, name, price, variants } = product;

  return (
    <div className="flex gap-4 border-t pt-3">
      <img
        src={BASE_URL + firstImage}
        alt={name}
        className="w-20 h-20 rounded object-cover border"
      />
      <div className="flex-1">
        <p className="font-medium">{name}</p>
        <p>Giá: {formatCurrency(price)}</p>
        {variants.map((v, idx) => (
          <p key={idx} className="text-sm text-gray-700">
            – Màu: {v.color}, Size: {v.size}, SL: {v.quantity}, Giá: {formatCurrency(v.price)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ShippingOrders;