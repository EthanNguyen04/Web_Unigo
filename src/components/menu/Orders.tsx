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
  { key: "canceled",   label: "Hủy"             },
];

const Orders = () => {
  const [activeTab, setActiveTab] = useState<string>(tabLabels[0].key);

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
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabLabels.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 -mb-px border-b-2 font-bold transition
              ${activeTab === tab.key
                ? "border-[#ff8000] text-[#ff8000]"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nội dung từng tab */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Orders;
