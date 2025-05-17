"use client";

import { useState } from "react";
import ProductManagement from "../productManager/productComponent"; // Update path if needed
import CategoryManagement from "../productManager/categoryComponent";

export default function Products() {
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen">
      {/* Tab header */}
      <div className="flex space-x-2 border-b border-gray-300 mb-4">
        {[
          { key: "products", label: "📦 Sản phẩm" },
          { key: "categories", label: "🗂️ Phân loại" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "products" | "categories")}
            className={`py-2 px-5 font-medium rounded-t-lg transition-all border ${
              activeTab === tab.key
                ? "bg-white border-b-2 border-[#ff8000] text-[#ff8000]"
                : "bg-gray-200 text-gray-600 hover:text-[#ff8000] hover:bg-gray-300 border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {activeTab === "products" ? <ProductManagement /> : <CategoryManagement />}
      </div>
    </div>
  );
}