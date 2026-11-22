(() => {
  const formatPrice = (price) => `Rp ${new Intl.NumberFormat("id-ID").format(price)}`;

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const localDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const renderTimeOptions = (select, field, date) => {
    select.replaceChildren();
    const slots = window.DioFidBookingStore.getSlots(field, date);
    if (slots.length === 0) {
      const option = new Option("Tidak ada slot satu jam pada jam operasional ini", "");
      select.add(option);
      select.disabled = true;
      return;
    }
    slots.forEach((slot) => {
      const option = new Option(
        slot.available ? slot.time : `${slot.time} — ${slot.reason}`,
        slot.time,
        false,
        slot.available && select.value === slot.time
      );
      option.disabled = !slot.available;
      select.add(option);
    });
    if (!slots.some((slot) => slot.available)) {
      select.selectedIndex = -1;
      select.disabled = true;
    } else {
      select.disabled = false;
    }
  };

  const makeBookingForm = (field) => {
    const form = createElement("form", "booking-form");
    const dateLabel = createElement("label", "", "Tanggal sewa");
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.name = "date";
    dateInput.min = localDate();
    dateInput.value = localDate();
    dateInput.required = true;
    dateLabel.append(dateInput);

    const timeLabel = createElement("label", "", "Jam tersedia (durasi 1 jam)");
    const timeSelect = document.createElement("select");
    timeSelect.name = "time";
    timeSelect.required = true;
    timeLabel.append(timeSelect);
    renderTimeOptions(timeSelect, field, dateInput.value);
    dateInput.addEventListener("change", () => renderTimeOptions(timeSelect, field, dateInput.value));

    const submit = createElement("button", "book-button", "Kirim pemesanan");
    submit.type = "submit";
    const message = createElement("p", "booking-form-message");
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    form.append(dateLabel, timeLabel, submit, message);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const sessionText = sessionStorage.getItem("diofid-arena-session");
      if (!sessionText) {
        message.textContent = "Sesi login tidak ditemukan. Silakan masuk kembali.";
        message.classList.add("is-error");
        return;
      }

      try {
        const session = JSON.parse(sessionText);
        if (session.role !== "user" || typeof session.name !== "string" || typeof session.email !== "string") {
          throw new Error("Sesi pelanggan tidak valid. Silakan masuk kembali.");
        }
        const booking = window.DioFidBookingStore.createBooking({
          fieldId: field.id,
          date: dateInput.value,
          time: timeSelect.value,
          customerName: session.name,
          customerEmail: session.email
        });
        message.textContent = `Pemesanan ${booking.fieldName} pada ${booking.date}, ${booking.time} berhasil dikirim. Menunggu konfirmasi admin.`;
        message.classList.remove("is-error");
        submit.disabled = true;
        dateInput.disabled = true;
        timeSelect.disabled = true;
      } catch (error) {
        message.textContent = error.message || "Pemesanan tidak dapat disimpan.";
        message.classList.add("is-error");
        renderTimeOptions(timeSelect, field, dateInput.value);
      }
    });
    return form;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("user-field-list");
    if (!list) return;

    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-book-field]");
      if (!button) return;
      const card = button.closest(".field-card");
      const existing = card.querySelector(".booking-form");
      if (existing) {
        existing.remove();
        button.textContent = "Pilih";
        return;
      }

      list.querySelectorAll(".booking-form").forEach((form) => form.remove());
      list.querySelectorAll("[data-book-field]").forEach((item) => { item.textContent = "Pilih"; });
      let field;
      try {
        const fields = JSON.parse(localStorage.getItem("diofid-arena-fields") || "[]");
        field = Array.isArray(fields) && fields.find((item) => item.id === button.dataset.bookField && item.active);
      } catch (error) {
        document.getElementById("booking-message").textContent = error.message || "Data lapangan tidak dapat dimuat.";
        return;
      }
      if (!field) {
        document.getElementById("booking-message").textContent = "Lapangan tidak tersedia. Muat ulang halaman.";
        return;
      }
      button.textContent = "Tutup";
      card.querySelector(".field-card-content").append(makeBookingForm(field));
    });
  });
})();
