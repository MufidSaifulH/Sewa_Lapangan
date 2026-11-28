(() => {
  const formatPrice = (price) => `Rp ${new Intl.NumberFormat("id-ID").format(price)}`;
  const formatDate = (date, time) => {
    const [year, month, day] = date.split("-").map(Number);
    return `${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(year, month - 1, day))}, ${time}`;
  };

  const render = () => {
    const body = document.getElementById("booking-list");
    const message = document.getElementById("booking-message");
    body.replaceChildren();
    const bookings = window.DioFidBookingStore.loadBookings()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    if (bookings.length === 0) {
      message.textContent = "Belum ada pemesanan. Pemesanan dari pelanggan akan tampil di sini.";
      return;
    }

    message.textContent = "";
    bookings.forEach((booking) => {
      const row = document.createElement("tr");
      [
        booking.customerName,
        booking.customerEmail,
        booking.fieldName,
        formatDate(booking.date, booking.endTime ? `${booking.time}–${booking.endTime}` : booking.time),
        formatPrice(booking.price)
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });

      const statusCell = document.createElement("td");
      const select = document.createElement("select");
      select.className = "booking-status-select";
      select.setAttribute("aria-label", `Status pemesanan ${booking.customerName}`);
      [
        ["pending", "Menunggu"],
        ["confirmed", "Terkonfirmasi"],
        ["cancelled", "Dibatalkan"]
      ].forEach(([value, label]) => {
        const option = new Option(label, value, false, booking.status === value);
        select.add(option);
      });
      select.addEventListener("change", () => {
        try {
          window.DioFidBookingStore.updateStatus(booking.id, select.value);
          render();
        } catch (error) {
          select.value = booking.status;
          message.textContent = error.message || "Status pemesanan tidak dapat diperbarui.";
        }
      });
      statusCell.append(select);
      row.append(statusCell);
      body.append(row);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    try {
      render();
    } catch (error) {
      document.getElementById("booking-message").textContent = error.message || "Data pemesanan tidak dapat dimuat.";
    }
  });
})();
