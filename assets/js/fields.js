(() => {
  const FIELDS_KEY = "diofid-arena-fields";
  const MAX_PHOTO_SIZE = 1024 * 1024;
  const DEFAULT_FIELDS = [
    {
      id: "seed-futsal-a",
      name: "Futsal A",
      sport: "Futsal",
      type: "Indoor, rumput sintetis",
      price: 150000,
      openTime: "08:00",
      closeTime: "22:00",
      description: "Lapangan futsal rumput sintetis, cocok untuk pertandingan bersama teman.",
      photo: "",
      active: true
    },
    {
      id: "seed-badminton-1",
      name: "Badminton 1",
      sport: "Badminton",
      type: "Indoor, lantai vinyl",
      price: 80000,
      openTime: "08:00",
      closeTime: "22:00",
      description: "Lapangan indoor dengan pencahayaan nyaman untuk bermain kapan saja.",
      photo: "",
      active: true
    },
    {
      id: "seed-basket-indoor",
      name: "Basket Indoor",
      sport: "Basket",
      type: "Indoor, lantai kayu",
      price: 200000,
      openTime: "08:00",
      closeTime: "22:00",
      description: "Lapangan basket indoor dengan area bermain luas dan fasilitas penonton.",
      photo: "",
      active: true
    }
  ];
  let handleEditField = () => {};
  let handleDeleteField = () => {};

  const isField = (field) => field &&
    typeof field.id === "string" &&
    typeof field.name === "string" &&
    typeof field.sport === "string" &&
    typeof field.type === "string" &&
    Number.isFinite(field.price) &&
    typeof field.openTime === "string" &&
    typeof field.closeTime === "string" &&
    typeof field.description === "string" &&
    typeof field.photo === "string" &&
    typeof field.active === "boolean";

  const loadFields = () => {
    const stored = localStorage.getItem(FIELDS_KEY);
    if (stored === null) {
      localStorage.setItem(FIELDS_KEY, JSON.stringify(DEFAULT_FIELDS));
      return DEFAULT_FIELDS.slice();
    }

    const fields = JSON.parse(stored);
    if (!Array.isArray(fields) || !fields.every(isField)) {
      throw new Error("Data lapangan tidak valid. Periksa penyimpanan browser Anda.");
    }
    return fields;
  };

  const formatPrice = (price) => `Rp ${new Intl.NumberFormat("id-ID").format(price)}`;

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const createVisual = (field) => {
    const visual = createElement("div", "field-visual");
    if (field.photo) {
      const image = createElement("img", "field-photo");
      image.src = field.photo;
      image.alt = `Foto ${field.name}`;
      visual.append(image);
    } else {
      visual.setAttribute("aria-hidden", "true");
      visual.append(createElement("span", "field-visual-label", field.sport));
    }
    return visual;
  };

  const renderUserFields = (fields) => {
    const list = document.getElementById("user-field-list");
    if (!list) return;

    const emptyMessage = document.getElementById("fields-empty");
    const activeFields = fields.filter((field) => field.active);
    list.replaceChildren();
    activeFields.forEach((field) => {
      const card = createElement("article", "field-card");
      card.append(createVisual(field));

      const content = createElement("div", "field-card-content");
      content.append(createElement("h2", "", field.name));
      content.append(createElement("p", "", field.description));

      const details = createElement(
        "p",
        "field-card-details",
        `${field.sport} · ${field.type} · ${field.openTime}–${field.closeTime}`
      );
      content.append(details);

      const footer = createElement("div", "field-card-footer");
      const price = createElement("div", "field-price", formatPrice(field.price));
      price.append(createElement("span", "", "per jam"));
      const button = createElement("button", "book-button", "Pilih");
      button.type = "button";
      button.dataset.bookField = field.id;
      footer.append(price, button);
      content.append(footer);
      card.append(content);
      list.append(card);
    });

    emptyMessage.hidden = activeFields.length > 0;
  };

  const renderAdminFields = (fields) => {
    const total = document.querySelector("[data-field-count]");
    const active = document.querySelector("[data-active-field-count]");
    if (total) total.textContent = String(fields.length);
    if (active) active.textContent = `${fields.filter((field) => field.active).length} tersedia`;

    const list = document.getElementById("admin-field-list");
    if (!list) return;

    list.replaceChildren();

    if (fields.length === 0) {
      list.append(createElement("p", "fields-empty", "Belum ada lapangan. Tambahkan lapangan menggunakan formulir di atas."));
      return;
    }

    fields.forEach((field) => {
      const card = createElement("article", "admin-field-card");
      card.append(createVisual(field));
      const details = createElement("div", "admin-field-content");
      const titleRow = createElement("div", "admin-field-title");
      titleRow.append(createElement("h3", "", field.name));
      titleRow.append(createElement("span", `field-status${field.active ? " is-active" : ""}`, field.active ? "Aktif" : "Nonaktif"));
      details.append(titleRow);
      details.append(createElement("p", "", `${field.sport} · ${field.type}`));
      details.append(createElement("p", "", `${formatPrice(field.price)} per jam · ${field.openTime}–${field.closeTime}`));
      details.append(createElement("p", "admin-field-description", field.description));

      const actions = createElement("div", "admin-field-actions");
      const editButton = createElement("button", "secondary-button", "Edit");
      editButton.type = "button";
      editButton.addEventListener("click", () => handleEditField(field));
      const deleteButton = createElement("button", "secondary-button delete-button", "Hapus");
      deleteButton.type = "button";
      deleteButton.addEventListener("click", () => handleDeleteField(field));
      actions.append(editButton, deleteButton);
      details.append(actions);
      card.append(details);
      list.append(card);
    });
  };

  const showFormMessage = (message, isError) => {
    const output = document.getElementById("field-form-message");
    if (!output) return;
    output.textContent = message;
    output.classList.toggle("is-error", Boolean(isError));
  };

  const render = (fields) => {
    renderAdminFields(fields);
    renderUserFields(fields);
  };

  const saveFields = (updatedFields) => {
    localStorage.setItem(FIELDS_KEY, JSON.stringify(updatedFields));
    render(updatedFields);
  };

  const readPhoto = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Foto tidak dapat dibaca. Coba pilih file lain.")));
    reader.readAsDataURL(file);
  });

  const setupAdmin = (fields) => {
    const form = document.getElementById("field-form");
    if (!form) return fields;
    const cancelButton = document.querySelector("[data-field-cancel]");
    const submitButton = form.querySelector('[type="submit"]');

    const resetForm = () => {
      form.reset();
      form.elements.id.value = "";
      submitButton.textContent = "Simpan Lapangan";
      cancelButton.hidden = true;
      showFormMessage("", false);
    };

    handleEditField = (field) => {
      form.elements.id.value = field.id;
      form.elements.name.value = field.name;
      form.elements.sport.value = field.sport;
      form.elements.type.value = field.type;
      form.elements.price.value = String(field.price);
      form.elements.openTime.value = field.openTime;
      form.elements.closeTime.value = field.closeTime;
      form.elements.description.value = field.description;
      form.elements.active.value = String(field.active);
      submitButton.textContent = "Simpan Perubahan";
      cancelButton.hidden = false;
      showFormMessage("Mode edit: foto lama tetap digunakan jika foto baru tidak dipilih.", false);
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    handleDeleteField = (field) => {
      if (!window.confirm(`Hapus lapangan "${field.name}"?`)) return;
      try {
        const updatedFields = fields.filter((item) => item.id !== field.id);
        saveFields(updatedFields);
        fields = updatedFields;
        resetForm();
        showFormMessage("Lapangan berhasil dihapus.", false);
      } catch (error) {
        showFormMessage(error.message || "Lapangan tidak dapat dihapus.", true);
      }
    };

    cancelButton.addEventListener("click", resetForm);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const id = String(data.get("id") || "");
      const name = String(data.get("name") || "").trim();
      const sport = String(data.get("sport") || "");
      const type = String(data.get("type") || "").trim();
      const price = Number(data.get("price"));
      const existing = fields.find((field) => field.id === id);
      const photoFile = form.elements.photo.files[0];
      const openTime = String(data.get("openTime"));
      const closeTime = String(data.get("closeTime"));

      if (!Number.isFinite(price) || price <= 0) {
        showFormMessage("Harga harus lebih besar dari 0.", true);
        return;
      }
      if (!/^\d{2}:\d{2}$/.test(openTime) || !/^\d{2}:\d{2}$/.test(closeTime) || closeTime <= openTime) {
        showFormMessage("Jam tutup harus setelah jam buka.", true);
        return;
      }
      if (fields.some((field) => field.id !== id && field.name.toLocaleLowerCase("id-ID") === name.toLocaleLowerCase("id-ID"))) {
        showFormMessage("Nama lapangan tersebut sudah digunakan.", true);
        return;
      }
      if (photoFile && !photoFile.type.startsWith("image/")) {
        showFormMessage("File foto harus berupa gambar.", true);
        return;
      }
      if (photoFile && photoFile.size > MAX_PHOTO_SIZE) {
        showFormMessage("Ukuran foto maksimal 1 MB.", true);
        return;
      }

      try {
        const photo = photoFile ? await readPhoto(photoFile) : (existing ? existing.photo : "");
        const field = {
          id: existing ? existing.id : `field-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          name,
          sport,
          type,
          price,
          openTime,
          closeTime,
          description: String(data.get("description") || "").trim(),
          photo,
          active: data.get("active") === "true"
        };
        const updatedFields = existing
          ? fields.map((item) => item.id === existing.id ? field : item)
          : [...fields, field];

        saveFields(updatedFields);
        fields = updatedFields;
        resetForm();
        showFormMessage(existing ? "Perubahan lapangan berhasil disimpan." : "Lapangan berhasil ditambahkan.", false);
      } catch (error) {
        showFormMessage(error.message || "Lapangan tidak dapat disimpan. Periksa kapasitas penyimpanan browser.", true);
      }
    });

    return fields;
  };

  document.addEventListener("DOMContentLoaded", () => {
    try {
      let fields = loadFields();
      const adminForm = document.getElementById("field-form");
      if (adminForm) {
        setupAdmin(fields);
      }
      render(fields);
    } catch (error) {
      const output = document.getElementById("field-form-message") || document.getElementById("booking-message");
      if (output) output.textContent = error.message || "Data lapangan tidak dapat dimuat.";
    }
  });
})();
