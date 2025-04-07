"use client";
import { useState } from "react";
import ProductManagement from "../productManager/productComponent"; // Điều chỉnh đường dẫn nếu cần
import CategoryManagement from "../productManager/categoryComponent"; // Điều chỉnh đường dẫn nếu cần

export default function Products() {
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen">
      {/* Tab header */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("products")}
          className={`py-2 px-4 font-semibold transition-colors border rounded-t-lg ${
            activeTab === "products"
              ? "border-b-2 border-[#ff8000] text-[#ff8000] bg-white"
              : "text-gray-500 hover:text-[#ff8000] bg-gray-200"
          }`}
        >
          Sản phẩm
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`ml-2 py-2 px-4 font-semibold transition-colors border rounded-t-lg ${
            activeTab === "categories"
              ? "border-b-2 border-[#ff8000] text-[#ff8000] bg-white"
              : "text-gray-500 hover:text-[#ff8000] bg-gray-200"
          }`}
        >
          Phân loại
        </button>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg shadow-md">
      {activeTab === "products" ? <ProductManagement /> : <CategoryManagement />}
      </div>
    </div>
  );
}
