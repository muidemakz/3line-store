const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: "./dashboard.html", icon: "./assets/sidebar-dashboard-active.svg" },
  { key: "sessions", label: "Sessions", href: "./sessions.html", icon: "./assets/sidebar-sessions.svg" },
  { key: "store", label: "Store", href: "./store.html", icon: "./assets/sidebar-store.svg" },
  { key: "users", label: "Users", href: "./users.html", icon: "./assets/sidebar-users.svg" },
  { key: "suggestions", label: "Suggestions", href: "./suggestions.html", icon: "./assets/sidebar-suggestions.svg" },
  { key: "settings", label: "Settings", href: "./settings.html", icon: "./assets/sidebar-settings.svg" },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderDashboardShell({ activeKey, pageTitle }) {
  const app = document.getElementById("app");
  if (!app) return;

  const template = document.getElementById("page-template");
  const pageHtml = template ? template.innerHTML : "";

  const navHtml = NAV_ITEMS.map((item) => {
    const active = item.key === activeKey;
    return `
      <a class="navItem ${active ? "navItem--active" : ""}" href="${item.href}">
        <img class="navItem__icon" src="${item.icon}" alt="" />
        <span class="navItem__label">${escapeHtml(item.label)}</span>
      </a>
    `;
  }).join("");

  app.innerHTML = `
    <div class="app">
      <aside class="sidebar" aria-label="Sidebar">
        <div class="sidebar__logo" aria-label="3Line Store">
          <div class="sidebar__logoText">3Line Store</div>
        </div>

        <nav class="sidebar__nav" aria-label="Primary">
          ${navHtml}
        </nav>

        <div class="sidebar__footer">
          <div class="sidebar__user">
            <div class="avatar" aria-hidden="true">
              <div class="avatar__mask"></div>
              <div class="avatar__initials">OD</div>
            </div>
            <div class="userInfo">
              <div class="userInfo__name">Omiran Dam...</div>
              <div class="userInfo__role">SuperAdmin</div>
            </div>
          </div>

          <div class="sidebar__divider" role="separator"></div>

          <a class="navItem navItem--danger" href="./index.html">
            <img class="navItem__icon" src="./assets/logout.svg" alt="" />
            <span class="navItem__label">Logout</span>
          </a>
        </div>
      </aside>

      <main class="main" aria-label="Main">
        <header class="topHeader">
          <div class="breadcrumb" aria-label="Breadcrumb">
            <div class="breadcrumb__start" aria-hidden="true">
              <img class="breadcrumb__home" src="./assets/home-smile-alt.svg" alt="" />
              <img class="breadcrumb__chev" src="./assets/chevron-right-alt.svg" alt="" />
            </div>
            <div class="breadcrumb__current">${escapeHtml(pageTitle)}</div>
          </div>

          <button class="iconButton" type="button" aria-label="Notifications">
            <span class="iconButton__bg"></span>
            <img class="iconButton__icon" src="./assets/notification-bell.svg" alt="" />
            <img class="iconButton__dot" src="./assets/notification-dot.svg" alt="" />
          </button>
        </header>

        <section class="panel">
          <div class="panel__content">
            ${pageHtml}
          </div>
        </section>
      </main>
    </div>

    <div id="modal-root"></div>
    <div id="toast-root" class="toastRoot"></div>
  `;
}

