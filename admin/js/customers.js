(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("customer-list");
    const message = document.getElementById("customer-message");

    try {
      const stored = localStorage.getItem("diofid-arena-users");
      const users = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(users)) throw new Error("Data pelanggan tidak valid.");

      const customers = users.filter((user) =>
        user &&
        user.role === "user" &&
        typeof user.name === "string" &&
        typeof user.email === "string"
      );

      if (customers.length === 0) {
        message.textContent = "Belum ada pelanggan terdaftar pada browser ini.";
        return;
      }

      customers.forEach((customer) => {
        const row = document.createElement("tr");
        const name = document.createElement("td");
        const email = document.createElement("td");
        name.textContent = customer.name;
        email.textContent = customer.email;
        row.append(name, email);
        tableBody.append(row);
      });
    } catch (error) {
      message.textContent = error.message || "Data pelanggan tidak dapat dimuat.";
    }
  });
})();
