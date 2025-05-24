"use client";
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ProductInfoProps {
  productId: string;
  onClose: () => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ productId, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[80%] max-h-[90%] overflow-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết sản phẩm</h2>
        <p>ID sản phẩm: {productId}</p>
        {/* Thêm các thông tin chi tiết khác của sản phẩm ở đây */}
      </div>
    </div>
  );
};

export default ProductInfo; 