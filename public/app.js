const state = {
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  courses: [],
  myCourses: [],
};

const els = {
  authSection: document.getElementById("authSection"),
  dashboardSection: document.getElementById("dashboardSection"),
  userInfo: document.getElementById("userInfo"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  courseForm: document.getElementById("courseForm"),
  courseId: document.getElementById("courseId"),
  courseFormTitle: document.getElementById("courseFormTitle"),
  adminCourseFormCard: document.getElementById("adminCourseFormCard"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
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

const setLoading = (element, loading, text = "Loading...") => {
  element.textContent = text;
  element.classList.toggle("hidden", !loading);
};

const showToast = (message, type = "success") => {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  els.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
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

const formatCourseCard = (course, actions = "") => `
  <article class="course-item">
    <strong>${course.title}</strong>
    <p>${course.description}</p>
    <div class="course-meta">
      <span>Instructor: ${course.instructor}</span>
      <span>Capacity: ${course.capacity}</span>
      <span>Seats left: ${course.remainingSeats ?? "-"}</span>
    </div>
    <div class="action-buttons">${actions}</div>
  </article>
`;

const renderDashboard = () => {
  const loggedIn = Boolean(state.user && state.token);
  els.authSection.classList.toggle("hidden", loggedIn);
  els.dashboardSection.classList.toggle("hidden", !loggedIn);

  if (!loggedIn) {
    return;
  }

  els.userInfo.classList.remove("hidden");
  els.userInfo.textContent = `${state.user.name} (${state.user.role})`;
  els.adminCourseFormCard.classList.toggle("hidden", state.user.role !== "ADMIN");
};

const renderCourses = () => {
  els.courseList.innerHTML = "";
  els.courseEmpty.classList.toggle("hidden", state.courses.length > 0);

  state.courses.forEach((course) => {
    const isEnrolled = state.myCourses.some((item) => item.courseId === course.id);
    const canEnroll = state.user?.role === "STUDENT" && !isEnrolled && course.remainingSeats > 0;

    let actions = "";
    if (state.user?.role === "ADMIN") {
      actions = `
        <button data-action="edit" data-id="${course.id}">Edit</button>
        <button class="danger" data-action="delete" data-id="${course.id}">Delete</button>
      `;
    } else if (isEnrolled) {
      actions = `<button class="danger" data-action="drop" data-id="${course.id}">Drop</button>`;
    } else {
      actions = `<button ${canEnroll ? "" : "disabled"} data-action="enroll" data-id="${course.id}">
        ${course.remainingSeats > 0 ? "Enroll" : "Course Full"}
      </button>`;
    }

    els.courseList.insertAdjacentHTML("beforeend", formatCourseCard(course, actions));
  });
};

const renderMyCourses = () => {
  els.myCourseList.innerHTML = "";
  els.myCourseEmpty.classList.toggle("hidden", state.myCourses.length > 0);

  state.myCourses.forEach((enrollment) => {
    const course = enrollment.course || enrollment;
    const actions =
      state.user?.role === "STUDENT"
        ? `<button class="danger" data-action="drop" data-id="${course.id}">Drop</button>`
        : "";
    els.myCourseList.insertAdjacentHTML("beforeend", formatCourseCard(course, actions));
  });
};

const refreshData = async () => {
  if (!state.user) {
    return;
  }

  setLoading(els.coursesLoading, true, "Loading courses...");
  setLoading(els.myCoursesLoading, true, "Loading enrolled courses...");

  try {
    const [courses, myCourses] = await Promise.all([api("/api/courses"), api("/api/my-courses")]);
    state.courses = courses;
    state.myCourses = myCourses;
    renderCourses();
    renderMyCourses();
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setLoading(els.coursesLoading, false);
    setLoading(els.myCoursesLoading, false);
  }
};

const resetCourseForm = () => {
  els.courseForm.reset();
  els.courseId.value = "";
  els.courseFormTitle.textContent = "Create Course";
  els.cancelEditBtn.classList.add("hidden");
};

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);

  try {
    const payload = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    setAuth(payload);
    renderDashboard();
    await refreshData();
    showToast("Logged in successfully");
    event.currentTarget.reset();
  } catch (error) {
    showToast(error.message, "error");
  }
});

els.registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = Object.fromEntries(formData);

  try {
    const result = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAuth(result);
    renderDashboard();
    await refreshData();
    showToast("Account created successfully");
    event.currentTarget.reset();
  } catch (error) {
    showToast(error.message, "error");
  }
});

els.logoutBtn.addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {}
  clearAuth();
  state.courses = [];
  state.myCourses = [];
  renderDashboard();
  renderCourses();
  renderMyCourses();
  showToast("Logged out");
});

els.refreshBtn.addEventListener("click", refreshData);

els.courseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(event.currentTarget));
  const payload = {
    ...formData,
    capacity: Number(formData.capacity),
  };

  const id = els.courseId.value;
  const method = id ? "PUT" : "POST";
  const endpoint = id ? `/api/courses/${id}` : "/api/courses";

  try {
    await api(endpoint, {
      method,
      body: JSON.stringify(payload),
    });
    showToast(id ? "Course updated" : "Course created");
    resetCourseForm();
    await refreshData();
  } catch (error) {
    showToast(error.message, "error");
  }
});

els.cancelEditBtn.addEventListener("click", resetCourseForm);

const getCourseById = (id) => state.courses.find((course) => course.id === Number(id));

document.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;
  if (!id) {
    return;
  }

  try {
    if (action === "enroll") {
      await api(`/api/enroll/${id}`, { method: "POST" });
      showToast("Enrollment successful");
      await refreshData();
      return;
    }

    if (action === "drop") {
      await api(`/api/enroll/${id}`, { method: "DELETE" });
      showToast("Course dropped");
      await refreshData();
      return;
    }

    if (action === "delete") {
      await api(`/api/courses/${id}`, { method: "DELETE" });
      showToast("Course deleted");
      await refreshData();
      return;
    }

    if (action === "edit") {
      const course = getCourseById(id);
      if (!course) {
        return;
      }
      els.courseId.value = course.id;
      els.courseForm.title.value = course.title;
      els.courseForm.description.value = course.description;
      els.courseForm.instructor.value = course.instructor;
      els.courseForm.capacity.value = course.capacity;
      els.courseFormTitle.textContent = "Edit Course";
      els.cancelEditBtn.classList.remove("hidden");
      els.adminCourseFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    showToast(error.message, "error");
  }
});

const bootstrap = async () => {
  renderDashboard();
  if (state.user && state.token) {
    await refreshData();
  } else {
    setLoading(els.coursesLoading, false);
    setLoading(els.myCoursesLoading, false);
  }
};

bootstrap();
