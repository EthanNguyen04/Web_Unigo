"use client";

import React, { useState, useEffect, useRef } from "react";
import { get_order, change_status_order, BASE_URL } from "../../config";
import Barcode from 'react-barcode';

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
  createdAt: string;
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  cho_xac_nhan: "Chờ xác nhận",
  huy: "Đã hủy",
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [selectedOrdersForPrint, setSelectedOrdersForPrint] = useState<Order[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

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

  const handleCancel = async () => {
    if (!selected.length) return;
    if (!cancellationReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn");
      return;
    }

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
          order_status: "huy",
          cancellation_reason: cancellationReason.trim()
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi khi hủy đơn");
      alert("✅ Hủy đơn thành công");
      setSelected([]);
      setCancellationReason("");
      setShowCancelModal(false);
      fetchOrders();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  };

  const handlePrint = (order: Order) => {
    setSelectedOrderForPrint(order);
    setShowPrintModal(true);
  };

  const handlePrintMultiple = () => {
    const ordersToPrint = orders.filter(order => selected.includes(order.orderId));
    setSelectedOrdersForPrint(ordersToPrint);
    setShowPrintModal(true);
  };

  const printOrders = () => {
    if (selectedOrdersForPrint.length === 0) return;

    // Tạo URL với dữ liệu đơn hàng được mã hóa
    const orderData = encodeURIComponent(JSON.stringify(selectedOrdersForPrint));
    const printUrl = `/print-order?data=${orderData}`;
    
    // Mở cửa sổ in
    window.open(printUrl, '_blank');
    setShowPrintModal(false);
    setSelectedOrdersForPrint([]);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Đang tải đơn hàng…</div>;
  if (!filtered.length)
    return (
      <div className="text-center text-gray-400 py-10 italic">
        Không có đơn {PAYMENT_STATUS_LABEL[activeTab].toLowerCase()}.
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>
        
        {/* Tabs */}
        <div className="flex gap-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setSelected([]);
              }}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105
                ${activeTab === t.key
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Button xác nhận/hủy */}
      {selected.length > 0 && (
        <div className="mb-6 sticky top-24 z-10 flex gap-4">
          {activeTab === "da_thanh_toan" ? (
            <>
              <button
                onClick={handleConfirm}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold 
                  hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl
                  transform hover:scale-105 flex items-center gap-2"
              >
                <span className="text-lg">✅</span>
                <span>Xác nhận ({selected.length})</span>
              </button>
              <button
                onClick={handlePrintMultiple}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold 
                  hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl
                  transform hover:scale-105 flex items-center gap-2"
              >
                <span className="text-lg">🖨️</span>
                <span>In đơn hàng ({selected.length})</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold 
                hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl
                transform hover:scale-105 flex items-center gap-2"
            >
              <span className="text-lg">❌</span>
              <span>Hủy đơn ({selected.length})</span>
            </button>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-400/10 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hủy đơn hàng</h3>
            <p className="text-gray-600 mb-4">Vui lòng nhập lý do hủy đơn:</p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
              placeholder="Nhập lý do hủy đơn..."
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason("");
                }}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedOrdersForPrint.length > 1 
                  ? `In ${selectedOrdersForPrint.length} đơn hàng` 
                  : 'Xem trước đơn hàng'}
              </h3>
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  setSelectedOrderForPrint(null);
                  setSelectedOrdersForPrint([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedOrdersForPrint.length > 1 ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Bạn đã chọn {selectedOrdersForPrint.length} đơn hàng để in. Mỗi đơn hàng sẽ được in trên một trang riêng biệt.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowPrintModal(false);
                      setSelectedOrdersForPrint([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={printOrders}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    In tất cả
                  </button>
                </div>
              </div>
            ) : selectedOrderForPrint ? (
              <div className="space-y-4">
                <div className="print-content bg-white p-4 rounded-lg shadow-sm">
                  <div className="header">
                    <h2 className="text-lg font-bold text-center">UNIGO</h2>
                    <p className="text-center text-sm text-gray-600">Đơn hàng #{selectedOrderForPrint.orderId}</p>
                  </div>
                  
                  <div className="barcode my-2">
                    <Barcode 
                      value={selectedOrderForPrint.orderId}
                      width={0.8}
                      height={25}
                      fontSize={8}
                      margin={0}
                      displayValue={false}
                    />
                  </div>

                  <div className="info-section bg-gray-50 p-2 rounded-lg">
                    <div className="info-row space-y-1">
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm">{selectedOrderForPrint.shipping_address.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <p className="text-sm">{selectedOrderForPrint.shipping_address.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">{new Date(selectedOrderForPrint.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="products mt-3">
                    {selectedOrderForPrint.products.map((p, i) => (
                      <div key={i} className="product bg-gray-50 p-2 rounded-lg mb-2">
                        <div className="product-name font-medium text-gray-900">{p.name}</div>
                        {p.variants.map((v, vi) => (
                          <div key={vi} className="variant text-sm text-gray-600 mt-1 ml-2">
                            {v.color} - {v.size} x{v.quantity} = {v.price.toLocaleString()}₫
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="total mt-3 pt-2 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tổng tiền:</span>
                      <span className="text-lg font-bold text-orange-600">{selectedOrderForPrint.purchaseTotal.toLocaleString()}₫</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-medium">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        selectedOrderForPrint.payment_status === 'da_thanh_toan' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {PAYMENT_STATUS_LABEL[selectedOrderForPrint.payment_status]}
                      </span>
                    </div>
                  </div>

                  <div className="footer mt-3 text-center text-sm text-gray-500">
                    <p>Cảm ơn quý khách!</p>
                    <p>UNIGO - Thời trang trẻ trung</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Orders */}
      <div className="space-y-8">
        {filtered.map((o, index) => {
          const isSel = selected.includes(o.orderId);
          return (
            <div
              key={o.orderId}
              className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 
                ${isSel ? "ring-2 ring-green-400" : ""} transform hover:-translate-y-1
                border-2 border-orange-200 relative`}
            >
              {/* Order Header */}
              <div className="p-6 border-b-2 border-orange-200 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleSelect(o.orderId)}
                      className="w-5 h-5 text-green-500 rounded-lg border-gray-300 focus:ring-green-500 
                        transition-all duration-200 cursor-pointer"
                    />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">📦 Mã đơn: {o.orderId}</h3>
                      <p className="text-sm text-gray-500 mt-1">User ID: {o.user_id}</p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 text-sm rounded-xl font-medium shadow-sm
                      ${o.payment_status === "da_thanh_toan"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"}`}
                  >
                    {PAYMENT_STATUS_LABEL[o.payment_status]}
                  </span>
                </div>
              </div>

              {/* Order Info */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-gray-500 text-sm mb-1">Số điện thoại</p>
                    <p className="font-medium">{o.shipping_address.phone}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-gray-500 text-sm mb-1">Địa chỉ</p>
                    <p className="font-medium">{o.shipping_address.address}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-gray-500 text-sm mb-1">Trạng thái</p>
                    <p className="font-medium">{ORDER_STATUS_LABEL[o.order_status]}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-gray-500 text-sm mb-1">Giá gốc</p>
                    <p className="font-medium text-orange-600">{o.rawTotal.toLocaleString()}₫</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-gray-500 text-sm mb-1">Thanh toán</p>
                    <p className="font-medium text-green-600">{o.purchaseTotal.toLocaleString()}₫</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="text-gray-500 text-sm mb-1">Thời gian đặt</p>
                    <p className="font-medium">{new Date(o.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Sản phẩm</h4>
                  {o.products.map((p, i) => (
                    <div key={i} className="flex gap-6 items-start border-t-2 border-orange-100 pt-6">
                      <div className="relative">
                        <img
                          src={BASE_URL + p.firstImage}
                          alt={p.name}
                          className="w-28 h-28 object-cover rounded-xl border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-300"
                        />
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {p.variants.reduce((acc, v) => acc + v.quantity, 0)} sản phẩm
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900 mb-2">{p.name}</h4>
                        <p className="text-orange-600 font-medium mb-3">Giá: {p.price.toLocaleString()}₫</p>
                        <div className="space-y-2">
                          {p.variants.map((v, vi) => (
                            <div key={vi} className="flex items-center gap-4 text-sm bg-orange-50 p-3 rounded-lg border border-orange-100">
                              <span className="w-24 text-gray-500">Màu: {v.color}</span>
                              <span className="w-24 text-gray-500">Size: {v.size}</span>
                              <span className="w-20 text-gray-500">SL: {v.quantity}</span>
                              <span className="text-orange-600 font-medium">
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

              
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingOrders;