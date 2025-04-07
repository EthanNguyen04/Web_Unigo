'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCartIcon,
  CubeIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  

  const stats = [
    { title: "Tổng đơn hàng", value: 1200, icon: ShoppingCartIcon },
    { title: "Sản phẩm có sẵn", value: 350, icon: CubeIcon },
    { title: "Doanh thu tháng", value: "₫150,000,000", icon: CurrencyDollarIcon },
    { title: "Người dùng đăng ký", value: 2300, icon: UsersIcon },
  ];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white shadow-md p-5 rounded-lg flex items-center space-x-4">
          <stat.icon className="h-10 w-10 text-blue-500" />
          <div>
            <h3 className="text-gray-600">{stat.title}</h3>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
