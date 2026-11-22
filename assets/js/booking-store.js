(() => {
  const BOOKINGS_KEY = "diofid-arena-bookings";
  const FIELDS_KEY = "diofid-arena-fields";
  const STATUSES = ["pending", "confirmed", "cancelled"];

  const loadBookings = () => {
    const stored = localStorage.getItem(BOOKINGS_KEY);
    if (stored === null) return [];

    const bookings = JSON.parse(stored);
    if (!Array.isArray(bookings) || !bookings.every((booking) =>
      booking &&
      typeof booking.id === "string" &&
      typeof booking.fieldId === "string" &&
      typeof booking.fieldName === "string" &&
      typeof booking.customerName === "string" &&
      typeof booking.customerEmail === "string" &&
      typeof booking.date === "string" &&
      typeof booking.time === "string" &&
      Number.isFinite(booking.price) &&
      STATUSES.includes(booking.status) &&
      typeof booking.createdAt === "string"
    )) {
      throw new Error("Data pemesanan tidak valid. Periksa penyimpanan browser Anda.");
    }
    return bookings;
  };

  const getFields = () => {
    const stored = localStorage.getItem(FIELDS_KEY);
    if (stored === null) return [];
    const fields = JSON.parse(stored);
    if (!Array.isArray(fields)) throw new Error("Data lapangan tidak valid.");
    return fields;
  };

  const getSlots = (field, date) => {
    const start = field.openTime.split(":").map(Number);
    const end = field.closeTime.split(":").map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
      return [];
    }

    const bookings = loadBookings();
    const bookedTimes = new Set(bookings
      .filter((booking) => booking.fieldId === field.id && booking.date === date && booking.status !== "cancelled")
      .map((booking) => booking.time));
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const slots = [];
    for (let minutes = startMinutes; minutes + 60 <= endMinutes; minutes += 60) {
      const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
      const expired = date === today && minutes <= currentMinutes;
      slots.push({
        time,
        available: !expired && !bookedTimes.has(time),
        reason: expired ? "sudah lewat" : bookedTimes.has(time) ? "sudah dipesan" : ""
      });
    }
    return slots;
  };

  const createBooking = ({ fieldId, date, time, customerName, customerEmail }) => {
    const fields = getFields();
    const field = fields.find((item) => item.id === fieldId && item.active);
    if (!field) throw new Error("Lapangan tidak tersedia. Silakan muat ulang halaman.");

    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const parsedDate = new Date(`${date}T00:00:00`);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      Number.isFinite(parsedDate.getTime()) &&
      `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}` === date;
    if (!validDate || date < todayString) {
      throw new Error("Pilih tanggal hari ini atau tanggal berikutnya.");
    }
    if (!getSlots(field, date).some((slot) => slot.time === time && slot.available)) {
      throw new Error("Jam tersebut sudah dipesan atau tidak tersedia. Pilih jam lain.");
    }

    const booking = {
      id: `booking-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      fieldId: field.id,
      fieldName: field.name,
      customerName,
      customerEmail,
      date,
      time,
      price: field.price,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    const bookings = loadBookings();
    bookings.push(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return booking;
  };

  const updateStatus = (id, status) => {
    if (!STATUSES.includes(status)) throw new Error("Status pemesanan tidak valid.");
    const bookings = loadBookings();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index < 0) throw new Error("Pemesanan tidak ditemukan.");
    const booking = bookings[index];
    if (status !== "cancelled" && bookings.some((other) =>
      other.id !== booking.id &&
      other.fieldId === booking.fieldId &&
      other.date === booking.date &&
      other.time === booking.time &&
      other.status !== "cancelled"
    )) {
      throw new Error("Slot tersebut sudah digunakan pemesanan lain.");
    }
    booking.status = status;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  };

  window.DioFidBookingStore = { loadBookings, getSlots, createBooking, updateStatus };
})();
