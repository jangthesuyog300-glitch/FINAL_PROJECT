// import axiosInstance from "../services/axiosInstance";

// // { bookingId, amount, paymentType, paymentStatus, paymentDate }
// export const createPayment = async (payload) => {
//   const res = await axiosInstance.post("/payments", payload);
//   return res.data;
// };




import axiosInstance from "../services/axiosInstance";

// Matches backend Payment model:
// BookingId, Amount, PaymentType, PaymentStatus, PaymentDate
export const createPayment = async (payload) => {
  const bookingId = payload?.bookingId ?? payload?.BookingId;
  const amount = payload?.amount ?? payload?.Amount;

  if (bookingId == null) throw new Error("createPayment: bookingId is required");
  if (amount == null) throw new Error("createPayment: amount is required");

  const body = {
    bookingId: Number(bookingId),
    amount: Number(amount),
    paymentType: payload?.paymentType ?? payload?.PaymentType ?? "Combined",
    paymentStatus: payload?.paymentStatus ?? payload?.PaymentStatus ?? "Success",
    paymentDate: payload?.paymentDate ?? payload?.PaymentDate ?? new Date().toISOString(),
  };

  const res = await axiosInstance.post("/payments", body);
  return res.data;
};

// Demo Payment integration
export const createDemoOrder = async (bookingId, amount) => {
  const res = await axiosInstance.post("/payments/create-order", {
    bookingId: Number(bookingId),
    amount: Number(amount)
  });
  return res.data;
};

export const verifyDemoPayment = async (payload) => {
  // payload: { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod }
  const res = await axiosInstance.post("/payments/verify", payload);
  return res.data;
};
