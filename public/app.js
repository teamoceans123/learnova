const state = {
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  courses: [],
  myCourses: [],
  activeAuthMode: "login",
  activePanel: "dashboard",
};

const els = {
  landingSection: document.getElementById("landingSection"),
  authSection: document.getElementById("authSection"),
  dashboardSection: document.getElementById("dashboardSection"),
  userInfo: document.getElementById("userInfo"),
  welcomeTitle: document.getElementById("welcomeTitle"),
  authTitle: document.getElementById("authTitle"),
  goLoginBtn: document.getElementById("goLoginBtn"),
  goRegisterBtn: document.getElementById("goRegisterBtn"),
  backHomeBtn: document.getElementById("backHomeBtn"),
  showLoginBtn: document.getElementById("showLoginBtn"),
  showRegisterBtn: document.getElementById("showRegisterBtn"),
  navButtons: Array.from(document.querySelectorAll("button[data-nav]")),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  courseForm: document.getElementById("courseForm"),
  courseId: document.getElementById("courseId"),
  courseFormTitle: document.getElementById("courseFormTitle"),
  adminCourseFormCard: document.getElementById("adminCourseFormCard"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  welcomePanel: document.getElementById("welcomePanel"),
  coursesPanel: document.getElementById("coursesPanel"),
  myCoursesPanel: document.getElementById("myCoursesPanel"),
  courseList: document.getElementById("courseList"),
  myCourseList: document.getElementById("myCourseList"),
  coursesLoading: document.getElementById("coursesLoading"),
  myCoursesLoading: document.getElementById("myCoursesLoading"),
  courseEmpty: document.getElementById("courseEmpty"),
  myCourseEmpty: document.getElementById("myCourseEmpty"),
  toastContainer: document.getElementById("toastContainer"),
};

const api = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const showToast = (message, type = "success") => {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  els.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
};

const setAuth = (payload) => {
  state.token = payload.token;
  state.user = payload.user;
  localStorage.setItem("token", payload.token);
  localStorage.setItem("user", JSON.stringify(payload.user));
};

const clearAuth = () => {
  state.token = "";
  state.user = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const setActiveView = (view) => {
  const views = [
    { key: "landing", element: els.landingSection },
    { key: "auth", element: els.authSection },
    { key: "dashboard", element: els.dashboardSection },
  ];

  views.forEach(({ key, element }) => {
    const isActive = key === view;
    element.classList.toggle("hidden", !isActive);
    element.classList.toggle("view-active", isActive);
  });
};

const setAuthMode = (mode) => {
  state.activeAuthMode = mode;
  const isLogin = mode === "login";
  els.authTitle.textContent = isLogin ? "Welcome back" : "Create your account";
  els.loginForm.classList.toggle("hidden", !isLogin);
  els.registerForm.classList.toggle("hidden", isLogin);
  els.showLoginBtn.classList.toggle("active", isLogin);
  els.showRegisterBtn.classList.toggle("active", !isLogin);
};

const setPanel = (panel) => {
  state.activePanel = panel;
  els.navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nav === panel);
  });

  els.welcomePanel.classList.toggle("hidden", panel !== "dashboard");
  els.welcomePanel.classList.toggle("view-active", panel === "dashboard");
  els.adminCourseFormCard.classList.toggle("hidden", panel !== "dashboard" || state.user?.role !== "ADMIN");
  els.coursesPanel.classList.toggle("hidden", panel !== "courses");
  els.coursesPanel.classList.toggle("view-active", panel === "courses");
  els.myCoursesPanel.classList.toggle("hidden", panel !== "my-courses");
  els.myCoursesPanel.classList.toggle("view-active", panel === "my-courses");
};

const setLoadingGrid = (element, loading) => {
  element.classList.toggle("hidden", !loading);
  if (!loading) {
    element.innerHTML = "";
    return;
  }
  element.innerHTML = "<span></span><span></span><span></span>";
};

const showFormFeedback = (formId, message = "") => {
  const feedback = document.querySelector(`[data-feedback-for="${formId}"]`);
  if (!feedback) {
    return;
  }
  feedback.textContent = message;
  feedback.classList.toggle("hidden", !message);
};

const validatePayload = (kind, payload) => {
  if (kind === "login") {
    if (!payload.email || !payload.password) {
      return "Email and password are required.";
    }
    if (payload.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return "";
  }

  if (kind === "register") {
    if (!payload.name || payload.name.trim().length < 2) {
      return "Please enter a valid name.";
    }
    if (!payload.email) {
      return "Email is required.";
    }
    if (!payload.password || payload.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return "";
  }

  if (!payload.title || payload.title.trim().length < 2) {
    return "Course title must be at least 2 characters.";
  }
  if (!payload.instructor || payload.instructor.trim().length < 2) {
    return "Instructor name must be at least 2 characters.";
  }
  if (!payload.description || payload.description.trim().length < 10) {
    return "Description must be at least 10 characters.";
  }
  if (!payload.capacity || Number(payload.capacity) < 1) {
    return "Capacity must be at least 1.";
  }
  return "";
};

const formatCourseCard = (course, actions = "") => `
  <article class="course-card">
    <h4>${escapeHtml(course.title)}</h4>
    <p>${escapeHtml(course.description)}</p>
    <div class="course-meta">
      <span><strong>Instructor:</strong> ${escapeHtml(course.instructor)}</span>
      <span><strong>Capacity:</strong> ${escapeHtml(course.capacity)}</span>
      <span><strong>Seats left:</strong> ${escapeHtml(course.remainingSeats ?? "-")}</span>
    </div>
    <div class="action-buttons">${actions}</div>
  </article>
`;

const renderCourses = () => {
  els.courseList.innerHTML = "";
  els.courseEmpty.classList.toggle("hidden", state.courses.length > 0);

  state.courses.forEach((course) => {
    const isEnrolled = state.myCourses.some((item) => (item.courseId ?? item.course?.id) === course.id);
    const canEnroll = state.user?.role === "STUDENT" && !isEnrolled && course.remainingSeats > 0;
    let actions = "";

    if (state.user?.role === "ADMIN") {
      actions = `
        <button data-action="edit" data-id="${course.id}" type="button">Edit</button>
        <button class="btn-danger" data-action="delete" data-id="${course.id}" type="button">Delete</button>
      `;
    } else if (isEnrolled) {
      actions = `<button class="btn-danger" data-action="drop" data-id="${course.id}" type="button">Drop Course</button>`;
    } else {
      actions = `<button ${canEnroll ? "" : "disabled"} data-action="enroll" data-id="${course.id}" type="button">
        ${course.remainingSeats > 0 ? "Enroll Now" : "Course Full"}
      </button>`;
    }

    els.courseList.insertAdjacentHTML("beforeend", formatCourseCard(course, actions));
  });
};

const renderMyCourses = () => {
  els.myCourseList.innerHTML = "";
  els.myCourseEmpty.classList.toggle("hidden", state.myCourses.length > 0);

  state.myCourses.forEach((entry) => {
    const course = entry.course || entry;
    const actions = `<button class="btn-danger" data-action="drop" data-id="${course.id}" type="button">Drop Course</button>`;
    els.myCourseList.insertAdjacentHTML("beforeend", formatCourseCard(course, actions));
  });
};

const renderShell = () => {
  const loggedIn = Boolean(state.user && state.token);
  if (!loggedIn) {
    setActiveView("landing");
    return;
  }

  setActiveView("dashboard");
  els.userInfo.textContent = `${state.user.name} (${state.user.role})`;
  els.welcomeTitle.textContent = `Welcome, ${state.user.name}`;
  setPanel(state.activePanel);
};

const refreshData = async () => {
  if (!state.user || !state.token) {
    return;
  }

  setLoadingGrid(els.coursesLoading, true);
  setLoadingGrid(els.myCoursesLoading, true);
  try {
    const [courses, myCourses] = await Promise.all([api("/api/courses"), api("/api/my-courses")]);
    state.courses = courses;
    state.myCourses = myCourses;
    renderCourses();
    renderMyCourses();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoadingGrid(els.coursesLoading, false);
    setLoadingGrid(els.myCoursesLoading, false);
  }
};

const resetCourseForm = () => {
  els.courseForm.reset();
  els.courseId.value = "";
  els.courseFormTitle.textContent = "Create Course";
  els.cancelEditBtn.classList.add("hidden");
  showFormFeedback("courseForm");
};

const getCourseById = (id) => state.courses.find((course) => course.id === Number(id));

els.goLoginBtn.addEventListener("click", () => {
  setAuthMode("login");
  setActiveView("auth");
});

els.goRegisterBtn.addEventListener("click", () => {
  setAuthMode("register");
  setActiveView("auth");
});

els.backHomeBtn.addEventListener("click", () => setActiveView("landing"));
els.showLoginBtn.addEventListener("click", () => setAuthMode("login"));
els.showRegisterBtn.addEventListener("click", () => setAuthMode("register"));

els.navButtons.forEach((button) => {
  button.addEventListener("click", () => setPanel(button.dataset.nav));
});

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const validationMessage = validatePayload("login", data);
  showFormFeedback("loginForm", validationMessage);
  if (validationMessage) {
    return;
  }

  try {
    const payload = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setAuth(payload);
    showFormFeedback("loginForm");
    event.currentTarget.reset();
    state.activePanel = "dashboard";
    renderShell();
    await refreshData();
    showToast("Logged in successfully.");
  } catch (error) {
    showFormFeedback("loginForm", error.message);
    showToast(error.message, "error");
  }
});

els.registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const validationMessage = validatePayload("register", data);
  showFormFeedback("registerForm", validationMessage);
  if (validationMessage) {
    return;
  }

  try {
    const payload = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setAuth(payload);
    showFormFeedback("registerForm");
    event.currentTarget.reset();
    state.activePanel = "dashboard";
    renderShell();
    await refreshData();
    showToast("Account created successfully.");
  } catch (error) {
    showFormFeedback("registerForm", error.message);
    showToast(error.message, "error");
  }
});

els.courseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(event.currentTarget));
  const payload = {
    ...formData,
    capacity: Number(formData.capacity),
  };
  const validationMessage = validatePayload("course", payload);
  showFormFeedback("courseForm", validationMessage);
  if (validationMessage) {
    return;
  }

  const id = els.courseId.value;
  const endpoint = id ? `/api/courses/${id}` : "/api/courses";
  const method = id ? "PUT" : "POST";

  try {
    await api(endpoint, {
      method,
      body: JSON.stringify(payload),
    });
    resetCourseForm();
    await refreshData();
    showToast(id ? "Course updated successfully." : "Course created successfully.");
  } catch (error) {
    showFormFeedback("courseForm", error.message);
    showToast(error.message, "error");
  }
});

els.cancelEditBtn.addEventListener("click", resetCourseForm);
els.refreshBtn.addEventListener("click", refreshData);

els.logoutBtn.addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch (error) {
    showToast(error.message, "error");
  }

  clearAuth();
  state.courses = [];
  state.myCourses = [];
  state.activePanel = "dashboard";
  resetCourseForm();
  renderCourses();
  renderMyCourses();
  renderShell();
  setAuthMode("login");
  showToast("Logged out successfully.");
});

document.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("button[data-action]");
  if (!actionButton) {
    return;
  }

  const { action, id } = actionButton.dataset;
  if (!action || !id) {
    return;
  }

  actionButton.disabled = true;
  try {
    if (action === "enroll") {
      await api(`/api/enroll/${id}`, { method: "POST" });
      await refreshData();
      showToast("Enrollment successful.");
      return;
    }

    if (action === "drop") {
      await api(`/api/enroll/${id}`, { method: "DELETE" });
      await refreshData();
      showToast("Course dropped.");
      return;
    }

    if (action === "delete") {
      await api(`/api/courses/${id}`, { method: "DELETE" });
      await refreshData();
      showToast("Course deleted.");
      return;
    }

    const course = getCourseById(id);
    if (!course) {
      showToast("Course not found.", "error");
      return;
    }

    els.courseId.value = course.id;
    els.courseForm.title.value = course.title;
    els.courseForm.description.value = course.description;
    els.courseForm.instructor.value = course.instructor;
    els.courseForm.capacity.value = course.capacity;
    els.courseFormTitle.textContent = "Edit Course";
    els.cancelEditBtn.classList.remove("hidden");
    setPanel("dashboard");
    els.adminCourseFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    actionButton.disabled = false;
  }
});

const bootstrap = async () => {
  setAuthMode("login");
  renderShell();
  if (state.user && state.token) {
    await refreshData();
  } else {
    renderCourses();
    renderMyCourses();
  }
};

bootstrap();
