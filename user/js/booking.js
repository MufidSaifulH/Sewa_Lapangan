document.addEventListener("DOMContentLoaded", () => {
  const fieldId = new URLSearchParams(window.location.search).get("id");
  const fieldContent = document.querySelector("#detail-content");
  const errorMessage = document.querySelector("#detail-error");

  try {
    const field = window.DioFidFields.loadFields().find((item) => item.id === fieldId && item.active);
    if (!field) {
      errorMessage.textContent = "Lapangan tidak ditemukan atau sedang tidak tersedia.";
      errorMessage.hidden = false;
      return;
    }

    fieldContent.hidden = false;
    document.title = `${field.name} | DioFid Arena`;
    document.querySelector("#detail-title").textContent = field.name;
    document.querySelector("#detail-sport-visual").textContent = field.sport;
    document.querySelector("#detail-type").textContent = field.type;
    document.querySelector("#detail-sport").textContent = field.sport;
    document.querySelector("#detail-description").textContent = field.description;
    document.querySelector("#detail-facilities").textContent = field.facilities || "Belum ada informasi fasilitas.";
    document.querySelector("#detail-hours").textContent = `${field.openTime}–${field.closeTime}`;
    document.querySelector("#detail-price").textContent = `${new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(field.price)} / jam`;

    const dateInput = document.querySelector("#booking-date");
    const timeSelect = document.querySelector("#booking-time");
    const endTimeSelect = document.querySelector("#booking-end-time");
    const form = document.querySelector("#booking-form");
    const message = document.querySelector("#booking-message");
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    dateInput.min = today;
    dateInput.value = today;

    const updateTimeOptions = () => {
      try {
        timeSelect.replaceChildren();
        endTimeSelect.replaceChildren();
        const slots = window.DioFidBookingStore.getSlots(field, dateInput.value);
        const firstAvailable = slots.find((slot) => slot.available);

        if (!firstAvailable) {
          timeSelect.add(new Option("Tidak ada jam tersedia pada tanggal ini", ""));
          timeSelect.disabled = true;
          endTimeSelect.add(new Option("Tidak ada jam tersedia", ""));
          endTimeSelect.disabled = true;
          return;
        }

        timeSelect.add(new Option("Pilih jam mulai", ""));
        slots.forEach((slot) => {
          const option = new Option(
            slot.available ? slot.time : `${slot.time} — ${slot.reason}`,
            slot.time
          );
          option.disabled = !slot.available;
          timeSelect.add(option);
        });
        timeSelect.disabled = false;
        timeSelect.value = firstAvailable.time;
        updateEndTimeOptions(slots);
        message.textContent = "";
        message.classList.remove("is-error");
      } catch (error) {
        message.textContent = error.message || "Jadwal tidak dapat dimuat.";
        message.classList.add("is-error");
        timeSelect.disabled = true;
        endTimeSelect.disabled = true;
      }
    };

    const updateEndTimeOptions = (slots = window.DioFidBookingStore.getSlots(field, dateInput.value)) => {
      endTimeSelect.replaceChildren();
      endTimeSelect.add(new Option("Pilih jam selesai", ""));
      if (!timeSelect.value) {
        endTimeSelect.disabled = true;
        return;
      }
      const startMinutes = Number(timeSelect.value.split(":")[0]) * 60;
      let firstAvailableEnd = "";
      for (let endMinutes = startMinutes + 60; endMinutes <= 24 * 60; endMinutes += 60) {
        const endTime = endMinutes === 24 * 60
          ? "24:00"
          : `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:00`;
        const rangeSlots = slots.filter((slot) => {
          const slotStart = Number(slot.time.split(":")[0]) * 60;
          return slotStart >= startMinutes && slotStart < endMinutes;
        });
        const available = rangeSlots.length === (endMinutes - startMinutes) / 60 &&
          rangeSlots.every((slot) => slot.available);
        const option = new Option(available ? endTime : `${endTime} — jam terpakai`, endTime);
        option.disabled = !available;
        endTimeSelect.add(option);
        if (available && !firstAvailableEnd) firstAvailableEnd = endTime;
      }
      endTimeSelect.disabled = !firstAvailableEnd;
      endTimeSelect.value = firstAvailableEnd;
    };

    dateInput.addEventListener("change", updateTimeOptions);
    timeSelect.addEventListener("change", () => updateEndTimeOptions());
    updateTimeOptions();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      message.classList.remove("is-error");

      try {
        const session = JSON.parse(sessionStorage.getItem("diofid-arena-session") || "null");
        if (!session || session.role !== "user" || typeof session.name !== "string" || typeof session.email !== "string") {
          throw new Error("Sesi pelanggan tidak valid. Silakan masuk kembali.");
        }

        const booking = window.DioFidBookingStore.createBooking({
          fieldId: field.id,
          date: dateInput.value,
          time: timeSelect.value,
          endTime: endTimeSelect.value,
          customerName: session.name,
          customerEmail: session.email
        });
        message.textContent = `Pemesanan ${booking.fieldName} pada ${booking.date}, ${booking.time}–${booking.endTime} berhasil dikirim dan menunggu konfirmasi admin.`;
        form.querySelectorAll("input, select, button").forEach((control) => { control.disabled = true; });
      } catch (error) {
        message.textContent = error.message || "Pemesanan tidak dapat disimpan.";
        message.classList.add("is-error");
        updateTimeOptions();
      }
    });
  } catch (error) {
    errorMessage.textContent = error.message || "Data lapangan tidak dapat dimuat.";
    errorMessage.hidden = false;
  }
});
