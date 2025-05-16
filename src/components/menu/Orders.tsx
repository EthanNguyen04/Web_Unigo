"use client";
import { useState } from "react";

import PendingOrders   from "../../components/orderManager/PendingOrders";
import ReadyOrders     from "../../components/orderManager/ReadyOrders";
import ShippingOrders  from "../../components/orderManager/ShippingOrders";
import DeliveredOrders from "../../components/orderManager/DeliveredOrders";
import CompletedOrders from "../../components/orderManager/CompletedOrders";
import CanceledOrders  from "../../components/orderManager/CanceledOrders";

const tabLabels = [
  { key: "pending",    label: "Chờ xác nhận"   },
  { key: "ready",      label: "Chờ lấy"         },
  { key: "shipping",   label: "Đang giao hàng"  },
  { key: "delivered",  label: "Đã giao"         },
  { key: "completed",  label: "Hoàn thành"      },
  { key: "canceled",   label: "Đã huỷ"          },
];

const Orders = () => {
  const [activeTab, setActiveTab] = useState<string>("pending");

  const renderContent = () => {
    switch (activeTab) {
      case "pending":    return <PendingOrders />;
      case "ready":      return <ReadyOrders />;
      case "shipping":   return <ShippingOrders />;
      case "delivered":  return <DeliveredOrders />;
      case "completed":  return <CompletedOrders />;
      case "canceled":   return <CanceledOrders />;
      default:           return null;
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabLabels.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full font-semibold text-sm shadow-sm transition duration-200
              ${activeTab === tab.key
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nội dung */}
      <div className="bg-gray-50 rounded-lg shadow-inner p-4 min-h-[300px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default Orders;