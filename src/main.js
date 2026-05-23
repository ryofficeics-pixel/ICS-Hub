import "./styles.css";
import { tools } from "./tools-data.js";
import { supabase } from "./lib/supabase.js";

const RECENT_KEY = "ics-tools-hub-recent";
const searchInput = document.querySelector("#toolSearch");
const categoryFilters = document.querySelector("#categoryFilters");
const toolsGrid = document.querySelector("#toolsGrid");
const emptyState = document.querySelector("#emptyState");
const resultCount = document.querySelector("#resultCount");
const recentTools = document.querySelector("#recentTools");
const backendStatus = document.querySelector("#backendStatus");

let activeTools = tools;
let categories = [];
let activeCategory = "All";
let query = "";
let backendMode = "static";

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
  if (!supabase || backendMode !== "online") return;
  try {
    const { error } = await supabase.from("routing_events").insert({
      tool_id: tool.id,
      tool_name: tool.name,
      url: tool.url,
      user_agent: navigator.userAgent
    });
    if (error) throw error;
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

async function loadSupabaseTools() {
  if (!supabase) {
    applyTools(tools, "static");
    return;
  }

  try {
    const [{ data: dbTools, error: toolsError }, { data: aliases, error: aliasesError }] = await Promise.all([
      supabase.from("tools").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
      supabase.from("tool_aliases").select("tool_id, alias")
    ]);

    if (toolsError) throw toolsError;
    if (aliasesError) throw aliasesError;

    const aliasesByTool = new Map();
    for (const row of aliases || []) {
      const list = aliasesByTool.get(row.tool_id) || [];
      list.push(row.alias);
      aliasesByTool.set(row.tool_id, list);
    }

    const normalizedTools = (dbTools || []).map((tool) => ({
      ...tool,
      url: tool.url || "",
      disabled: Boolean(tool.disabled),
      aliases: aliasesByTool.get(tool.id) || []
    }));

    applyTools(normalizedTools, "online");
  } catch (error) {
    console.warn("Supabase tools query failed. Falling back to static data.", error);
    applyTools(tools, "error");
  }
}

loadSupabaseTools();
