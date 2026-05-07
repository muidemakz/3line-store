function ensureRoots() {
  const modalRoot = document.getElementById("modal-root");
  const toastRoot = document.getElementById("toast-root");
  return { modalRoot, toastRoot };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toggleRowMenu(el) {
  const menu = el.querySelector(".rowActionMenu");
  if (!menu) return;
  
  // Close all other open menus first
  document.querySelectorAll(".rowActionMenu--open").forEach(op => {
    if (op !== menu) op.classList.remove("rowActionMenu--open");
  });
  
  menu.classList.toggle("rowActionMenu--open");
  
  // Close menu when clicking outside
  const closeMenu = (e) => {
    if (!el.contains(e.target)) {
      menu.classList.remove("rowActionMenu--open");
      document.removeEventListener("click", closeMenu);
    }
  };
  document.addEventListener("click", closeMenu);
}

function renderTableActions(options = ["View Item", "Edit Item", "Deactivate", "Delete Item"]) {
  return `
    <div class="tableActionDots" onclick="toggleRowMenu(this)">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <path d="M12 13a1 1 0 100-2 1 1 0 000 2zm0-6a1 1 0 100-2 1 1 0 000 2zm0 12a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <div class="rowActionMenu">
        ${options.map(opt => `
          <div class="rowActionItem ${opt.toLowerCase().includes('delete') ? 'rowActionItem--danger' : ''}" data-action="${opt.toLowerCase().replace(/\s+/g, '-')}">${opt}</div>
        `).join('')}
      </div>
    </div>
  `;
}

function showSuccessToast(message = "Submitted Successfully") {
  const { toastRoot } = ensureRoots();
  if (!toastRoot) return;

  toastRoot.innerHTML = `
    <div class="toast toast--success" role="status" aria-live="polite">
      <div class="toast__title">
        <span class="toast__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#12B76A" stroke-width="2" />
            <path d="M8.2 12.3l2.4 2.4 5.2-5.2" stroke="#12B76A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span>${escapeHtml(message)}</span>
      </div>
      <button class="toast__close" type="button" aria-label="Close">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#667085" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  `;

  const closeBtn = toastRoot.querySelector(".toast__close");
  const timer = window.setTimeout(() => toastRoot.replaceChildren(), 2600);
  closeBtn?.addEventListener("click", () => {
    window.clearTimeout(timer);
    toastRoot.replaceChildren();
  });
}

function openModal(html) {
  const { modalRoot } = ensureRoots();
  if (!modalRoot) return;

  modalRoot.innerHTML = `
    <div class="modalOverlay" role="dialog" aria-modal="true">
      <div class="modalCard">
        ${html}
      </div>
    </div>
  `;

  const overlay = modalRoot.querySelector(".modalOverlay");
  const closeEls = modalRoot.querySelectorAll("[data-modal-close]");
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  closeEls.forEach((el) => el.addEventListener("click", closeModal));

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") closeModal();
    },
    { once: true }
  );
}

function openDrawer(html) {
  const { modalRoot } = ensureRoots();
  if (!modalRoot) return;

  modalRoot.innerHTML = `
    <div class="drawerOverlay" role="dialog" aria-modal="true">
      <div class="drawerCard">
        ${html}
      </div>
    </div>
  `;

  const overlay = modalRoot.querySelector(".drawerOverlay");
  const closeEls = modalRoot.querySelectorAll("[data-modal-close]");
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  closeEls.forEach((el) => el.addEventListener("click", closeModal));

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") closeModal();
    },
    { once: true }
  );
}

function closeModal() {
  const { modalRoot } = ensureRoots();
  modalRoot?.replaceChildren();
}

/**
 * Removes a table row and optionally toggles empty state if table is empty
 */
function deleteRow(el, emptyId, filledId) {
  const row = el.closest(".dataTable__row");
  const table = row?.parentElement;
  if (row) row.remove();
  
  // If table has only the header left (or no rows), show empty state
  if (table && table.querySelectorAll(".dataTable__row").length === 0) {
    const empty = document.getElementById(emptyId);
    const filled = document.getElementById(filledId);
    if (empty && filled) {
      empty.classList.remove("isHidden");
      filled.classList.add("isHidden");
    }
  }
}

/**
 * PREMIUM MODALS & TOASTS (Figma Sync)
 */

/**
 * Opens a premium modal with either centered or right-aligned (drawer) layout
 */
function openPremiumModal(html, { isDrawer = false } = {}) {
  const { modalRoot } = ensureRoots();
  if (!modalRoot) return;

  const overlayClass = isDrawer ? "premiumModalOverlay premiumModalOverlay--right" : "premiumModalOverlay";
  const cardClass = isDrawer ? "premiumModalCard premiumModalCard--drawer" : "premiumModalCard";

  modalRoot.innerHTML = `
    <div class="${overlayClass}">
      <div class="${cardClass}">
        ${html}
      </div>
    </div>
  `;

  // Close on overlay click
  const overlay = modalRoot.querySelector(".premiumModalOverlay");
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closePremiumModal();
  });

  // Close on data-premium-modal-close
  modalRoot.querySelectorAll("[data-premium-modal-close]").forEach(btn => {
    btn.addEventListener("click", closePremiumModal);
  });
}

function closePremiumModal() {
  const { modalRoot } = ensureRoots();
  modalRoot?.replaceChildren();
}

/**
 * Opens the high-fidelity Item Details modal (Right Aligned)
 */
function openViewItemModal(data) {
  const { 
    name = "Indomie | Noodles 20X45g | Carton",
    points = "100PT",
    image = "https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=400",
    description = "A product of Dufil Prima Foods"
  } = data || {};

  openPremiumModal(`
    <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
      <button class="modalHeader__close" type="button" data-premium-modal-close aria-label="Close">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#667085" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
    
    <div class="itemDetailHero">
      <div class="itemDetailTitleRow">
        <div class="itemDetailTitle">${name}</div>
        <div class="itemDetailBadge">${points}</div>
      </div>
      <img src="${image}" alt="${name}" class="itemDetailImage" />
    </div>

    <div class="itemDetailSection">
      <div class="itemDetailLabel">Description:</div>
      <div class="itemDetailText">${description}</div>
    </div>

    <div class="itemModalFooter">
      <button class="secondaryButton" type="button" style="width: 100%; height: 48px;">Edit</button>
      <div class="itemModalSplit">
        <button class="secondaryButton" type="button" style="height: 44px; font-size: 14px;">Deactivate</button>
        <button class="secondaryButton" type="button" style="height: 44px; font-size: 14px; background: #FEF3F2; border-color: #FDA29B; color: #D92D20;">Delete Item</button>
      </div>
    </div>
  `, { isDrawer: true });
}

/**
 * Opens the premium Delete Confirmation modal (Centered)
 */
function openDeleteConfirmModal({ title = "Delete Item", message = "Are you sure you want to delete this item?", onConfirm }) {
  openPremiumModal(`
    <div class="confirmIconWrap">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <div class="confirmTitle">${title}</div>
    <div class="confirmText">${message}</div>
    <div class="confirmActions">
      <button class="secondaryButton" type="button" data-premium-modal-close>No, I Don't</button>
      <button class="authButton" type="button" id="confirmYesBtn" style="background: #00002A; border-color: #00002A; color: #fff;">Yes, I Do</button>
    </div>
  `);

  document.getElementById("confirmYesBtn")?.addEventListener("click", () => {
    onConfirm?.();
    closePremiumModal();
  });
}

/**
 * Shows a pill-shaped toast notification
 */
function showToast(message, type = "success") {
  const container = document.querySelector(".toastContainer") || (() => {
    const c = document.createElement("div");
    c.className = "toastContainer";
    document.body.appendChild(c);
    return c;
  })();

  const toast = document.createElement("div");
  toast.className = "toast";
  
  const icon = type === "success" 
    ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" /></svg>`
    : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" /></svg>`;

  toast.innerHTML = `
    <div class="toastIcon">${icon}</div>
    <div class="toastText">${message}</div>
    <button class="toastClose" aria-label="Close">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#667085" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" /></svg>
    </button>
  `;

  container.appendChild(toast);

  const closeItems = () => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector(".toastClose").onclick = closeItems;
  setTimeout(closeItems, 4000);
}

function openAddSessionModal({ onSubmit } = {}) {
  openModal(`
    <header class="modalHeader">
      <div class="modalHeader__titleRow">
        <span class="modalHeader__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M8 4h8a2 2 0 012 2v14l-6-3-6 3V6a2 2 0 012-2z" stroke="#667085" stroke-width="1.8" stroke-linejoin="round" />
            <path d="M9 8h6M9 12h6" stroke="#667085" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </span>
        <div class="modalHeader__titles">
          <div class="modalHeader__title">Add New Session</div>
        </div>
        <button class="modalHeader__close" type="button" data-modal-close aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#667085" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="modalHeader__desc">Provide the session details below.</div>
    </header>

    <form class="modalBody" id="addSessionForm" novalidate>
      <label class="field">
        <span class="field__label">Session Name</span>
        <input class="field__input" name="sessionName" placeholder="e.g End of year" required />
      </label>

      <div class="modalGrid2">
        <label class="field">
          <span class="field__label">Start Date</span>
          <div class="field__inputWrap">
            <input class="field__input field__input--withIcon" name="startDate" placeholder="DD/MM/YYYY" required />
            <span class="field__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M7 3v3M17 3v3M4 9h16" stroke="#667085" stroke-width="2" stroke-linecap="round" />
                <path d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#667085" stroke-width="2" />
              </svg>
            </span>
          </div>
        </label>

        <label class="field">
          <span class="field__label">End Date</span>
          <div class="field__inputWrap">
            <input class="field__input field__input--withIcon" name="endDate" placeholder="DD/MM/YYYY" required />
            <span class="field__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M7 3v3M17 3v3M4 9h16" stroke="#667085" stroke-width="2" stroke-linecap="round" />
                <path d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#667085" stroke-width="2" />
              </svg>
            </span>
          </div>
        </label>
      </div>

      <div class="modalActions">
        <button class="secondaryButton" type="button" data-modal-close>Cancel</button>
        <button class="authButton" id="modalSubmit" type="submit" disabled>Submit</button>
      </div>
    </form>
  `);

  const form = document.getElementById("addSessionForm");
  const submit = document.getElementById("modalSubmit");
  const requiredInputs = form?.querySelectorAll("input[required]") ?? [];

  function sync() {
    const ok = Array.from(requiredInputs).every((i) => i.value.trim().length > 0);
    if (submit) submit.disabled = !ok;
  }

  requiredInputs.forEach((i) => i.addEventListener("input", sync));
  sync();

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    sync();
    if (submit?.disabled) return;
    onSubmit?.(Object.fromEntries(new FormData(form)));
    closeModal();
  });

  setTimeout(() => {
    initCustomDatePicker();
  }, 0);
}

function openUploadBulkModal({ onSubmit } = {}) {
  openModal(`
    <header class="modalHeader">
      <div class="modalHeader__titleRow">
        <span class="modalHeader__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" stroke="#667085" stroke-width="2" stroke-linecap="round" />
          </svg>
        </span>
        <div class="modalHeader__titles">
          <div class="modalHeader__title">Upload Bulk</div>
        </div>
        <button class="modalHeader__close" type="button" data-modal-close aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#667085" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="modalHeader__desc">Upload the file below</div>
    </header>

    <form class="modalBody" id="uploadBulkForm" novalidate>
      <button class="fileDrop" type="button" id="fileDropBtn">
        <span class="fileDrop__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
            <path d="M7 16a4 4 0 010-8 5 5 0 019.7 1.3A3.5 3.5 0 1117 16" stroke="#667085" stroke-width="1.8" stroke-linecap="round" />
            <path d="M12 12v7m0-7l-3 3m3-3l3 3" stroke="#667085" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="fileDrop__text">
          <span>Drag your file here, or <span class="fileDrop__browse">browse</span></span>
          <span class="fileDrop__sub">supports: CSV, XLSX</span>
        </span>
      </button>

      <div class="fileHelp">
        <span class="fileHelp__muted">Need help with format?</span>
        <a class="fileHelp__link" href="#" role="button">Download a sample file ↓</a>
      </div>

      <div class="modalActions">
        <button class="secondaryButton" type="button" data-modal-close>Cancel</button>
        <button class="authButton" id="uploadSubmit" type="submit" disabled>Submit</button>
      </div>
    </form>
  `);

  const submit = document.getElementById("uploadSubmit");
  const form = document.getElementById("uploadBulkForm");
  const drop = document.getElementById("fileDropBtn");
  let hasFile = false;

  function sync() {
    if (submit) submit.disabled = !hasFile;
  }

  drop?.addEventListener("click", () => {
    // Demo: simulate a chosen file
    hasFile = true;
    drop.classList.add("fileDrop--selected");
    sync();
  });

  sync();
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    sync();
    if (submit?.disabled) return;
    onSubmit?.();
    closeModal();
  });
}

function openAddSingleUserModal({ onSubmit } = {}) {
  openModal(`
    <header class="modalHeader">
      <div class="modalHeader__titleRow">
        <span class="modalHeader__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 22V12h6v10" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <div class="modalHeader__titles">
          <div class="modalHeader__title">Add New User</div>
        </div>
        <button class="modalHeader__close" type="button" data-modal-close aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#667085" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="modalHeader__desc">Provide the new user details you would like to add below.</div>
    </header>

    <form class="modalBody" id="addSingleUserForm" novalidate>
      <div class="fieldGroup">
        <label class="field">
          <span class="field__label">User's Name</span>
          <input class="field__input" name="userName" placeholder="e.g James Oyeniyi" required />
        </label>
        <label class="field">
          <span class="field__label">User's Email</span>
          <input class="field__input" type="email" name="userEmail" placeholder="jamesomoniyi@mail.com" required />
        </label>
        <label class="field">
          <span class="field__label">User Type</span>
          <div class="field__inputWrap">
            <select class="field__input" name="userType" required style="appearance: none;">
              <option value="" disabled selected>Select An Option</option>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
            <span class="field__icon" style="pointer-events:none;" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
        </label>
        <label class="field">
          <span class="field__label">Grade Level</span>
          <div class="field__inputWrap">
            <select class="field__input" name="gradeLevel" required style="appearance: none;">
              <option value="" disabled selected>Select An Option</option>
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="Level 3">Level 3</option>
            </select>
            <span class="field__icon" style="pointer-events:none;" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
        </label>
      </div>

      <div class="modalActions" style="justify-content: center; gap: 12px; margin-top: 24px;">
        <button class="secondaryButton" type="button" data-modal-close style="flex:1;">Cancel</button>
        <button class="authButton" id="userSubmitBtn" type="submit" disabled style="flex:1; background-color: #00002A; border-color: #00002A; color: #fff;">Create New</button>
      </div>
    </form>
  `);

  const form = document.getElementById("addSingleUserForm");
  const submit = document.getElementById("userSubmitBtn");
  const inputs = form?.querySelectorAll("input[required], select[required]") ?? [];

  function sync() {
    const ok = Array.from(inputs).every((i) => i.value.trim().length > 0);
    if (!submit) return;
    submit.disabled = !ok;
    submit.style.backgroundColor = ok ? "#00002A" : "#d5d7da";
    submit.style.borderColor = ok ? "#00002A" : "#d5d7da";
  }

  inputs.forEach((i) => {
    i.addEventListener("input", sync);
    i.addEventListener("change", sync);
  });
  sync();

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    sync();
    if (submit?.disabled) return;
    onSubmit?.(Object.fromEntries(new FormData(form)));
    closeModal();
  });
}

function openAddSingleItemModal({ onSubmit } = {}) {
  openModal(`
    <header class="modalHeader">
      <div class="modalHeader__titleRow">
        <span class="modalHeader__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 22V12h6v10" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <div class="modalHeader__titles">
          <div class="modalHeader__title">Add New Item</div>
        </div>
        <button class="modalHeader__close" type="button" data-modal-close aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#667085" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="modalHeader__desc">Share the item details you would like to list below.</div>
    </header>

    <form class="modalBody" id="addSingleItemForm" novalidate>
      <div class="fieldGroup">
        <label class="field">
          <span class="field__label">Upload Image (Optional)</span>
          <div class="imageUploadBox" id="imageUploadBox" style="width: 80px; height: 80px; border: 1px solid #EAECF0; border-radius: 8px; display: grid; place-items: center; cursor: pointer; position: relative;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" class="imageUploadIcon">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#475467" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div id="imagePreview" style="position: absolute; inset: 0; background-size: cover; background-position: center; border-radius: 8px; display: none;"></div>
            <div style="position: absolute; bottom: -8px; right: -8px; width: 24px; height: 24px; background: white; border: 1px solid #EAECF0; border-radius: 50%; display: grid; place-items: center; z-index: 2; box-shadow: 0 1px 2px rgba(16,24,40,0.05);">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M12 5v14m-7-7h14" stroke="#475467" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
          </div>
        </label>
        <label class="field">
          <span class="field__label">Item Name</span>
          <input class="field__input" name="itemName" placeholder="e.g Noodles 20X45g" required />
        </label>
        <label class="field">
          <span class="field__label">Brand Name</span>
          <input class="field__input" name="brandName" placeholder="e.g Indomie" required />
        </label>
        <label class="field">
          <span class="field__label">Unit of Measurement</span>
          <div class="field__inputWrap">
            <select class="field__input" name="unit" required style="appearance: none;">
              <option value="" disabled selected>Select an option</option>
              <option value="Carton">Carton</option>
              <option value="Pack">Pack</option>
              <option value="Pieces">Pieces</option>
            </select>
            <span class="field__icon" style="pointer-events:none;" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
        </label>
        <label class="field">
          <span class="field__label">Item Description (Optional)</span>
          <input class="field__input" name="itemDesc" placeholder="e.g 200" />
        </label>

        <div style="display: flex; gap: 16px; align-items: center; margin-top: 8px;">
          <label class="field" style="flex: 1;">
            <span class="field__label">Amount In Naira</span>
            <input class="field__input" name="amountNaira" placeholder="e.g 200" type="number" required />
          </label>
          <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; border: 1px solid #EAECF0; margin-top: 24px;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path d="M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4-4m-4 4l4 4" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <label class="field" style="flex: 1;">
            <span class="field__label">Amount In points</span>
            <div class="field__inputWrap">
              <input class="field__input" name="amountPoints" placeholder="0" type="number" readonly style="background: #F9FAFB; cursor: default;" />
              <span class="field__icon" style="font-size: 14px; font-weight: 500; color: #475467; right: 16px; width: auto;">PT</span>
            </div>
          </label>
        </div>
      </div>

      <div class="modalActions" style="justify-content: center; gap: 12px; margin-top: 24px;">
        <button class="secondaryButton" type="button" data-modal-close style="flex:1;">Cancel</button>
        <button class="authButton" id="itemSubmitBtn" type="submit" disabled style="flex:1; background-color: #00002A; border-color: #00002A; color: #fff;">Submit</button>
      </div>
    </form>
  `);

  const form = document.getElementById("addSingleItemForm");
  const submit = document.getElementById("itemSubmitBtn");
  const inputs = form?.querySelectorAll("input[required], select[required]") ?? [];
  const imageUploadBox = document.getElementById("imageUploadBox");
  const imagePreview = document.getElementById("imagePreview");
  const imageUploadIcon = document.querySelector(".imageUploadIcon");

  // Fake image upload
  imageUploadBox?.addEventListener("click", () => {
    if (imagePreview) {
      imagePreview.style.display = "block";
      imagePreview.style.backgroundImage = "url('https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=150&h=150')";
      if (imageUploadIcon) imageUploadIcon.style.display = "none";
    }
  });

  function sync() {
    const ok = Array.from(inputs).every((i) => i.value.trim().length > 0);
    if (!submit) return;
    submit.disabled = !ok;
    submit.style.backgroundColor = ok ? "#00002A" : "#d5d7da";
    submit.style.borderColor = ok ? "#00002A" : "#d5d7da";
  }

  inputs.forEach((i) => {
    i.addEventListener("input", sync);
    i.addEventListener("change", sync);
  });

  // Auto-compute points from naira using the saved point config
  const nairaInput = form?.querySelector('[name="amountNaira"]');
  const pointsInput = form?.querySelector('[name="amountPoints"]');
  nairaInput?.addEventListener('input', () => {
    if (pointsInput) {
      pointsInput.value = Store.nairaToPoints(parseFloat(nairaInput.value) || 0);
    }
  });

  sync();

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    sync();
    if (submit?.disabled) return;
    onSubmit?.(Object.fromEntries(new FormData(form)));
    closeModal();
  });
}

function openOrderDetailsDrawer() {
  openDrawer(`
    <header class="drawerHeader">
      <div class="drawerHeader__row">
        <div class="drawerHeader__title">Order Details</div>
        <button class="drawerHeader__close" type="button" data-modal-close aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#667085" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </header>

    <div class="drawerBody">
      <div class="drawerUser">
        <div class="drawerUser__label">User’s Name</div>
        <div class="drawerUser__name">Jide Oyeniyi</div>
      </div>

      <div class="drawerItems">
        <div class="drawerItem">
          <div class="drawerItem__thumb" aria-hidden="true"></div>
          <div class="drawerItem__info">
            <div class="drawerItem__title">Mama-Cinamon Pancake and creams with crunches</div>
            <div class="drawerItem__sub">4 - Pieces</div>
          </div>
          <div class="drawerItem__pts">30PT</div>
        </div>
        <div class="drawerItem">
          <div class="drawerItem__thumb" aria-hidden="true"></div>
          <div class="drawerItem__info">
            <div class="drawerItem__title">A-Cherry Healthy | berry</div>
            <div class="drawerItem__sub">2 - Cartons</div>
          </div>
          <div class="drawerItem__pts">30PT</div>
        </div>
        <div class="drawerItem">
          <div class="drawerItem__thumb" aria-hidden="true"></div>
          <div class="drawerItem__info">
            <div class="drawerItem__title">Doritos Velps</div>
            <div class="drawerItem__sub">1 - Rows</div>
          </div>
          <div class="drawerItem__pts">40PT</div>
        </div>
      </div>

      <div class="drawerTotal">
        <div class="drawerTotal__row">
          <div class="drawerTotal__label">Total</div>
          <div class="drawerTotal__value">100PT</div>
        </div>
      </div>
    </div>

    <footer class="drawerFooter">
      <button class="drawerDanger" type="button" data-modal-close>Cancel Order</button>
    </footer>
  `);
}

function openGradeSettingsModal({ onSubmit } = {}) {
  openModal(`
    <header class="modalHeader">
      <div class="modalHeader__titleRow">
        <span class="modalHeader__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M12 3l10 7-10 7L2 10l10-7z" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 14l10 7 10-7" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <div class="modalHeader__titles">
          <div class="modalHeader__title">Grade Level Configuration</div>
        </div>
        <button class="modalHeader__close" type="button" data-modal-close aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#667085" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="modalHeader__desc">Set up the grade levels and assigned points.</div>
    </header>

    <form class="modalBody" id="gradeSettingsForm" novalidate>
      <div id="gradeList" style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Rows will be injected here -->
      </div>
      
      <div>
        <button type="button" class="addGradeBtn" id="addGradeBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Grade Level
        </button>
      </div>

      <div class="modalActions">
        <button class="secondaryButton" type="button" data-modal-close>Cancel</button>
        <button class="authButton" id="modalSubmit" type="submit" disabled>Submit</button>
      </div>
    </form>
  `);

  const gradeList = document.getElementById("gradeList");
  const addGradeBtn = document.getElementById("addGradeBtn");
  const submit = document.getElementById("modalSubmit");
  const form = document.getElementById("gradeSettingsForm");

  let rowIdCounter = 0;

  function createRow(gradeName = "", points = "") {
    const id = rowIdCounter++;
    const row = document.createElement("div");
    row.className = "gradeRow";
    row.dataset.id = id;
    row.innerHTML = `
      <label class="field">
        <span class="field__label">Grade Label</span>
        <input class="field__input" name="gradeName_${id}" value="${escapeHtml(gradeName)}" placeholder="e.g Level 1" required />
      </label>
      <label class="field">
        <span class="field__label">Points</span>
        <div class="field__inputWrap">
          <input class="field__input field__input--withIcon" name="gradePoints_${id}" type="number" min="0" value="${escapeHtml(points)}" placeholder="0" required />
          <span class="field__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#667085" stroke-width="1.8"/>
              <path d="M9 12l2 2 4-4" stroke="#667085" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
      </label>
      <div style="padding-top: 26px;">
        <button class="gradeRemoveBtn" type="button" aria-label="Remove grade" data-remove-id="${id}">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </button>
      </div>
    `;

    // Removing row
    const removeBtn = row.querySelector('[data-remove-id]');
    removeBtn.addEventListener("click", () => {
      // Don't remove if it's the only row
      if (gradeList.children.length > 1) {
        row.remove();
        sync();
      }
    });

    // Sync on input
    const inputs = row.querySelectorAll("input");
    inputs.forEach((i) => i.addEventListener("input", sync));

    return row;
  }

  function sync() {
    const inputs = Array.from(gradeList.querySelectorAll("input[required]"));
    const ok = inputs.length > 0 && inputs.every((i) => i.value.trim().length > 0);
    
    // Disable remove buttons if there's only 1 row
    const removeBtns = gradeList.querySelectorAll('.gradeRemoveBtn');
    removeBtns.forEach(btn => {
      btn.style.opacity = removeBtns.length <= 1 ? "0.4" : "1";
      btn.style.cursor = removeBtns.length <= 1 ? "not-allowed" : "pointer";
    });

    if (submit) submit.disabled = !ok;
  }

  // Initialize with one empty row
  gradeList.appendChild(createRow('1', '8'));
  sync();

  addGradeBtn?.addEventListener("click", () => {
    gradeList.appendChild(createRow());
    sync();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    sync();
    if (submit?.disabled) return;
    
    const formData = new FormData(form);
    const data = {};
    const grades = [];
    
    const rowDivs = gradeList.querySelectorAll('.gradeRow');
    rowDivs.forEach(row => {
      const id = row.dataset.id;
      grades.push({
        name: formData.get(`gradeName_${id}`),
        points: formData.get(`gradePoints_${id}`)
      });
    });

    if(onSubmit) onSubmit(grades);
    
    // Default show success toast since this is frontend-only
    showSuccessToast("Grade settings updated");
    closeModal();
  });
}

function openPointConfigModal({ onSubmit } = {}) {
  openModal(`
    <header class="modalHeader">
      <div class="modalHeader__titleRow">
        <span class="modalHeader__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <div class="modalHeader__titles">
          <div class="modalHeader__title">Point Configuration</div>
        </div>
        <button class="modalHeader__close" type="button" data-modal-close aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#667085" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="modalHeader__desc">Set the rate for your desired point value.</div>
    </header>

    <form class="modalBody" id="pointConfigForm" novalidate>
      <div class="pointGrid">
        <label class="field">
          <span class="field__label">Amount In Naira</span>
          <input class="field__input" name="amountNaira" id="amountNaira" type="number" min="1" value="200" placeholder="e.g 200" required />
        </label>
        
        <div class="exchangeIcon">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 3h5v5"></path>
            <path d="M4 20L21 3"></path>
            <path d="M21 16v5h-5"></path>
            <path d="M15 15l6 6"></path>
            <path d="M4 4l5 5"></path>
          </svg>
        </div>
        
        <label class="field">
          <span class="field__label">Amount In points</span>
          <input class="field__input" name="amountPoints" id="amountPoints" type="number" min="1" value="1" placeholder="e.g 1" required />
        </label>
      </div>
      
      <div class="pointSummaryBox">
        <p class="pointSummaryBox__text" id="pointSummaryText">Every ₦200 is equivalent to 1PT</p>
      </div>

      <div class="modalActions" style="margin-top: 32px">
        <button class="secondaryButton" type="button" data-modal-close>Cancel</button>
        <button class="authButton" id="modalSubmit" type="submit">Submit</button>
      </div>
    </form>
  `);

  const form = document.getElementById("pointConfigForm");
  const submit = document.getElementById("modalSubmit");
  const inputNaira = document.getElementById("amountNaira");
  const inputPoints = document.getElementById("amountPoints");
  const summaryText = document.getElementById("pointSummaryText");

  function sync() {
    const nairaVal = inputNaira.value.trim();
    const pointsVal = inputPoints.value.trim();
    
    if (nairaVal && pointsVal) {
      summaryText.textContent = `Every ₦${nairaVal} is equivalent to ${pointsVal}PT`;
    } else {
      summaryText.textContent = `Waiting for values...`;
    }

    const ok = nairaVal.length > 0 && pointsVal.length > 0 && Number(nairaVal) > 0 && Number(pointsVal) > 0;
    if (submit) submit.disabled = !ok;
  }

  inputNaira.addEventListener("input", sync);
  inputPoints.addEventListener("input", sync);
  sync();

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    sync();
    if (submit?.disabled) return;
    
    if(onSubmit) onSubmit({ naira: inputNaira.value, points: inputPoints.value });
    localStorage.setItem('pointConfig', JSON.stringify({ nairaPerPt: parseFloat(inputNaira.value) }));
    
    showSuccessToast("Point Configuration updated");
    closeModal();
  });
}

// Global initialization for inputs with custom date picker
function initCustomDatePicker() {
    const inputs = document.querySelectorAll('input[name="startDate"], input[name="endDate"]');
    
    inputs.forEach(input => {
        if (input.dataset.datepickerInitialized) return;
        input.dataset.datepickerInitialized = true;
        
        input.readOnly = true;
        input.style.cursor = 'pointer';
        
        const wrapper = input.closest('.field__inputWrap');
        if (!wrapper) return;
        
        wrapper.style.position = 'relative';
        
        const dropdown = document.createElement('div');
        dropdown.className = 'date-picker-dropdown';
        wrapper.appendChild(dropdown);
        
        let currentDate = new Date();
        let selectedDate = null;
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        function renderCalendar() {
            dropdown.innerHTML = '';
            
            const header = document.createElement('div');
            header.className = 'date-picker-header';
            
            const monthText = document.createElement('div');
            monthText.className = 'date-picker-month';
            
            const mSelect = document.createElement('select');
            monthNames.forEach((m, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.textContent = m;
                if (idx === currentDate.getMonth()) opt.selected = true;
                mSelect.appendChild(opt);
            });
            mSelect.onchange = (e) => { currentDate.setMonth(e.target.value); renderCalendar(); };
            
            const ySelect = document.createElement('select');
            const currentYear = new Date().getFullYear();
            for (let y = currentYear - 10; y <= currentYear + 10; y++) {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                if (y === currentDate.getFullYear()) opt.selected = true;
                ySelect.appendChild(opt);
            }
            ySelect.onchange = (e) => { currentDate.setFullYear(e.target.value); renderCalendar(); };
            
            monthText.appendChild(mSelect);
            monthText.appendChild(ySelect);
            
            const nav = document.createElement('div');
            nav.className = 'date-picker-nav';
            
            const prevBtn = document.createElement('button');
            prevBtn.type = 'button';
            prevBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
            prevBtn.onclick = (e) => { e.stopPropagation(); currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
            
            const nextBtn = document.createElement('button');
            nextBtn.type = 'button';
            nextBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
            nextBtn.onclick = (e) => { e.stopPropagation(); currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
            
            nav.appendChild(prevBtn);
            nav.appendChild(nextBtn);
            header.appendChild(monthText);
            header.appendChild(nav);
            dropdown.appendChild(header);
            
            const grid = document.createElement('div');
            grid.className = 'date-picker-grid';
            
            const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
            days.forEach(d => {
                const dayHead = document.createElement('div');
                dayHead.className = 'date-picker-day-header';
                dayHead.textContent = d;
                grid.appendChild(dayHead);
            });
            
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            
            let startOffset = firstDay === 0 ? 6 : firstDay - 1;
            let tempSelectedDate = selectedDate;
            
            for (let i = startOffset - 1; i >= 0; i--) {
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'date-picker-cell';
                cell.disabled = true;
                cell.textContent = daysInPrevMonth - i;
                grid.appendChild(cell);
            }
            
            for (let i = 1; i <= daysInMonth; i++) {
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'date-picker-cell';
                cell.textContent = i;
                
                if (tempSelectedDate && tempSelectedDate.getDate() === i && tempSelectedDate.getMonth() === month && tempSelectedDate.getFullYear() === year) {
                    cell.classList.add('selected');
                }
                
                cell.onclick = (e) => {
                    e.stopPropagation();
                    tempSelectedDate = new Date(year, month, i);
                    // Instantly reflect on input
                    selectedDate = tempSelectedDate;
                    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
                    const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    input.value = `${dayStr}/${monthStr}/${selectedDate.getFullYear()}`;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    // Close dropdown automatically upon selection
                    dropdown.classList.remove('active');
                    renderCalendar(); // Re-render mainly for internal state if needed
                };
                grid.appendChild(cell);
            }
            
            const totalCells = startOffset + daysInMonth;
            const remainingCells = Math.ceil(totalCells / 7) * 7 - totalCells;
            for(let i=1; i<=remainingCells; i++) {
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'date-picker-cell';
                cell.disabled = true;
                cell.textContent = i;
                grid.appendChild(cell);
            }
            
            dropdown.appendChild(grid);
            
            // Actions row removed as selection is now instant and automatic
        }
        
        wrapper.onclick = (e) => {
            if(dropdown.classList.contains('active') && !dropdown.contains(e.target) && e.target !== input && !e.target.closest('.field__icon')) {
                 // clicking wrapper outside dropdown
            } else if (!dropdown.classList.contains('active') && (e.target === input || e.target.closest('.field__icon'))) {
                const val = input.value.split('/');
                if(val.length === 3) {
                    selectedDate = new Date(`${val[2]}-${val[1]}-${val[0]}`);
                    currentDate = new Date(selectedDate);
                } else {
                    currentDate = new Date();
                }
                document.querySelectorAll('.date-picker-dropdown.active').forEach(d => d.classList.remove('active'));
                renderCalendar();
                dropdown.classList.add('active');
            }
        };
        
        dropdown.onclick = (e) => e.stopPropagation();
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.field__inputWrap')) {
        document.querySelectorAll('.date-picker-dropdown.active').forEach(d => {
            d.classList.remove('active');
        });
    }
});

/* ============================================================
   ONBOARDING MULTI-STEP MODAL
   Steps: 0 = Welcome, 1 = Point Config, 2 = Grade Levels
   ============================================================ */
(function initOnboarding() {
  // Store data across steps
  const state = {
    nairaPerPt: '',
    grades: [{ level: 'Level 1', points: '' }]
  };

  /* ---- DOM helpers ---- */
  function getOverlay() { return document.getElementById('ob-overlay'); }

  function showOverlay(html) {
    let overlay = getOverlay();
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ob-overlay';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = html;
    overlay.className = 'ob-overlay';
  }

  function hideOnboarding() {
    const overlay = getOverlay();
    if (overlay) overlay.remove();
  }

  function markComplete() {
    localStorage.setItem('onboardingComplete', '1');
    // Dispatch event so the dashboard can react
    document.dispatchEvent(new CustomEvent('onboardingComplete', { detail: state }));
  }

  /* ---- Progress dots ---- */
  function dotsHTML(active) {
    return `<div class="ob-progress">
      ${[0,1,2].map(i => `<div class="ob-dot${i === active ? ' active' : ''}"></div>`).join('')}
    </div>`;
  }

  // Define global openers for "Edit" buttons
  window.openPointConfigModal = () => showPointConfig(true);
  window.openGradeSettingsModal = () => showGradeLevels(true);

  /* ===========================
     STEP 0 — Welcome
  =========================== */
  function showWelcome() {
    const html = `
      <div class="ob-card ob-card--welcome">
        <button class="ob-close-btn" id="ob-welcome-close" type="button" aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="ob-banner">
          <div class="ob-banner-inner">
            <div class="ob-banner-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z"/>
                <path stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <div class="ob-banner-label">3LINE STORE</div>
          </div>
        </div>

        <div class="ob-header" style="align-items:center">
          <h2 class="ob-title">Welcome to 3Line Store</h2>
          <p class="ob-description">Welcome to the 3Line Store! We're excited to help you get started. To make the setup process smoother, we encourage you to take a guided set up process.</p>
        </div>

        ${dotsHTML(0)}

        <div class="ob-actions">
          <button class="ob-btn ob-btn--secondary" id="ob-skip-btn" type="button">Skip</button>
          <button class="ob-btn ob-btn--primary" id="ob-start-btn" type="button">Start Set Up</button>
        </div>
      </div>
    `;
    showOverlay(html);
    document.getElementById('ob-welcome-close').onclick = hideOnboarding;
    document.getElementById('ob-skip-btn').onclick = () => {
      markComplete();
      hideOnboarding();
    };
    document.getElementById('ob-start-btn').onclick = () => showPointConfig(false);
  }

  /* ===========================
     STEP 1 — Point Configuration
  =========================== */
  function showPointConfig(isEdit = false) {
    const html = `
      <div class="ob-card">
        <button class="ob-close-btn" id="ob-pc-close" type="button" aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="ob-header">
          <div style="display:flex;justify-content:space-between;align-items:center" class="${isEdit ? 'ob-hidden' : ''}">
            <span class="ob-step-indicator">Step 1 of 2</span>
          </div>
          <div class="ob-title-row">
            <svg class="ob-title-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                d="M7 16V8m0 0 3 3M7 8l-3 3m13 5V8m0 8-3-3m3 3 3-3"/>
            </svg>
            <h2 class="ob-title">Point Configuration</h2>
          </div>
          <p class="ob-description">Set the rate for your desired point value.</p>
        </div>

        <div class="${isEdit ? 'ob-hidden' : ''}">
          ${dotsHTML(1)}
        </div>

        <div class="ob-input-group">
          <div class="ob-input-row">
            <div class="ob-field">
              <label for="ob-naira">Amount in Naira</label>
              <input id="ob-naira" type="number" min="1" placeholder="e.g 200" value="${escapeHtml(state.nairaPerPt)}" />
            </div>
            <div class="ob-field ob-field-with-badge">
              <label>Amount in Points</label>
              <input id="ob-points-display" type="text" value="1" disabled />
              <span class="ob-pt-badge">PT</span>
            </div>
          </div>
          <div class="ob-hint" id="ob-hint">Enter an amount in Naira to see the conversion.</div>
        </div>

        <div class="ob-actions">
          <button class="ob-btn ob-btn--primary" id="ob-pc-submit" type="button" ${state.nairaPerPt ? '' : 'disabled'}>Submit</button>
        </div>
      </div>
    `;
    showOverlay(html);

    const nairaInput = document.getElementById('ob-naira');
    const hint = document.getElementById('ob-hint');
    const submitBtn = document.getElementById('ob-pc-submit');

    function updateHint() {
      const n = parseFloat(nairaInput.value);
      if (n > 0) {
        hint.textContent = `Every ₦${n.toLocaleString()} is equivalent to 1PT`;
        submitBtn.disabled = false;
        state.nairaPerPt = n;
      } else {
        hint.textContent = 'Enter an amount in Naira to see the conversion.';
        submitBtn.disabled = true;
      }
    }

    if (state.nairaPerPt) updateHint();
    nairaInput.addEventListener('input', updateHint);

    document.getElementById('ob-pc-close').onclick = () => {
      hideOnboarding();
      if (!isEdit) markComplete();
    };

    document.getElementById('ob-pc-submit').onclick = () => {
      state.nairaPerPt = parseFloat(nairaInput.value);
      if (isEdit) {
         localStorage.setItem('pointConfig', JSON.stringify({ nairaPerPt: state.nairaPerPt }));
         hideOnboarding();
         refreshDashboardSettings();
         showSuccessToast('Point configuration updated.');
      } else {
         showGradeLevels(false);
      }
    };
  }

  /* ===========================
     STEP 2 — Grade Level Config
  =========================== */
  function gradeRowHTML(idx, grade) {
    return `
      <div class="ob-grade-row" data-idx="${idx}">
        <div class="ob-field">
          ${idx === 0 ? '<label>Grade Level <span style="color:#D92D20">*</span></label>' : ''}
          <input type="text" class="ob-gl-name" placeholder="e.g. Level ${idx + 1}" value="${escapeHtml(grade.level)}" />
        </div>
        <div class="ob-field ob-field-with-badge">
          ${idx === 0 ? '<label>Allocated Points <span style="color:#D92D20">*</span></label>' : ''}
          <input type="number" class="ob-gl-points" placeholder="e.g. 3000" min="1" value="${escapeHtml(grade.points)}" />
          <span class="ob-pt-badge">PT</span>
        </div>
        <button class="ob-remove-btn" data-remove="${idx}" type="button" aria-label="Remove row" ${state.grades.length === 1 ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#D92D20" stroke-width="2"/>
            <path stroke="#D92D20" stroke-width="2" stroke-linecap="round" d="M8 12h8"/>
          </svg>
        </button>
      </div>
    `;
  }

  function renderGrades() {
    const container = document.getElementById('ob-grade-rows');
    if (!container) return;
    container.innerHTML = state.grades.map((g, i) => gradeRowHTML(i, g)).join('');

    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.remove, 10);
        if (state.grades.length > 1) {
          state.grades.splice(idx, 1);
          renderGrades();
        }
      };
    });

    container.querySelectorAll('.ob-gl-name').forEach((input, i) => {
      input.oninput = () => { state.grades[i].level = input.value; };
    });
    container.querySelectorAll('.ob-gl-points').forEach((input, i) => {
      input.oninput = () => { state.grades[i].points = input.value; };
    });
  }

  function showGradeLevels(isEdit = false) {
    const html = `
      <div class="ob-card">
        <button class="ob-close-btn" id="ob-gl-close" type="button" aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="ob-header">
          <div style="display:flex;justify-content:space-between;align-items:center" class="${isEdit ? 'ob-hidden' : ''}">
            <span class="ob-step-indicator">Step 2 of 2</span>
          </div>
          <div class="ob-title-row">
            <svg class="ob-title-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                d="M2 8h20M2 12h20M2 16h20"/>
            </svg>
            <h2 class="ob-title">Grade Level Configuration</h2>
          </div>
          <p class="ob-description">Set up the grade levels and assigned points.</p>
        </div>

        <div class="${isEdit ? 'ob-hidden' : ''}">
          ${dotsHTML(2)}
        </div>

        <div class="ob-grades-container">
          <div id="ob-grade-rows"></div>
          <button class="ob-add-grade-btn" id="ob-add-grade" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 5v14M5 12h14"/>
            </svg>
            Add New Grade Level
          </button>
        </div>

        <div class="ob-actions">
          <button class="ob-btn ob-btn--secondary ${isEdit ? 'ob-hidden' : ''}" id="ob-gl-back" type="button">Back</button>
          <button class="ob-btn ob-btn--primary" id="ob-gl-submit" type="button">Submit</button>
        </div>
      </div>
    `;
    showOverlay(html);
    renderGrades();

    document.getElementById('ob-add-grade').onclick = () => {
      state.grades.push({ level: '', points: '' });
      renderGrades();
    };

    if (!isEdit) {
      document.getElementById('ob-gl-back').onclick = () => showPointConfig(false);
    }

    document.getElementById('ob-gl-close').onclick = () => {
      hideOnboarding();
      if (!isEdit) markComplete();
    };

    document.getElementById('ob-gl-submit').onclick = () => {
      localStorage.setItem('pointConfig', JSON.stringify({ nairaPerPt: state.nairaPerPt }));
      localStorage.setItem('gradeConfig', JSON.stringify(state.grades));
      hideOnboarding();
      if (!isEdit) markComplete();
      refreshDashboardSettings();
      showSuccessToast(isEdit ? 'Grade level configuration updated.' : 'Setup complete! Your store is ready.');
    };
  }

  /* ---- Auto-launch on first visit ---- */
  function checkAndLaunch() {
    if (!localStorage.getItem('onboardingComplete')) {
      showWelcome();
    }
  }

  // Export so other scripts can reset onboarding (e.g. for testing)
  window.showOnboarding = showWelcome;
  window.resetOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('pointConfig');
    localStorage.removeItem('gradeConfig');
    showWelcome();
  };

  // Launch after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkAndLaunch();
        refreshDashboardSettings();
    });
  } else {
    // Small defer so the dashboard shell renders first
    setTimeout(() => {
        checkAndLaunch();
        refreshDashboardSettings();
    }, 100);
  }
})();

/**
 * Syncs the dashboard setting cards with data from localStorage
 */
function refreshDashboardSettings() {
    const pointConfig = JSON.parse(localStorage.getItem('pointConfig') || '{}');
    const gradeConfig = JSON.parse(localStorage.getItem('gradeConfig') || '[]');

    const nairaValEl = document.getElementById('dash-naira-value');
    if (nairaValEl) {
        nairaValEl.textContent = pointConfig.nairaPerPt ? `₦${parseFloat(pointConfig.nairaPerPt).toLocaleString()}` : '₦-';
    }

    const gradeCountEl = document.getElementById('dash-grade-count');
    if (gradeCountEl) {
        gradeCountEl.textContent = gradeConfig.length || '0';
    }
}

// Listen for onboarding completion to refresh the UI
document.addEventListener('onboardingComplete', refreshDashboardSettings);
