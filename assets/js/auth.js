(() => {
  const USERS_KEY = "diofid-arena-users";
  const SESSION_KEY = "diofid-arena-session";
  const ADMIN_EMAIL = "admin@diofidarena.com";
  const ADMIN_PASSWORD = "Admin123!";

  const getUsers = () => {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) return [];

    const users = JSON.parse(stored);
    if (!Array.isArray(users)) throw new Error("Data akun tidak valid.");
    return users;
  };

  const getSession = () => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    try {
      const session = JSON.parse(stored);
      if (session && ["admin", "user"].includes(session.role)) return session;
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    sessionStorage.removeItem(SESSION_KEY);
    return null;
  };

  const setSession = (user) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      name: user.name,
      email: user.email,
      role: user.role
    }));
  };

  const hashPassword = async (password) => {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Browser tidak mendukung penyimpanan kata sandi yang aman. Buka melalui localhost atau HTTPS.");
    }

    const bytes = new TextEncoder().encode(password);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const goToRolePage = (role) => {
    window.location.replace(role === "admin" ? "admin/index.html" : "user/index.html");
  };

  const showMessage = (message, success) => {
    const output = document.getElementById("form-message");
    if (!output) return;
    output.textContent = message;
    output.classList.toggle("success", Boolean(success));
  };

  const switchMode = (mode) => {
    const isRegister = mode === "register";
    document.getElementById("login-form").hidden = isRegister;
    document.getElementById("register-form").hidden = !isRegister;
    document.getElementById("login-tab").classList.toggle("active", !isRegister);
    document.getElementById("register-tab").classList.toggle("active", isRegister);
    document.getElementById("login-tab").setAttribute("aria-selected", String(!isRegister));
    document.getElementById("register-tab").setAttribute("aria-selected", String(isRegister));
    document.getElementById("form-title").textContent = isRegister ? "Buat akun baru" : "Masuk ke akun";
    document.getElementById("form-description").textContent = isRegister
      ? "Daftar menggunakan nama, email, dan kata sandi."
      : "Gunakan email dan kata sandi akun Anda.";
    showMessage("", false);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.password.value;

    try {
      let user;
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        user = { name: "Admin DioFid Arena", email: ADMIN_EMAIL, role: "admin" };
      } else {
        const passwordHash = await hashPassword(password);
        user = getUsers().find((account) => account.email === email && account.passwordHash === passwordHash);
      }

      if (!user) {
        showMessage("Email atau kata sandi tidak sesuai.", false);
        return;
      }

      setSession(user);
      goToRolePage(user.role);
    } catch (error) {
      showMessage(error.message || "Tidak dapat memproses login. Coba lagi.", false);
    }
  };

  const handleRegistration = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.password.value;

    if (name.length < 2) {
      showMessage("Nama harus terdiri dari minimal 2 karakter.", false);
      return;
    }
    if (password.length < 8) {
      showMessage("Kata sandi harus terdiri dari minimal 8 karakter.", false);
      return;
    }

    try {
      const users = getUsers();
      if (email === ADMIN_EMAIL || users.some((account) => account.email === email)) {
        showMessage("Email tersebut sudah terdaftar.", false);
        return;
      }

      users.push({
        name,
        email,
        passwordHash: await hashPassword(password),
        role: "user"
      });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      setSession({ name, email, role: "user" });
      goToRolePage("user");
    } catch (error) {
      showMessage(error.message || "Akun tidak dapat dibuat. Coba lagi.", false);
    }
  };

  const requireRole = (role) => {
    const session = getSession();
    if (!session || session.role !== role) {
      window.location.replace("../index.html");
      return;
    }

    document.documentElement.classList.add("authorized");
    document.querySelectorAll("[data-session-name]").forEach((element) => {
      element.textContent = session.name;
    });
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.replace("../index.html");
  };

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    if (page === "auth") {
      const session = getSession();
      if (session) {
        goToRolePage(session.role);
        return;
      }

      document.documentElement.classList.add("authorized");
      document.querySelectorAll("[data-mode]").forEach((button) => {
        button.addEventListener("click", () => switchMode(button.dataset.mode));
      });
      document.getElementById("login-form").addEventListener("submit", handleLogin);
      document.getElementById("register-form").addEventListener("submit", handleRegistration);
      if (new URLSearchParams(window.location.search).get("mode") === "register") {
        switchMode("register");
      }
      return;
    }

    if (page === "admin") requireRole("admin");
    if (page === "user") requireRole("user");
    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", logout);
    });

    document.querySelectorAll("[data-book-field]").forEach((button) => {
      button.addEventListener("click", () => {
        const output = document.getElementById("booking-message");
        output.textContent = `${button.dataset.bookField} dipilih. Fitur pemesanan akan tersedia setelah sistem booking terhubung.`;
      });
    });
  });
})();
