import axiosInstance from "./axiosInstance";

export const getRestaurantTables = async (restaurantId) => {
    const res = await axiosInstance.get(`/tables/restaurant/${restaurantId}`);
    return res.data;
};

export const addTable = async (tableData) => {
    const res = await axiosInstance.post("/tables", tableData);
    return res.data;
};

export const updateTable = async (tableId, tableData) => {
    const res = await axiosInstance.put(`/tables/${tableId}`, tableData);
    return res.data;
};

export const deleteTable = async (tableId) => {
    const res = await axiosInstance.delete(`/tables/${tableId}`);
    return res.data;
};
