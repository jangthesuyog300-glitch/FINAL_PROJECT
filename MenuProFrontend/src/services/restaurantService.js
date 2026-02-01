import axios from "axios";
import { API_ORIGIN } from "./axiosInstance";
const API_URL = `${API_ORIGIN}/api/restaurants`;

// const API_URL = "https://localhost:44315/api/restaurants";

// export const getActiveRestaurants = () => {
//   return axios.get(`${API_URL}/public`);
// };

// export const getRestaurantById = (id) => {
//   return axios.get(`${API_URL}/${id}`, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`
//     }
//   });
// };



export const getRestaurantById = (id) => {
  const token = localStorage.getItem("token");

  const headers = {};
  if (token && token !== "undefined" && token !== "null") {
    headers.Authorization = `Bearer ${token}`;
  }

  return axios.get(`${API_URL}/${id}`, { headers });
};



export const getActiveRestaurants = () => {
  return axios.get(`${API_URL}/public`);
};

export const uploadRestaurantImages = (id, files) => {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));

  const token = localStorage.getItem("token");
  return axios.post(`${API_URL}/${id}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`
    }
  });
};


// import axios from "axios";

// const API_URL = "https://localhost:5001/api/restaurants";

// export const getRestaurantById = (id) => {
//   return axios.get(`${API_URL}/${id}`, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`
//     }
//   });
// };
