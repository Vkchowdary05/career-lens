// CareerLens API Client — replaces the mock API utility

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getToken(): Promise<string | null> {
  try {
    const { auth } = await import("@/lib/firebase");
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(false);
  } catch {
    return null;
  }
}

async function request<T = any>(
  path: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── AUTH ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { firebase_uid: string; email: string; full_name: string; photo_url?: string | null; auth_provider?: string }) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  me: () => request("/api/auth/me"),
};

// ── USERS ─────────────────────────────────────────────────────────────────

export const usersApi = {
  getProfile: (username: string) => request(`/api/users/${username}`),
  getMyProfile: () => request("/api/users/me"),
  updateProfile: (data: Record<string, any>) =>
    request("/api/users/me/profile", { method: "PUT", body: JSON.stringify(data) }),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request("/api/users/me/avatar", { method: "POST", body: form });
  },
  toggleFollow: (username: string) =>
    request(`/api/users/${username}/follow`, { method: "POST" }),
  getMyStats: () => request("/api/users/me/stats"),
};

// ── FEED ──────────────────────────────────────────────────────────────────

export const feedApi = {
  getPosts: (page = 1, feedType = "latest") =>
    request(`/api/feed/posts?page=${page}&feed_type=${feedType}`),
  createPost: (data: Record<string, any>) =>
    request("/api/feed/posts", { method: "POST", body: JSON.stringify(data) }),
  toggleLike: (postId: string) =>
    request(`/api/feed/posts/${postId}/like`, { method: "POST" }),
  getComments: (postId: string) => request(`/api/feed/posts/${postId}/comments`),
  addComment: (postId: string, content: string, parentCommentId?: string) =>
    request(`/api/feed/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parent_comment_id: parentCommentId })
    }),
  deletePost: (postId: string) =>
    request(`/api/feed/posts/${postId}`, { method: "DELETE" }),
  uploadPostImage: (postId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/api/feed/posts/${postId}/upload-image`, { method: "POST", body: form });
  },
  getTrendingCompanies: () => request("/api/feed/trending-companies"),
  getTopContributors: () => request("/api/feed/top-contributors"),
};

// ── EXPERIENCES ────────────────────────────────────────────────────────────

export const experiencesApi = {
  list: (params?: { company_slug?: string; role?: string; outcome?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.company_slug) q.set("company_slug", params.company_slug);
    if (params?.role) q.set("role", params.role);
    if (params?.outcome) q.set("outcome", params.outcome);
    if (params?.page) q.set("page", String(params.page));
    return request(`/api/experiences/?${q.toString()}`);
  },
  create: (data: Record<string, any>) =>
    request("/api/experiences/", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => request(`/api/experiences/${id}`),
  toggleLike: (id: string) =>
    request(`/api/experiences/${id}/like`, { method: "POST" }),
  getComments: (id: string) => request(`/api/experiences/${id}/comments`),
  addComment: (id: string, content: string, parentCommentId?: string) =>
    request(`/api/experiences/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parent_comment_id: parentCommentId })
    }),
  getMetaOptions: () => request("/api/experiences/meta/options"),
};

// ── COMPANIES ─────────────────────────────────────────────────────────────

export const companiesApi = {
  list: (params?: { search?: string; sort_by?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.page) q.set("page", String(params.page));
    return request(`/api/companies/?${q.toString()}`);
  },
  get: (slug: string) => request(`/api/companies/${slug}`),
  getAnalysis: (slug: string) => request(`/api/companies/${slug}/analysis`),
  getExperiences: (slug: string, params?: { role?: string; outcome?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set("role", params.role);
    if (params?.outcome) q.set("outcome", params.outcome);
    if (params?.page) q.set("page", String(params.page));
    return request(`/api/companies/${slug}/experiences?${q.toString()}`);
  },
  getOptions: (search = "") =>
    request(`/api/companies/meta/options?search=${encodeURIComponent(search)}`),
};

// ── RESUME ────────────────────────────────────────────────────────────────

export const resumeApi = {
  analyzeJd: (data: { job_description: string; role_category: string; target_country: string; target_city?: string; target_company?: string }) =>
    request("/api/resume/analyze-jd", { method: "POST", body: JSON.stringify(data) }),
  uploadCv: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request("/api/resume/upload-cv", { method: "POST", body: form });
  },
  analyzeWithCv: (jobDetails: Record<string, any>, profile: Record<string, any>) =>
    request("/api/resume/analyze-with-cv", {
      method: "POST",
      body: JSON.stringify({ job_details: jobDetails, profile })
    }),
  skillChat: (skill: string, answer: string, isCritical = false) =>
    request(`/api/resume/skill-chat?skill=${encodeURIComponent(skill)}&answer=${encodeURIComponent(answer)}&is_critical=${isCritical}`, { method: "POST" }),
  generate: (data: { job_details: Record<string, any>; profile: Record<string, any>; skill_answers: Array<{ skill: string; answer: string }> }) =>
    request("/api/resume/generate", { method: "POST", body: JSON.stringify(data) }),
  getHistory: () => request("/api/resume/history"),
};

// ── TRACKER ───────────────────────────────────────────────────────────────

export const trackerApi = {
  list: () => request("/api/tracker/"),
  create: (data: Record<string, any>) =>
    request("/api/tracker/", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => request(`/api/tracker/${id}`),
  updateStage: (id: string, newStage: string, notes?: string) =>
    request(`/api/tracker/${id}/stage`, {
      method: "PUT",
      body: JSON.stringify({ new_stage: newStage, notes })
    }),
  uploadResume: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/api/tracker/${id}/upload-resume`, { method: "POST", body: form });
  },
  delete: (id: string) => request(`/api/tracker/${id}`, { method: "DELETE" }),
  getStats: () => request("/api/tracker/stats/summary"),
  getStages: () => request("/api/tracker/meta/stages"),
};

// ── LEADERBOARD ────────────────────────────────────────────────────────────

export const leaderboardApi = {
  get: (page = 1) => request(`/api/leaderboard/?page=${page}`),
};

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (page = 1, type?: string) => {
    const q = new URLSearchParams({ page: String(page) });
    if (type) q.set("notif_type", type);
    return request(`/api/notifications/?${q.toString()}`);
  },
  getUnreadCount: () => request("/api/notifications/unread-count"),
};

// Legacy default exports to avoid breaking any existing imports
export async function getExperiences() { return experiencesApi.list(); }
export async function getApplications() { return trackerApi.list(); }
export async function getCompanies() { return companiesApi.list(); }
export async function getLeaderboard() { return leaderboardApi.get(); }
export async function getNotifications() { return notificationsApi.list(); }
