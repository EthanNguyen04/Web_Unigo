"use client";

import React, { useEffect, useState } from "react";
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
  chua_thanh_toan: "Chưa thanh toán",
  da_thanh_toan: "Đã thanh toán",
};

const formatCurrency = (amount: number) =>
  amount.toLocaleString("vi-VN") + "₫";

const CompletedOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompleted();
  }, []);

  const fetchCompleted = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(`${get_order}?status=hoan_thanh`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Lỗi khi tải đơn đã hoàn thành:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">⏳ Đang tải đơn đã hoàn thành…</div>;
  if (!orders.length) return <div className="p-4 text-center text-gray-500">Chưa có đơn nào hoàn thành.</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Đơn hàng hoàn thành</h2>
      {orders.map(order => (
        <OrderCard key={order.orderId} order={order} />
      ))}
    </div>
  );
};

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
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
    <div className="bg-white rounded border shadow-sm p-4">
      <h3 className="font-bold mb-2 text-blue-700">Mã đơn: {orderId}</h3>
      <p><b>User ID:</b> {user_id}</p>
      <p><b>Địa chỉ:</b> {address}</p>
      <p><b>Phone:</b> {phone}</p>
      <p><b>Trạng thái đơn:</b> {ORDER_STATUS_LABEL[order_status] || order_status}</p>
      <p><b>Thanh toán:</b> {PAYMENT_STATUS_LABEL[payment_status] || payment_status}</p>
      <p><b>Giá gốc:</b> {formatCurrency(rawTotal)}</p>
      <p><b>Thanh toán:</b> {formatCurrency(purchaseTotal)}</p>

      <div className="mt-4 space-y-4">
        {products.map((product, idx) => (
          <ProductItem key={idx} product={product} />
        ))}
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
    <div className="flex border-t pt-4 gap-4">
      <img
        src={BASE_URL + firstImage}
        alt={name}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="flex-1">
        <p className="font-medium">{name}</p>
        <p>Giá: {formatCurrency(price)}</p>
        {variants.map((v, idx) => (
          <p key={idx} className="text-sm text-gray-700">
            – Màu: {v.color}, Size: {v.size}, SL: {v.quantity}, Giá đơn vị: {formatCurrency(v.price)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default CompletedOrders;