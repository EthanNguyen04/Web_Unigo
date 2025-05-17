"use client";
import { useState } from "react";
import DiscountCodes from "../maketingManager/DiscountCodes";
import Notifications from "../maketingManager/Notifications";

const tabs = [
  { key: "discounts", label: "Mã giảm giá", component: <DiscountCodes /> },
  { key: "notifs", label: "Thông báo", component: <Notifications /> },
];

const Marketing: React.FC = () => {
  const [active, setActive] = useState<string>(tabs[0].key);

  const ActiveComp = tabs.find((t) => t.key === active)!.component;

  return (
    <div className="flex-1 p-8 bg-white rounded-lg shadow-lg min-h-[600px]">
      <h1 className="text-3xl font-extrabold mb-6 text-[#ff8000] tracking-wide drop-shadow-md">
        Marketing
      </h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-8 select-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`
              relative px-6 py-3 font-semibold text-lg transition-all
              ${
                active === tab.key
                  ? "text-[#ff8000] border-b-4 border-[#ff8000]"
                  : "text-gray-500 hover:text-[#ff8000] border-b-4 border-transparent hover:border-[#ff8000]"
              }
              focus:outline-none
            `}
            aria-selected={active === tab.key}
            role="tab"
          >
            {tab.label}
            {/* Animated underline */}
            {active === tab.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff8000] rounded-full"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content with fade transition */}
      <div
        key={active}
        className="transition-opacity duration-300 ease-in-out opacity-100"
        role="tabpanel"
      >
        {ActiveComp}
      </div>
    </div>
  );
};

export default Marketing;