(() => {
  const formatPrice = (price) => `Rp ${new Intl.NumberFormat("id-ID").format(price)}`;
  const formatDate = (date, time) => {
    const [year, month, day] = date.split("-").map(Number);
    return `${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(year, month - 1, day))}, ${time}`;
  };

  document.addEventListener("DOMContentLoaded", () => {
    try {
      const bookings = window.DioFidBookingStore.loadBookings();
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const month = today.slice(0, 7);
      const todaysBookings = bookings.filter((booking) => booking.date === today);
      const pendingBookings = bookings.filter((booking) => booking.status === "pending");
      const monthlyRevenue = bookings
        .filter((booking) => booking.date.startsWith(month) && booking.status === "confirmed")
        .reduce((total, booking) => total + booking.price, 0);

      document.querySelector("[data-today-booking-count]").textContent = String(todaysBookings.length);
      document.querySelector("[data-pending-booking-count]").textContent = String(pendingBookings.length);
      document.querySelector("[data-monthly-revenue]").textContent = formatPrice(monthlyRevenue);

      const body = document.getElementById("dashboard-booking-list");
      const recentBookings = bookings
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 5);
      recentBookings.forEach((booking) => {
        const row = document.createElement("tr");
        [
          booking.customerName,
          booking.fieldName,
          formatDate(booking.date, booking.time),
          formatPrice(booking.price),
          booking.status === "confirmed" ? "Terkonfirmasi" : booking.status === "cancelled" ? "Dibatalkan" : "Menunggu"
        ].forEach((value) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.append(cell);
        });
        body.append(row);
      });
      if (recentBookings.length === 0) {
        document.getElementById("dashboard-booking-empty").hidden = false;
      }
    } catch (error) {
      const message = document.getElementById("dashboard-booking-empty");
      message.hidden = false;
      message.textContent = error.message || "Ringkasan pemesanan tidak dapat dimuat.";
    }
  });
})();
