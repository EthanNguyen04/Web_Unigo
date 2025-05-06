// config.ts

// Địa chỉ base của API
export const BASE_URL = "http://192.168.1.167:3001";

// Các endpoint liên quan
export const API_ADD_PRODUCT = `${BASE_URL}/manager/add_product`;
export const API_ALL_CATEGORY = `${BASE_URL}/api/category/all_category`;

export const API_Get_CATEGORY = `${BASE_URL}/manager/categories`;

export const API_dashboard = `${BASE_URL}/manager/dashboard`;
export const API_LOGIN = `${BASE_URL}/api/user/login_admin`;
export const API_LOGOUT = `${BASE_URL}/api/user/logout_admin`;
export const API_PRODUCT_MANAGER = `${BASE_URL}/manager/products_manager`;

export const API_GET_PRODUCT = `${BASE_URL}/api/product`;
export const PUT_EDIT_PRODUCT = `${BASE_URL}/manager/edit_product`;

export const API_GET_Edit_PRODUCT = `${BASE_URL}/manager/get_product`;

export const Post_ADD_category = `${BASE_URL}/manager/add_category`;
export const Edit_category = `${BASE_URL}/manager/edit_category`;

export const Add_Discount = `${BASE_URL}/manager/add_discount`;
export const Get_All_Discount = `${BASE_URL}/manager/get_all_discounts`;

export const Put_Edit_Discount = `${BASE_URL}/manager/update_discount`;

export const Post_notification = `${BASE_URL}/manager/send-notification`;


// Các biến/config khác có thể thêm vào đây
