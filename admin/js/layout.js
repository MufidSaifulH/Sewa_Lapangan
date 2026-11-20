(() => {
  const links = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "index.html",
      icon: '<rect x="3" y="3" width="8" height="8" rx="1.5"></rect><rect x="13" y="3" width="8" height="5" rx="1.5"></rect><rect x="13" y="10" width="8" height="11" rx="1.5"></rect><rect x="3" y="13" width="8" height="8" rx="1.5"></rect>'
    },
    {
      id: "fields",
      label: "Lapangan",
      href: "fields.html",
      icon: '<rect x="3" y="4" width="18" height="16" rx="1.5"></rect><path d="M12 4v16M3 12h18M8 4a8 8 0 0 1 0 16M16 4a8 8 0 0 0 0 16"></path>'
    },
    {
      id: "bookings",
      label: "Pemesanan",
      href: "bookings.html",
      icon: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h6"></path>'
    },
    {
      id: "customers",
      label: "Pelanggan",
      href: "customers.html",
      icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="10" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>'
    },
    {
      id: "reports",
      label: "Laporan",
      href: "reports.html",
      icon: '<path d="M4 19V5M4 19h17"></path><path d="m7 15 4-4 3 2 6-7"></path>'
    },
    {
      id: "settings",
      label: "Pengaturan",
      href: "settings.html",
      icon: '<circle cx="12" cy="12" r="3"></circle><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.8-.6a8 8 0 0 1-1.6.9l-.3 1.9h-2.8l-.3-1.9a8 8 0 0 1-1.6-.9l-1.8.6-1.4-2.4 1.5-1.2a7 7 0 0 1 0-1.8l-1.5-1.2 1.4-2.4 1.8.6a8 8 0 0 1 1.6-.9l.3-1.9h2.8l.3 1.9a8 8 0 0 1 1.6.9l1.8-.6 1.4 2.4-1.5 1.2a7 7 0 0 1 0 1.8Z"></path>'
    }
  ];

  const sidebar = document.querySelector("[data-admin-sidebar]");
  const currentPage = document.body.dataset.adminPage;
  const title = document.querySelector("[data-admin-page-title]");

  if (!sidebar || !currentPage) return;

  const navItems = links.map((link) => {
    const current = link.id === currentPage;
    return `<li><a class="nav-link${current ? " active" : ""}" href="${link.href}"${current ? ' aria-current="page"' : ""}><svg viewBox="0 0 24 24" aria-hidden="true">${link.icon}</svg>${link.label}</a></li>`;
  }).join("");

  sidebar.innerHTML = `
    <a class="brand" href="index.html" aria-label="DioFid Arena, halaman admin">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 5h16v14H4z"></path>
          <path d="M12 5v14M4 12h16M8 5a7 7 0 0 1 0 14M16 5a7 7 0 0 0 0 14"></path>
        </svg>
      </span>
      <span>DioFid Arena</span>
    </a>
    <p class="nav-label">Menu utama</p>
    <nav aria-label="Menu utama"><ul class="nav-list">${navItems}</ul></nav>
    <div class="sidebar-bottom">
      <div class="admin-profile">
        <span class="avatar" aria-hidden="true">AD</span>
        <div>
          <p class="profile-name" data-session-name>Admin DioFid Arena</p>
          <p class="profile-role">Administrator</p>
        </div>
        <button class="logout-button" type="button" data-logout>Keluar</button>
      </div>
    </div>`;

  const currentTitle = document.querySelector("[data-admin-current-title]");
  if (currentTitle && title) currentTitle.textContent = title.textContent;

  const today = document.querySelector("[data-admin-today]");
  if (today) {
    today.textContent = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date());
  }
})();
