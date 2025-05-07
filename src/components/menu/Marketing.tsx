"use client";
import { useState } from "react";
import DiscountCodes from "../maketingManager/DiscountCodes";
import Notifications from "../maketingManager/Notifications";

const tabs = [
  { key: "discounts", label: "Mã giảm giá",   component: <DiscountCodes /> },
  { key: "notifs",    label: "Thông báo",     component: <Notifications /> },
];

const Marketing: React.FC = () => {
  const [active, setActive] = useState<string>(tabs[0].key);

  const ActiveComp = tabs.find(t => t.key === active)!.component;

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-4">Marketing</h1>
      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition 
              ${active === tab.key
                ? "border-[#ff8000] text-[#ff8000]"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Nội dung tab */}
      <div>
        {ActiveComp}
      </div>
    </div>
  );
};

export default Marketing;
