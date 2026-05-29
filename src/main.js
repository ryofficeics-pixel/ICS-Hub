import "./styles.css";
import { tools } from "./tools-data.js";
import { hasSupabaseEnv } from "./lib/supabaseClient.js";
import { queueStats } from "./lib/offlineQueue.js";
import { runSyncCycle } from "./lib/syncEngine.js";
import { ensureUserProfile, getSession, onAuthChange, signIn, signOut } from "./services/authService.js";
import { migrateLegacyToQueue } from "./services/localMigrationService.js";
import { syncHandlers } from "./services/syncHandlers.js";
import { getToolsForRole, logRoutingEvent as logRoutingEventToBackend } from "./services/toolService.js";

const RECENT_KEY = "ics-tools-hub-recent";
const searchInput = document.querySelector("#toolSearch");
const categoryFilters = document.querySelector("#categoryFilters");
const toolsGrid = document.querySelector("#toolsGrid");
const emptyState = document.querySelector("#emptyState");
const resultCount = document.querySelector("#resultCount");
const recentTools = document.querySelector("#recentTools");
const backendStatus = document.querySelector("#backendStatus");
const authShell = document.querySelector("#authShell");
const authForm = document.querySelector("#authForm");
const authMessage = document.querySelector("#authMessage");
const authTitle = document.querySelector("#authTitle");
const appContent = document.querySelector("#appContent");
const logoutButton = document.querySelector("#logoutButton");
const syncNowButton = document.querySelector("#syncNowButton");
const syncStatus = document.querySelector("#syncStatus");
const userBadge = document.querySelector("#userBadge");

let activeTools = tools;
let categories = [];
let activeCategory = "All";
let query = "";
let backendMode = "static";
let currentSession = null;
let currentProfile = null;
let syncing = false;

function getRecentIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveRecent(id) {
  const next = [id, ...getRecentIds().filter((recentId) => recentId !== id)].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function filteredTools() {
  const search = normalize(query);
  return activeTools.filter((tool) => {
    const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
    const haystack = normalize([tool.name, tool.description, tool.category, tool.type, tool.status, ...(tool.aliases || [])].join(" "));
    return matchesCategory && (!search || haystack.includes(search));
  });
}

function statusClass(status) {
  return `status-${normalize(status).replace(/\s+/g, "-") || "ready"}`;
}

function createToolCard(tool) {
  const card = document.createElement("article");
  card.className = `tool-card ${tool.disabled ? "is-disabled" : ""}`;
  card.innerHTML = `
    <div class="tile-accent" aria-hidden="true"></div>
    <div class="card-topline">
      <div class="tool-icon" aria-hidden="true">${tool.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
      <span class="status-pill ${statusClass(tool.status)}">${tool.status}</span>
    </div>
    <div class="card-copy">
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
    </div>
    <dl class="tool-meta">
      <div><dt>Category</dt><dd>${tool.category}</dd></div>
      <div><dt>Type</dt><dd>${tool.type}</dd></div>
    </dl>
    <div class="card-actions">
      <button class="launch-button" type="button" ${tool.disabled ? "disabled" : ""}>
        ${tool.disabled ? "Maintenance" : "Open"}
      </button>
      <span class="path-label">${tool.url || "No active route"}</span>
    </div>
  `;

  const button = card.querySelector("button");
  button.addEventListener("click", () => {
    if (tool.disabled || !tool.url) return;
    saveRecent(tool.id);
    renderRecent();
    logRoutingEvent(tool);
    window.open(tool.url, "_blank", "noopener,noreferrer");
  });

  return card;
}

async function logRoutingEvent(tool) {
  if (!currentSession || backendMode !== "online") return;
  try {
    await logRoutingEventToBackend(tool, currentSession.user?.id);
  } catch (error) {
    console.warn("Routing event was not saved.", error);
  }
}

function setBackendStatus(mode) {
  backendMode = mode;
  const labels = {
    online: "Supabase DB",
    static: "Static fallback",
    error: "Backend error"
  };
  backendStatus.textContent = labels[mode] || labels.static;
  backendStatus.dataset.mode = mode;
}

function updateCategories() {
  categories = ["All", ...Array.from(new Set(activeTools.map((tool) => tool.category)))];
  if (!categories.includes(activeCategory)) activeCategory = "All";
}

function renderFilters() {
  categoryFilters.replaceChildren();
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${category === activeCategory ? "is-active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      activeCategory = category;
      renderFilters();
      renderTools();
    });
    categoryFilters.appendChild(button);
  });
}

function renderTools() {
  const visibleTools = filteredTools();
  toolsGrid.replaceChildren(...visibleTools.map(createToolCard));
  emptyState.hidden = visibleTools.length > 0;
  resultCount.textContent = `${visibleTools.length} tool${visibleTools.length === 1 ? "" : "s"}`;
}

function renderRecent() {
  const recent = getRecentIds()
    .map((id) => activeTools.find((tool) => tool.id === id))
    .filter(Boolean);

  recentTools.replaceChildren();
  if (!recent.length) {
    const empty = document.createElement("span");
    empty.className = "recent-empty";
    empty.textContent = "No recent tools yet";
    recentTools.appendChild(empty);
    return;
  }

  recent.forEach((tool) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-chip";
    button.textContent = tool.name;
    button.addEventListener("click", () => {
      if (!tool.disabled && tool.url) {
        saveRecent(tool.id);
        logRoutingEvent(tool);
        window.open(tool.url, "_blank", "noopener,noreferrer");
      }
    });
    recentTools.appendChild(button);
  });
}

function setAuthMessage(message, isError = false) {
  if (!authMessage) return;
  authMessage.textContent = message || "";
  authMessage.dataset.tone = isError ? "error" : "neutral";
}

function setSignedOutView() {
  appContent.hidden = true;
  authShell.hidden = false;
  authTitle.textContent = "Sign In";
  userBadge.textContent = "Signed out";
  setSyncStatus("local only");
  setAuthMessage("");
}

function setSignedInView(profile) {
  appContent.hidden = false;
  authShell.hidden = true;
  const role = profile?.role || "viewer";
  const email = currentSession?.user?.email || "user";
  userBadge.textContent = `${email} (${role})`;
}

function setSyncStatus(statusText, tone = "neutral") {
  syncStatus.textContent = statusText;
  syncStatus.dataset.mode = tone;
}

async function refreshSyncStatus() {
  const stats = await queueStats();
  if (syncing) {
    setSyncStatus(`syncing (${stats.pending} pending)`, "syncing");
    return;
  }
  if (stats.failed > 0 || stats.conflict > 0) {
    setSyncStatus(`failed ${stats.failed} | conflict ${stats.conflict}`, "error");
    return;
  }
  if (stats.pending > 0) {
    setSyncStatus(`${stats.pending} pending`, "pending");
    return;
  }
  setSyncStatus("synced", "online");
}

async function syncNow() {
  if (!currentSession) {
    setSyncStatus("login required", "error");
    return;
  }
  if (!navigator.onLine) {
    setSyncStatus("offline", "pending");
    return;
  }
  syncing = true;
  setSyncStatus("syncing...", "syncing");
  try {
    await runSyncCycle(syncHandlers);
  } catch (error) {
    console.warn("Sync cycle failed.", error);
  } finally {
    syncing = false;
    await refreshSyncStatus();
  }
}

async function loadToolsFromBackend(role) {
  if (!hasSupabaseEnv) {
    applyTools(tools, "static");
    return;
  }

  try {
    const dbTools = await getToolsForRole(role);
    applyTools(dbTools, "online");
  } catch (error) {
    console.warn("Supabase tools query failed. Falling back to static data.", error);
    applyTools(tools, "error");
  }
}

async function initializeAuthenticatedState(session) {
  currentSession = session;
  if (!session?.user) {
    currentProfile = null;
    setSignedOutView();
    applyTools(tools, hasSupabaseEnv ? "error" : "static");
    return;
  }

  try {
    currentProfile = await ensureUserProfile(session.user);
    setSignedInView(currentProfile);
    await migrateLegacyToQueue(session.user.id);
    await loadToolsFromBackend(currentProfile?.role || "viewer");
    await syncNow();
  } catch (error) {
    console.error(error);
    setSignedOutView();
    setAuthMessage(error.message || "Failed to initialize account.", true);
  }
}

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  renderTools();
});

function applyTools(nextTools, mode) {
  activeTools = nextTools.length ? nextTools : tools;
  setBackendStatus(mode);
  updateCategories();
  renderFilters();
  renderRecent();
  renderTools();
}

if (authForm) {
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(authForm);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    setAuthMessage("Signing in...");
    try {
      await signIn(email, password);
      setAuthMessage("");
    } catch (error) {
      setAuthMessage(error.message || "Sign in failed.", true);
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn("Sign out failed.", error);
    }
  });
}

if (syncNowButton) {
  syncNowButton.addEventListener("click", () => syncNow());
}

window.addEventListener("online", () => {
  syncNow().catch((error) => console.warn("Online sync failed.", error));
});

async function bootstrap() {
  updateCategories();
  renderFilters();
  renderRecent();
  renderTools();

  if (!hasSupabaseEnv) {
    setSignedOutView();
    applyTools(tools, "static");
    setAuthMessage("Missing Supabase env vars. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.", true);
    return;
  }

  try {
    const session = await getSession();
    await initializeAuthenticatedState(session);
    onAuthChange(async (nextSession) => {
      await initializeAuthenticatedState(nextSession);
    });
  } catch (error) {
    console.error(error);
    setSignedOutView();
    setAuthMessage(error.message || "Authentication bootstrap failed.", true);
    applyTools(tools, "error");
  }
}

bootstrap().catch((error) => {
  console.error("App bootstrap failed.", error);
  applyTools(tools, "error");
});
