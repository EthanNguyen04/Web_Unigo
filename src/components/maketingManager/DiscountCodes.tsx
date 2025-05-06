// src/components/maketingManager/DiscountCodes.tsx

"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Add_Discount, Get_All_Discount, Put_Edit_Discount } from "../../config";
import { FaEdit } from "react-icons/fa";

interface Discount {
  code: string;
  discount_percent: number;
  min_order_value: number;
  expiration_date: string; // ISO 8601 UTC string
  max_uses: number;
  times_used: number;
  created_at: string;      // ISO 8601 UTC string
  updated_at: string;      // ISO 8601 UTC string
}

const DiscountCodes: React.FC = () => {
  const [discountCodes, setDiscountCodes] = useState<Discount[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [oldCode, setOldCode] = useState<string>("");

  // Form fields
  const [code, setCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [minOrderValue, setMinOrderValue] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Zero-pad helper
  const pad = (n: number) => n.toString().padStart(2, "0");

  // Convert ISO UTC to JS Date in GMT+7
  const toVietnamDate = (iso: string) => {
    const d = new Date(iso);
    const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utcMs + 7 * 60 * 60000);
  };

  // Format for display
  const formatVietnamTime = (iso: string) => {
    const vn = toVietnamDate(iso);
    return `${vn.getFullYear()}-${pad(vn.getMonth() + 1)}-${pad(vn.getDate())}` +
           ` ${pad(vn.getHours())}:${pad(vn.getMinutes())}`;
  };

  // GMT+7 now & tomorrow midnight
  const vnNow = toVietnamDate(new Date().toISOString());
  const startOfTomorrow = new Date(vnNow);
  startOfTomorrow.setDate(vnNow.getDate() + 1);
  startOfTomorrow.setHours(0, 0, 0, 0);
  const canEdit = vnNow < startOfTomorrow;

  // Created today?
  const isCreatedToday = (iso: string) => {
    const vnCreated = toVietnamDate(iso);
    const startOfToday = new Date(vnNow);
    startOfToday.setHours(0, 0, 0, 0);
    return vnCreated >= startOfToday && vnCreated < startOfTomorrow;
  };

  // For date picker
  const tomorrowLocal = new Date(vnNow);
  tomorrowLocal.setDate(tomorrowLocal.getDate() + 1);
  tomorrowLocal.setHours(0, 0, 0, 0);
  const endOfYear = new Date(vnNow.getFullYear(), 11, 31, 23, 59);

  // Fetch from API
  const fetchDiscounts = async () => {
    try {
      const token = localStorage.getItem("tkn");
      if (!token) throw new Error("Chưa có token, vui lòng đăng nhập");
      const res = await fetch(Get_All_Discount, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      const list: Discount[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any).discounts)
        ? (data as any).discounts
        : [data];
      setDiscountCodes(list);
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  };

  useEffect(() => { fetchDiscounts(); }, []);

  // Dialog openers
  const openAddDialog = () => {
    setIsEditing(false);
    setOldCode("");
    setCode("");
    setDiscountPercent("");
    setMinOrderValue("");
    setMaxUses("");
    setExpirationDate(tomorrowLocal);
    setShowDialog(true);
  };

  const openEditDialog = (d: Discount) => {
    setIsEditing(true);
    setOldCode(d.code);
    setCode(d.code);
    setDiscountPercent(d.discount_percent.toString());
    setMinOrderValue(d.min_order_value.toString());
    setMaxUses(d.max_uses.toString());
    setShowDialog(true);
  };

  // Validate
  const validate = () => {
    if (!code || code.length > 10) { alert("Mã bắt buộc & ≤10 ký tự"); return false; }
    const pct = Number(discountPercent);
    if (!/^[0-9]+$/.test(discountPercent) || pct<0||pct>100) { alert("Giảm %: số nguyên 0–100"); return false; }
    const minVal = Number(minOrderValue);
    if (isNaN(minVal)||minVal<1000) { alert("Tối thiểu ≥1.000 VND"); return false; }
    if (!isEditing) {
      if (!expirationDate) { alert("Chọn ngày giờ hết hạn"); return false; }
      if (expirationDate<tomorrowLocal) { alert(`Hết hạn từ ${tomorrowLocal.toLocaleDateString()}`); return false; }
    }
    const mu = Number(maxUses);
    if (!/^[0-9]+$/.test(maxUses)||mu<1) { alert("Sử dụng tối đa ≥1"); return false; }
    return true;
  };

  // Commit
  const commit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("tkn");
      const endpoint = isEditing ? Put_Edit_Discount : Add_Discount;
      const method = isEditing ? "PUT" : "POST";
      const payload: any = { code, discount_percent: Number(discountPercent), min_order_value: Number(minOrderValue), max_uses: Number(maxUses) };
      if (!isEditing && expirationDate) {
        const utc = expirationDate.getTime() - 7*60*60000;
        payload.expiration_date = new Date(utc).toISOString();
      }
      if (isEditing) { payload.old_code = oldCode; payload.new_code = code; }
      const res = await fetch(endpoint, { method, headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message||"Lỗi");
      alert(isEditing?"✅ Cập nhật thành công":"✅ Tạo thành công");
      setShowDialog(false);
      fetchDiscounts();
    } catch(e:any){ alert("❌ "+e.message); }
    finally{ setLoading(false); }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Mã giảm giá</h2>
        <button onClick={openAddDialog} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Thêm mã giảm giá</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Mã</th>
              <th className="p-2 border">Giảm %</th>
              <th className="p-2 border">Tối thiểu</th>
              <th className="p-2 border">Hết hạn<br/><span className="text-sm font-normal">(GMT+7)</span></th>
              <th className="p-2 border">Tối đa</th>
              <th className="p-2 border">Đã dùng</th>
              <th className="p-2 border">Tạo lúc<br/><span className="text-sm font-normal">(GMT+7)</span></th>
              <th className="p-2 border">Cập nhật<br/><span className="text-sm font-normal">(GMT+7)</span></th>
              <th className="p-2 border">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {discountCodes.map((d,i)=>(
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-2 border">{d.code}</td>
                <td className="p-2 border">{d.discount_percent}%</td>
                <td className="p-2 border">{d.min_order_value.toLocaleString()}đ</td>
                <td className="p-2 border">{formatVietnamTime(d.expiration_date)}</td>
                <td className="p-2 border">{d.max_uses}</td>
                <td className="p-2 border">{d.times_used}</td>
                <td className="p-2 border">{formatVietnamTime(d.created_at)}</td>
                <td className="p-2 border">{formatVietnamTime(d.updated_at)}</td>
                <td className="p-2 border">
                  {canEdit && isCreatedToday(d.created_at) && <FaEdit className="cursor-pointer text-orange-500" onClick={()=>openEditDialog(d)}/>}                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{isEditing?"Chỉnh sửa mã":"Tạo mã giảm giá mới"}</h3>
            <div className="space-y-3">
              <h2 className="text-sm">Mã giảm giá</h2>
              <input className="border w-full p-2 rounded" placeholder="Mã giảm giá" value={code} onChange={e=>setCode(e.target.value)}/>
              <h2 className="text-sm">Giảm %</h2>
              <input className="border w-full p-2 rounded" type="number" placeholder="Giảm %" value={discountPercent} onChange={e=>setDiscountPercent(e.target.value)}/>
              <h2 className="text-sm">Giá trị tối thiểu (VNĐ)</h2>
              <input className="border w-full p-2 rounded" type="number" placeholder="Giá trị tối thiểu (VNĐ)" value={minOrderValue} onChange={e=>setMinOrderValue(e.target.value)}/>
              {!isEditing && (
                
                <DatePicker
                  selected={expirationDate}
                  onChange={date=>setExpirationDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={60}
                  dateFormat="yyyy-MM-dd HH:mm"
                  minDate={tomorrowLocal}
                  maxDate={endOfYear}
                  className="border w-full p-2 rounded"
                />
              )}
              <h2 className="text-sm">Sử dụng tối đa (lần)</h2>
              <input className="border w-full p-2 rounded" type="number" placeholder="Sử dụng tối đa" value={maxUses} onChange={e=>setMaxUses(e.target.value)}/>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setShowDialog(false)} className="px-4 py-2 border rounded">Huỷ</button>
              <button onClick={commit} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                {loading?"Đang xử lý...":(isEditing?"Cập nhật":"Tạo mã")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCodes;
