import axiosInstance from "./axiosInstance";

export const getRestaurantReviews = async (restaurantId, page = 1) => {
    const res = await axiosInstance.get(`/reviews/restaurant/${restaurantId}`, {
        params: { page }
    });
    return res.data;
};

export const submitReview = async (reviewData) => {
    const res = await axiosInstance.post("/reviews", reviewData);
    return res.data;
};

export const deleteReview = async (reviewId) => {
    const res = await axiosInstance.delete(`/reviews/${reviewId}`);
    return res.data;
};
