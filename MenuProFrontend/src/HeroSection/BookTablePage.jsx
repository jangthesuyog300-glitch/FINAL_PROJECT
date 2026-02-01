// ✅ src/pages/BookTablePage.jsx (FULL COPY-PASTE)
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BookTableForm from "../Components/Booking/BookingForm";
import MenuList from "../Components/MenuList";
import RazorpayDemo from "../Components/Payment/Payment";
import ViewCartButton from "../Components/Cart/ViewCartButton";
import CartDrawer from "../Components/Cart/CartDrawer";
import "../Styles/BookTablePage.css";
import { getMenuByRestaurant } from "../services/menuService";

import { createBooking } from "../services/bookingService";
import DemoPaymentModal from "../Components/Payment/DemoPaymentModal";
import { createDemoOrder, verifyDemoPayment } from "../services/paymentService";
import { useAuth } from "../context/AuthContext";

export default function BookTablePage() {
  const { id } = useParams(); // restaurantId
  const { user, setShowLogin } = useAuth();
  const navigate = useNavigate();

  if (!id) return <h1 style={{ color: "red" }}>Restaurant ID missing in URL</h1>;

  const userId = user?.userId;


  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [bookingDraft, setBookingDraft] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Removed auto-redirect. User can browse menu without login.
  // Login will be triggered on "Book" click if needed.

  // 🍽 Fetch Menu
  useEffect(() => {
    const fetchMenu = async () => {
      const data = await getMenuByRestaurant(id);
      setMenu(data);
    };
    fetchMenu();
  }, [id]);

  // ➕ Add to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  // ➖ Remove qty
  const removeFromCart = (itemId) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === itemId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  };

  // ❌ Delete from cart
  const deleteFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  // 📅 Booking submit
  // (New handleBooking implemented below)

  // ✅ After Demo Payment success callback
  const handlePaymentSuccess = async (response) => {
    if (!bookingDraft || !bookingDataForModal) return;

    const tableBookingCharge = 100;
    const foodTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const totalAmount = foodTotal + tableBookingCharge;

    try {
      setSaving(true);

      // 1) Create PRELIMINARY Booking (Pending)
      const createdBooking = await createBooking({
        userId: Number(userId),
        restaurantId: Number(id),
        tableId: bookingDataForModal.tableId,
        timeSlotId: bookingDataForModal.timeSlotId,
        bookingDate: bookingDataForModal.bookingDate,
        bookingStatus: "Pending",
        bookingAmount: totalAmount,
        items: cart.map(i => ({ foodItemId: i.id, quantity: i.qty }))
      });

      // 2) Create Demo Order (Records Payment as Pending)
      const order = await createDemoOrder(createdBooking.bookingId, totalAmount);

      // 3) Verify Demo Payment (Marks Success)
      await verifyDemoPayment({
        razorpayOrderId: order.orderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
        paymentMethod: response.paymentMethod
      });

      setCart([]);
      setShowPayment(false);
      setBookingDataForModal(null);
      navigate("/booking-confirmation");
    } catch (e) {
      console.error(e);
      alert(e.response?.data || "Payment failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const [bookingDataForModal, setBookingDataForModal] = useState(null);

  const handleBooking = (bookingData) => {
    if (!userId) {
      setShowLogin(true);
      return;
    }
    const foodTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tableBookingCharge = 100;
    setBookingDraft({ amount: foodTotal + tableBookingCharge });
    setBookingDataForModal(bookingData);
    setShowPayment(true);
  };

  return (
    <div className="book-table-page">
      {/* 🛒 VIEW CART BUTTON */}
      <ViewCartButton cart={cart} onClick={() => setShowCart(true)} />

      {/* LEFT: MENU */}
      <div className="menu-section">
        <h2>Menu</h2>
        <MenuList menu={menu} onAddToCart={addToCart} />
      </div>

      {/* RIGHT: BOOKING */}
      <div className="booking-section">
        <BookTableForm restaurantId={Number(id)} onBook={handleBooking} />
      </div>

      {/* 🧾 CART DRAWER */}
      {showCart && (
        <CartDrawer
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onDelete={deleteFromCart}
          onClose={() => setShowCart(false)}
        />
      )}

      {/* 💳 DEMO PAYMENT MODAL */}
      <DemoPaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={bookingDraft?.amount || 0}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {saving && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "#000",
            color: "#fff",
            padding: 10,
            zIndex: 1000
          }}
        >
          Processing...
        </div>
      )}
    </div>
  );
}
