// Core Application Logic for DBT Computer Repair System (Multi-Portal Auth Architecture)

let appState = {
  currentUser: null,
  users: [],
  tickets: [],
  selectedRoom: "121",
  filterStatus: "all",
  filterRoom: "all",
  filterUrgency: "all",
  searchQuery: "",
  uploadedImageBase64: ""
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initLucideIcons();
  setupEventListeners();
  setupFileUploadListeners();
  renderApp();
});

function loadState() {
  const savedState = localStorage.getItem("dbt_repair_app_clean_v1");
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      appState.tickets = parsed.tickets || [];
      appState.users = parsed.users || INITIAL_DATA.users;
      appState.currentUser = parsed.currentUser || null;
    } catch (e) {
      console.error("Error loading state", e);
      appState.tickets = [];
      appState.users = INITIAL_DATA.users;
      appState.currentUser = null;
    }
  } else {
    appState.tickets = [];
    appState.users = INITIAL_DATA.users;
    appState.currentUser = null;
    saveState();
  }
}

function saveState() {
  localStorage.setItem("dbt_repair_app_clean_v1", JSON.stringify({
    tickets: appState.tickets,
    users: appState.users,
    currentUser: appState.currentUser
  }));
}

function initLucideIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Master Render Controller
function renderApp() {
  const authContainer = document.getElementById("authScreen");
  const mainAppContainer = document.getElementById("mainAppScreen");
  const userPortalView = document.getElementById("userPortalView");
  const adminPortalView = document.getElementById("adminPortalView");

  if (!appState.currentUser) {
    if (authContainer) authContainer.classList.remove("hidden");
    if (mainAppContainer) mainAppContainer.classList.add("hidden");
    initLucideIcons();
    return;
  }

  if (authContainer) authContainer.classList.add("hidden");
  if (mainAppContainer) mainAppContainer.classList.remove("hidden");

  updateHeaderProfileInfo();

  const isUserAdmin = appState.currentUser.role === "admin";

  if (isUserAdmin) {
    userPortalView.classList.add("hidden");
    adminPortalView.classList.remove("hidden");
    renderAdminPortal();
  } else {
    adminPortalView.classList.add("hidden");
    userPortalView.classList.remove("hidden");
    renderUserPortal();
  }

  initLucideIcons();
}

// Header Profile Info
function updateHeaderProfileInfo() {
  const user = appState.currentUser;
  const badgeEl = document.getElementById("userRoleBadge");
  const nameEl = document.getElementById("userNameLabel");
  const avatarEl = document.getElementById("userAvatarImg");
  const deptEl = document.getElementById("userDeptLabel");

  if (nameEl) nameEl.textContent = user.name;
  if (deptEl) deptEl.textContent = user.department || user.email;
  if (avatarEl) avatarEl.src = user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  if (badgeEl) {
    if (user.role === "admin") {
      badgeEl.className = "px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1";
      badgeEl.innerHTML = `<i data-lucide="shield-check" class="w-3 h-3"></i> ADMIN / ช่างไอที`;
    } else if (user.userType === "teacher") {
      badgeEl.className = "px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1";
      badgeEl.innerHTML = `<i data-lucide="award" class="w-3 h-3"></i> 👨‍🏫 อาจารย์`;
    } else {
      badgeEl.className = "px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1";
      badgeEl.innerHTML = `<i data-lucide="graduation-cap" class="w-3 h-3"></i> 👨‍🎓 นักเรียน / นักศึกษา`;
    }
  }
}

// --- 1. USER PORTAL (หน้าสำหรับคนแจ้งซ่อม) ---
function renderUserPortal() {
  const user = appState.currentUser;
  const myTickets = appState.tickets.filter(t => t.reporterEmail === user.email || t.reporterName === user.name);

  const container = document.getElementById("userMyTicketsContainer");
  const emptyState = document.getElementById("userEmptyState");

  if (!container) return;

  if (myTickets.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
  } else {
    if (emptyState) emptyState.classList.add("hidden");
    container.innerHTML = myTickets.map(ticket => {
      const statusObj = INITIAL_DATA.statuses[ticket.status] || INITIAL_DATA.statuses.pending;
      const urgencyObj = INITIAL_DATA.urgencies[ticket.urgency] || INITIAL_DATA.urgencies.medium;

      return `
        <div class="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition-all space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">${ticket.id}</span>
              <span class="font-bold text-white text-base">ห้อง ${ticket.roomId} / ${ticket.pcNumber}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium border ${urgencyObj.color}">
                ความเร่งด่วน: ${urgencyObj.label}
              </span>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold border ${statusObj.bg}">
              ${statusObj.symbol} ${statusObj.label}
            </span>
          </div>

          <div class="space-y-2">
            <div class="text-sm font-semibold text-blue-400">[${ticket.categoryName}]</div>
            <p class="text-sm text-slate-200">${ticket.details}</p>

            ${ticket.imageUrl ? `
              <div class="mt-2">
                <img src="${ticket.imageUrl}" alt="ภาพประกอบอาการเสีย" class="h-32 object-cover rounded-xl border border-slate-700 shadow-md">
              </div>
            ` : ''}
          </div>

          ${ticket.replacedEquipment && ticket.replacedEquipment !== "-" ? `
            <div class="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200">
              <strong>🔩 อุปกรณ์ที่ถูกแก้ไข/เปลี่ยน:</strong> ${ticket.replacedEquipment}
            </div>
          ` : ''}

          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>🕒 แจ้งเมื่อ: ${ticket.createdAt}</span>
            <span>👷 ช่างผู้ดูแล: <strong class="text-slate-200">${ticket.assignedTech || 'รอช่างรับเรื่อง'}</strong></span>
            <button 
              onclick="openTicketDetailModal('${ticket.id}')"
              class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition-colors flex items-center gap-1 font-medium ml-auto"
            >
              <i data-lucide="clock" class="w-3.5 h-3.5"></i>
              ดู Timeline การซ่อม
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById("userStatPendingCount").textContent = myTickets.filter(t => t.status === "pending").length;
  document.getElementById("userStatInProgCount").textContent = myTickets.filter(t => t.status === "in_progress").length;
  document.getElementById("userStatDoneCount").textContent = myTickets.filter(t => t.status === "completed").length;

  initLucideIcons();
}

// --- 2. ADMIN PORTAL (หน้าระบบ Admin / ช่างซ่อม) ---
function renderAdminPortal() {
  renderDashboardCards();
  renderRoomTabs();
  renderPcGrid();
  renderTicketTable();
  renderAnalyticsSummary();

  setTimeout(() => {
    renderAnalyticsCharts(appState.tickets, INITIAL_DATA.rooms, INITIAL_DATA.categories, appState.users);
    initLucideIcons();
  }, 50);
}

function renderDashboardCards() {
  const tickets = appState.tickets;
  document.getElementById("statTotal").textContent = tickets.length;
  document.getElementById("statPending").textContent = tickets.filter(t => t.status === "pending").length;
  document.getElementById("statInProgress").textContent = tickets.filter(t => t.status === "in_progress").length;
  document.getElementById("statCompleted").textContent = tickets.filter(t => t.status === "completed").length;
  document.getElementById("statUrgent").textContent = tickets.filter(t => (t.urgency === "high" || t.urgency === "critical") && t.status !== "completed" && t.status !== "cancelled").length;
}

function renderRoomTabs() {
  const container = document.getElementById("roomTabsContainer");
  if (!container) return;

  container.innerHTML = INITIAL_DATA.rooms.map(room => {
    const isActive = room.id === appState.selectedRoom;
    const roomTickets = appState.tickets.filter(t => t.roomId === room.id && t.status !== "completed" && t.status !== "cancelled");
    const hasIssue = roomTickets.length > 0;

    return `
      <button 
        onclick="switchRoom('${room.id}')"
        class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${
          isActive 
            ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-900/20 font-bold' 
            : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }"
      >
        <span>ห้อง ${room.id}</span>
        ${hasIssue ? `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>` : ''}
        <span class="px-1.5 py-0.5 text-xs rounded-md ${isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-700/60 text-slate-400'}">
          ${room.totalPcs} เครื่อง
        </span>
      </button>
    `;
  }).join('');
}

function switchRoom(roomId) {
  appState.selectedRoom = roomId;
  renderRoomTabs();
  renderPcGrid();
}

function renderPcGrid() {
  const container = document.getElementById("pcGridContainer");
  const roomInfoEl = document.getElementById("currentRoomDescription");
  if (!container) return;

  const currentRoomObj = INITIAL_DATA.rooms.find(r => r.id === appState.selectedRoom) || INITIAL_DATA.rooms[0];
  if (roomInfoEl) {
    roomInfoEl.textContent = `${currentRoomObj.name} — ${currentRoomObj.description}`;
  }

  const roomTickets = appState.tickets.filter(t => t.roomId === appState.selectedRoom);
  const pcCount = currentRoomObj.totalPcs;

  let html = '';
  for (let i = 1; i <= pcCount; i++) {
    const pcNum = `PC-${i.toString().padStart(2, '0')}`;
    const activePcTickets = roomTickets.filter(t => t.pcNumber === pcNum && t.status !== "completed" && t.status !== "cancelled");
    const allPcTickets = roomTickets.filter(t => t.pcNumber === pcNum);
    
    let statusClass = "border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:border-emerald-400";
    let statusDot = "status-dot-emerald";
    let latestIssue = null;

    if (activePcTickets.length > 0) {
      latestIssue = activePcTickets[0];
      if (latestIssue.status === "pending") {
        statusClass = "border-amber-500/50 bg-amber-950/30 text-amber-300 hover:border-amber-400 glow-border-amber";
        statusDot = "status-dot-amber animate-pulse";
      } else if (latestIssue.status === "in_progress") {
        statusClass = "border-blue-500/50 bg-blue-950/30 text-blue-300 hover:border-blue-400 glow-border-blue";
        statusDot = "status-dot-blue animate-pulse";
      } else if (latestIssue.status === "external") {
        statusClass = "border-rose-500/50 bg-rose-950/30 text-rose-300 hover:border-rose-400";
        statusDot = "status-dot-red animate-pulse";
      }
    }

    html += `
      <div 
        onclick="openPcHistoryModal('${appState.selectedRoom}', '${pcNum}')"
        class="pc-node p-3.5 rounded-xl border ${statusClass} cursor-pointer relative group flex flex-col justify-between"
      >
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-bold text-sm tracking-wide flex items-center gap-1.5">
            <i data-lucide="monitor" class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"></i>
            ${pcNum}
          </span>
          <span class="${statusDot}"></span>
        </div>
        
        <div class="text-[11px] font-medium opacity-90 truncate">
          ${latestIssue ? `${latestIssue.categoryName}` : 'พร้อมใช้งาน'}
        </div>

        <div class="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
          <span>ประวัติ: ${allPcTickets.length} ครั้ง</span>
          <span class="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">รายละเอียด ➔</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  initLucideIcons();
}

function renderTicketTable() {
  const container = document.getElementById("ticketListContainer");
  if (!container) return;

  let filtered = appState.tickets.filter(t => {
    if (appState.filterStatus !== "all" && t.status !== appState.filterStatus) return false;
    if (appState.filterRoom !== "all" && t.roomId !== appState.filterRoom) return false;
    if (appState.filterUrgency !== "all" && t.urgency !== appState.filterUrgency) return false;
    if (appState.searchQuery) {
      const q = appState.searchQuery.toLowerCase();
      return t.id.toLowerCase().includes(q) ||
             t.pcNumber.toLowerCase().includes(q) ||
             t.details.toLowerCase().includes(q) ||
             t.reporterName.toLowerCase().includes(q) ||
             t.categoryName.toLowerCase().includes(q);
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-500">
        <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 stroke-1 opacity-50"></i>
        <p class="text-base font-medium text-slate-400">ยังไม่มีรายการแจ้งซ่อมในระบบ</p>
        <p class="text-xs text-slate-500 mt-1">เมื่อผู้ใช้งานส่งคำขอแจ้งซ่อม รายการจะแสดงที่นี่</p>
      </div>
    `;
    initLucideIcons();
    return;
  }

  container.innerHTML = filtered.map(ticket => {
    const statusObj = INITIAL_DATA.statuses[ticket.status] || INITIAL_DATA.statuses.pending;
    const urgencyObj = INITIAL_DATA.urgencies[ticket.urgency] || INITIAL_DATA.urgencies.medium;

    return `
      <div class="p-4 sm:p-5 rounded-2xl glass-card border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
            <i data-lucide="monitor" class="w-6 h-6 text-blue-400"></i>
          </div>
          
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">${ticket.id}</span>
              <span class="font-bold text-white text-base">ห้อง ${ticket.roomId} / ${ticket.pcNumber}</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusObj.bg}">
                ${statusObj.symbol} ${statusObj.label}
              </span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium border ${urgencyObj.color}">
                ความเร่งด่วน: ${urgencyObj.label}
              </span>
            </div>
            
            <div class="text-slate-200 font-medium text-sm flex items-center gap-2">
              <span class="text-blue-400 font-semibold">[${ticket.categoryName}]</span>
              <span>${ticket.details}</span>
            </div>

            <div class="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              <span>👤 ผู้แจ้ง: ${ticket.reporterName} (${ticket.reporterRole || 'ผู้ใช้'})</span>
              <span>🕒 แจ้งเมื่อ: ${ticket.createdAt}</span>
              <span>👷 ช่างผู้ดูแล: <strong class="text-slate-300">${ticket.assignedTech || 'ยังไม่ระบุ'}</strong></span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button 
            onclick="openTicketDetailModal('${ticket.id}')"
            class="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-blue-400"></i>
            ดูไทม์ไลน์
          </button>

          <button 
            onclick="openUpdateStatusModal('${ticket.id}')"
            class="px-3.5 py-2 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5"
          >
            <i data-lucide="wrench" class="w-3.5 h-3.5"></i>
            จัดการสถานะ
          </button>
        </div>
      </div>
    `;
  }).join('');

  initLucideIcons();
}

function renderAnalyticsSummary() {
  const completedTickets = appState.tickets.filter(t => t.status === "completed" && t.repairDurationHours);
  const avgHours = completedTickets.length > 0
    ? (completedTickets.reduce((acc, t) => acc + t.repairDurationHours, 0) / completedTickets.length).toFixed(1)
    : "0.0";

  const avgEl = document.getElementById("statAvgDuration");
  if (avgEl) avgEl.textContent = `${avgHours} ชม.`;
}

// --- FILE UPLOAD LISTENER & PREVIEW SYSTEM ---

function setupFileUploadListeners() {
  const fileInput = document.getElementById("formFileInput");
  const dropZone = document.getElementById("fileDropZone");

  if (!fileInput || !dropZone) return;

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleImageFileSelect(file);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('border-blue-500', 'bg-blue-500/10');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-blue-500', 'bg-blue-500/10');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) handleImageFileSelect(file);
  });
}

function handleImageFileSelect(file) {
  if (!file.type.startsWith("image/")) {
    alert("❌ โปรดเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, JPEG, WEBP)");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    appState.uploadedImageBase64 = e.target.result;
    showImagePreview(e.target.result);
  };
  reader.readAsDataURL(file);
}

function showImagePreview(src) {
  const previewBox = document.getElementById("imagePreviewBox");
  const previewImg = document.getElementById("imagePreviewImg");
  if (previewBox && previewImg) {
    previewImg.src = src;
    previewBox.classList.remove("hidden");
  }
}

function removeUploadedImage() {
  appState.uploadedImageBase64 = "";
  const fileInput = document.getElementById("formFileInput");
  const previewBox = document.getElementById("imagePreviewBox");
  const urlInput = document.getElementById("formImageUrl");
  if (fileInput) fileInput.value = "";
  if (urlInput) urlInput.value = "";
  if (previewBox) previewBox.classList.add("hidden");
}

// --- AUTH / LOGIN / ADMIN LOGIN LOGIC ---

function handleUserLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  const foundUser = appState.users.find(u => u.email.toLowerCase() === email && u.password === password && u.role !== "admin");

  if (foundUser) {
    appState.currentUser = foundUser;
    saveState();
    renderApp();
  } else {
    alert("❌ ไม่พบบัญชีผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (หากยังไม่มีบัญชี สามารถสมัครสมาชิกได้ที่แท็บ 'สมัครสมาชิก')");
  }
}

function handleAdminLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("adminLoginEmail").value.trim().toLowerCase();
  const password = document.getElementById("adminLoginPassword").value;

  const foundAdmin = appState.users.find(u => u.email.toLowerCase() === email && u.password === password && u.role === "admin");

  if (foundAdmin) {
    appState.currentUser = foundAdmin;
    saveState();
    renderApp();
    alert(`🔐 ยินดีต้อนรับสู่หน้าระบบ Admin คุณ ${foundAdmin.name}`);
  } else {
    alert("❌ อีเมลช่างไอทีหรือรหัสผ่าน Admin ไม่ถูกต้อง");
  }
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;
  const userType = document.getElementById("regUserType").value;
  const dept = document.getElementById("regDept").value.trim();

  if (appState.users.some(u => u.email === email)) {
    alert("❌ อีเมลนี้เคยลงทะเบียนในระบบแล้ว");
    return;
  }

  const userTypeLabel = userType === "teacher" ? "อาจารย์ประจำ" : "นักเรียน / นักศึกษา";
  const avatar = userType === "teacher"
    ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80";

  const newUser = {
    id: `user-${Date.now()}`,
    name: name,
    email: email,
    password: password,
    role: "user",
    userType: userType,
    userTypeLabel: userTypeLabel,
    department: dept || userTypeLabel,
    avatar: avatar
  };

  appState.users.push(newUser);
  appState.currentUser = newUser;
  saveState();
  renderApp();
  alert(`🎉 สมัครสมาชิกเรียบร้อยแล้ว! ยินดีต้อนรับคุณ ${name} (${userTypeLabel})`);
}

function logoutUser() {
  appState.currentUser = null;
  saveState();
  renderApp();
}

function switchAuthTab(tab) {
  const userLoginForm = document.getElementById("authUserLoginForm");
  const adminLoginForm = document.getElementById("authAdminLoginForm");
  const regForm = document.getElementById("authRegForm");

  const tabUserBtn = document.getElementById("tabUserLoginBtn");
  const tabAdminBtn = document.getElementById("tabAdminLoginBtn");
  const tabRegBtn = document.getElementById("tabRegBtn");

  userLoginForm.classList.add("hidden");
  adminLoginForm.classList.add("hidden");
  regForm.classList.add("hidden");

  tabUserBtn.className = "py-2 px-3 rounded-xl font-medium text-xs text-slate-400 hover:text-white transition-all";
  tabAdminBtn.className = "py-2 px-3 rounded-xl font-medium text-xs text-slate-400 hover:text-white transition-all";
  tabRegBtn.className = "py-2 px-3 rounded-xl font-medium text-xs text-slate-400 hover:text-white transition-all";

  if (tab === 'user-login') {
    userLoginForm.classList.remove("hidden");
    tabUserBtn.className = "py-2 px-3 rounded-xl font-bold text-xs bg-blue-600 text-white shadow-md shadow-blue-600/30 transition-all";
  } else if (tab === 'admin-login') {
    adminLoginForm.classList.remove("hidden");
    tabAdminBtn.className = "py-2 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 transition-all";
  } else if (tab === 'register') {
    regForm.classList.remove("hidden");
    tabRegBtn.className = "py-2 px-3 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-md shadow-emerald-600/30 transition-all";
  }

  initLucideIcons();
}

// --- REPAIR SUBMISSION & MODALS ---

function openNewRepairModal(preselectRoom = null, preselectPc = null) {
  const modal = document.getElementById("repairModal");
  if (!modal) return;

  removeUploadedImage();

  const roomSelect = document.getElementById("formRoomId");
  roomSelect.innerHTML = INITIAL_DATA.rooms.map(r => `
    <option value="${r.id}" ${r.id === (preselectRoom || appState.selectedRoom) ? 'selected' : ''}>${r.name}</option>
  `).join('');

  updatePcNumberDropdown(preselectPc);

  const catContainer = document.getElementById("categoryRadiosContainer");
  catContainer.innerHTML = INITIAL_DATA.categories.map((c, idx) => `
    <label class="p-3 rounded-xl border border-slate-700/70 bg-slate-800/40 hover:bg-slate-800 hover:border-blue-500/50 cursor-pointer flex items-center gap-2.5 transition-all text-sm">
      <input type="radio" name="formCategory" value="${c.id}" ${idx === 0 ? 'checked' : ''} class="text-blue-500 focus:ring-blue-500">
      <span>${c.name}</span>
    </label>
  `).join('');

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  initLucideIcons();
}

function closeRepairModal() {
  const modal = document.getElementById("repairModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function updatePcNumberDropdown(preselectPc = null) {
  const roomId = document.getElementById("formRoomId").value;
  const pcSelect = document.getElementById("formPcNumber");
  const roomObj = INITIAL_DATA.rooms.find(r => r.id === roomId) || INITIAL_DATA.rooms[0];

  let options = '';
  for (let i = 1; i <= roomObj.totalPcs; i++) {
    const pcNum = `PC-${i.toString().padStart(2, '0')}`;
    options += `<option value="${pcNum}" ${pcNum === preselectPc ? 'selected' : ''}>${pcNum}</option>`;
  }
  pcSelect.innerHTML = options;
}

function handleNewTicketSubmit(e) {
  e.preventDefault();
  const roomId = document.getElementById("formRoomId").value;
  const pcNumber = document.getElementById("formPcNumber").value;
  const categoryId = document.querySelector('input[name="formCategory"]:checked')?.value || "other";
  const categoryObj = INITIAL_DATA.categories.find(c => c.id === categoryId) || { name: "อื่นๆ" };
  const details = document.getElementById("formDetails").value;
  
  const urlInput = document.getElementById("formImageUrl")?.value.trim();
  const finalImageUrl = appState.uploadedImageBase64 || urlInput || "";
  
  const urgency = document.querySelector('input[name="formUrgency"]:checked')?.value || "medium";

  const newId = `REP-2026-${(appState.tickets.length + 1).toString().padStart(3, '0')}`;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const currentUser = appState.currentUser;
  const roleLabel = currentUser ? (currentUser.userTypeLabel || currentUser.department) : "ผู้ใช้ทั่วไป";

  const newTicket = {
    id: newId,
    roomId: roomId,
    pcNumber: pcNumber,
    category: categoryId,
    categoryName: categoryObj.name,
    details: details,
    imageUrl: finalImageUrl,
    urgency: urgency,
    status: "pending",
    reporterEmail: currentUser ? currentUser.email : "guest@dbt.ac.th",
    reporterName: currentUser ? currentUser.name : "ผู้ใช้งานทั่วไป",
    reporterRole: roleLabel,
    createdAt: nowStr,
    updatedAt: nowStr,
    assignedTech: "ยังไม่ระบุ",
    replacedEquipment: "-",
    repairDurationHours: null,
    timeline: [
      { status: "pending", time: nowStr, note: "ส่งคำขอแจ้งซ่อมพร้อมภาพประกอบเข้าสู่ระบบเรียบร้อย", actor: currentUser ? currentUser.name : "ผู้ใช้" }
    ]
  };

  appState.tickets.unshift(newTicket);
  saveState();
  closeRepairModal();
  renderApp();
  alert(`✅ บันทึกคำขอแจ้งซ่อม ${newId} สำหรับเครื่อง ห้อง ${roomId} / ${pcNumber} เรียบร้อยแล้ว`);
}

// PC History Modal
function openPcHistoryModal(roomId, pcNum) {
  const modal = document.getElementById("pcHistoryModal");
  if (!modal) return;

  const roomObj = INITIAL_DATA.rooms.find(r => r.id === roomId);
  const pcTickets = appState.tickets.filter(t => t.roomId === roomId && t.pcNumber === pcNum);

  document.getElementById("pcModalTitle").textContent = `ห้อง ${roomId} - ${pcNum}`;
  document.getElementById("pcModalSub").textContent = `${roomObj ? roomObj.name : ''} (ประวัติการซ่อมทั้งหมด ${pcTickets.length} ครั้ง)`;

  const listContainer = document.getElementById("pcHistoryList");
  
  if (pcTickets.length === 0) {
    listContainer.innerHTML = `
      <div class="p-6 text-center text-slate-400 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <i data-lucide="check-circle-2" class="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80"></i>
        <p class="font-medium text-white">เครื่องนี้สมบูรณ์แบบ ยังไม่มีประวัติการแจ้งเสีย</p>
      </div>
    `;
  } else {
    listContainer.innerHTML = pcTickets.map(t => {
      const statusObj = INITIAL_DATA.statuses[t.status] || INITIAL_DATA.statuses.pending;
      return `
        <div class="p-4 rounded-xl glass-card border border-slate-700/60 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-blue-400 text-sm">[${t.categoryName}] ${t.id}</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusObj.bg}">
              ${statusObj.symbol} ${statusObj.label}
            </span>
          </div>

          <p class="text-sm text-slate-200"><strong>อาการที่พบ:</strong> ${t.details}</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div><strong>📅 วันเวลาซ่อม:</strong> ${t.updatedAt || t.createdAt}</div>
            <div><strong>👷 ช่างผู้ซ่อม:</strong> ${t.assignedTech || 'ยังไม่ระบุ'}</div>
            <div class="sm:col-span-2 text-amber-300"><strong>🔩 เปลี่ยน/แก้ไขอุปกรณ์:</strong> ${t.replacedEquipment || '-'}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById("btnModalReportThisPc").onclick = () => {
    closePcHistoryModal();
    openNewRepairModal(roomId, pcNum);
  };

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  initLucideIcons();
}

function closePcHistoryModal() {
  const modal = document.getElementById("pcHistoryModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Ticket Detail & Timeline
function openTicketDetailModal(ticketId) {
  const ticket = appState.tickets.find(t => t.id === ticketId);
  if (!ticket) return;

  const modal = document.getElementById("ticketDetailModal");
  const statusObj = INITIAL_DATA.statuses[ticket.status] || INITIAL_DATA.statuses.pending;
  const urgencyObj = INITIAL_DATA.urgencies[ticket.urgency] || INITIAL_DATA.urgencies.medium;

  document.getElementById("detailModalId").textContent = ticket.id;
  document.getElementById("detailModalPc").textContent = `ห้อง ${ticket.roomId} / ${ticket.pcNumber}`;
  
  const statusBadge = document.getElementById("detailModalStatusBadge");
  statusBadge.className = `px-3 py-1 rounded-full text-xs font-medium border ${statusObj.bg}`;
  statusBadge.innerHTML = `${statusObj.symbol} ${statusObj.label}`;

  document.getElementById("detailModalCategory").textContent = ticket.categoryName;
  document.getElementById("detailModalUrgency").textContent = urgencyObj.label;
  document.getElementById("detailModalReporter").textContent = `${ticket.reporterName} (${ticket.reporterRole || 'ผู้ใช้'})`;
  document.getElementById("detailModalTech").textContent = ticket.assignedTech || 'ยังไม่ระบุ';
  document.getElementById("detailModalEquipment").textContent = ticket.replacedEquipment || '-';
  document.getElementById("detailModalDetails").textContent = ticket.details;

  const imgBox = document.getElementById("detailModalImageBox");
  if (ticket.imageUrl) {
    imgBox.innerHTML = `
      <div class="space-y-1">
        <span class="text-xs font-semibold text-slate-400 block">🖼️ รูปภาพประกอบการแจ้งซ่อม:</span>
        <img src="${ticket.imageUrl}" alt="ภาพอาการเสีย" class="w-full max-h-64 object-contain rounded-xl border border-slate-700 bg-slate-900">
      </div>
    `;
    imgBox.classList.remove("hidden");
  } else {
    imgBox.classList.add("hidden");
  }

  const timelineContainer = document.getElementById("detailTimelineContainer");
  timelineContainer.innerHTML = ticket.timeline.map((step) => {
    const stepStatus = INITIAL_DATA.statuses[step.status] || INITIAL_DATA.statuses.pending;
    return `
      <div class="relative pl-6 pb-6 border-l-2 border-slate-700 last:border-l-0 last:pb-0">
        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-400 flex items-center justify-center text-[8px]">
          ${stepStatus.symbol}
        </div>
        <div class="text-xs text-slate-400 font-mono mb-1">${step.time} • โดย ${step.actor}</div>
        <div class="text-sm font-semibold text-white mb-0.5">${stepStatus.label}</div>
        <div class="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">${step.note}</div>
      </div>
    `;
  }).join('');

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  initLucideIcons();
}

function closeTicketDetailModal() {
  const modal = document.getElementById("ticketDetailModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Update Status Modal (Admin/Tech)
function openUpdateStatusModal(ticketId) {
  const ticket = appState.tickets.find(t => t.id === ticketId);
  if (!ticket) return;

  const modal = document.getElementById("updateStatusModal");
  document.getElementById("updateModalTicketId").textContent = ticket.id;
  document.getElementById("updateModalTargetTicketId").value = ticket.id;

  const statusSelect = document.getElementById("updateStatusSelect");
  statusSelect.value = ticket.status;

  document.getElementById("updateTechNote").value = "";
  document.getElementById("updateReplacedEquipment").value = ticket.replacedEquipment !== "-" ? ticket.replacedEquipment : "";

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeUpdateStatusModal() {
  const modal = document.getElementById("updateStatusModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function handleStatusUpdateSubmit(e) {
  e.preventDefault();
  const ticketId = document.getElementById("updateModalTargetTicketId").value;
  const newStatus = document.getElementById("updateStatusSelect").value;
  const techNote = document.getElementById("updateTechNote").value;
  const replacedEquip = document.getElementById("updateReplacedEquipment").value;

  const ticket = appState.tickets.find(t => t.id === ticketId);
  if (!ticket) return;

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const currentUser = appState.currentUser;

  ticket.status = newStatus;
  ticket.updatedAt = nowStr;
  if (currentUser) ticket.assignedTech = currentUser.name;

  if (replacedEquip.trim()) {
    ticket.replacedEquipment = replacedEquip.trim();
  }

  if (newStatus === "completed" && !ticket.repairDurationHours) {
    ticket.repairDurationHours = 2.0;
  }

  const statusObj = INITIAL_DATA.statuses[newStatus] || INITIAL_DATA.statuses.pending;
  ticket.timeline.push({
    status: newStatus,
    time: nowStr,
    note: techNote || `อัปเดตสถานะงานเป็น "${statusObj.label}"`,
    actor: currentUser ? currentUser.name : "ช่างไอที"
  });

  saveState();
  closeUpdateStatusModal();
  renderApp();
  alert(`✅ อัปเดตสถานะงาน ${ticketId} เป็น "${statusObj.label}" เรียบร้อยแล้ว`);
}

// Setup Event Listeners
function setupEventListeners() {
  document.getElementById("filterStatus")?.addEventListener("change", (e) => {
    appState.filterStatus = e.target.value;
    renderTicketTable();
  });

  document.getElementById("filterRoom")?.addEventListener("change", (e) => {
    appState.filterRoom = e.target.value;
    renderTicketTable();
  });

  document.getElementById("filterUrgency")?.addEventListener("change", (e) => {
    appState.filterUrgency = e.target.value;
    renderTicketTable();
  });

  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    appState.searchQuery = e.target.value;
    renderTicketTable();
  });

  document.getElementById("formRoomId")?.addEventListener("change", () => {
    updatePcNumberDropdown();
  });
}
