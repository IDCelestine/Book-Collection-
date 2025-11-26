// js/dashboard.js

const COLLECTIONS_KEY = "collections";

function loadCollections() {
  try {
    const stored = JSON.parse(localStorage.getItem(COLLECTIONS_KEY));
    if (Array.isArray(stored)) return stored;
  } catch (e) {}
  return [];
}

function saveCollections(collections) {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

/**
 * Seed some demo collections if none exist.
 */
function seedDemoCollections() {
  const existing = loadCollections();
  if (existing.length > 0) return;

  const user = getCurrentUser();
  const now = new Date().toISOString();

  const demo = [
    {
      id: Date.now(),
      userId: user ? user.id : null,
      title: "My Camera Gear",
      tag: "Photography",
      description: "Cameras and lenses I use regularly.",
      createdAt: now,
      updatedAt: now,
      itemCount: 5,
    },
    {
      id: Date.now() + 1,
      userId: user ? user.id : null,
      title: "Favourite Books",
      tag: "Books",
      description: "Novels and non-fiction I recommend.",
      createdAt: now,
      updatedAt: now,
      itemCount: 8,
    },
  ];

  saveCollections(demo);
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createCollectionCard(collection, isMineView) {
  const card = document.createElement("article");
  card.className = "collection-card";

  const header = document.createElement("div");
  header.className = "card-header";

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = collection.title;

  const tag = document.createElement("p");
  tag.className = "card-tag";
  tag.textContent = collection.tag || "No tag";

  header.appendChild(title);
  header.appendChild(tag);

  const body = document.createElement("div");
  body.className = "card-body";

  const created = document.createElement("p");
  created.className = "card-meta";
  created.textContent = `CREATED: ${formatDate(collection.createdAt)}`;

  const updated = document.createElement("p");
  updated.className = "card-meta";
  updated.textContent = `LAST UPDATED: ${formatDate(collection.updatedAt)}`;

  const stats = document.createElement("div");
  stats.className = "card-stats";
  stats.innerHTML = `
    <span class="stat-icon">💡</span>
    <span class="stat-count">${collection.itemCount || 0}</span>
  `;

  body.appendChild(created);
  body.appendChild(updated);
  body.appendChild(stats);

  card.appendChild(header);
  card.appendChild(body);

  if (isMineView) {
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn";
    editBtn.textContent = "✏️";
    editBtn.title = "Edit collection";
    editBtn.addEventListener("click", () => {
      window.location.href = `manage-collection.html?id=${collection.id}`;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn";
    deleteBtn.textContent = "🗑️";
    deleteBtn.title = "Delete collection";
    deleteBtn.addEventListener("click", () => {
      handleDeleteCollection(collection.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    card.appendChild(actions);
  }

  return card;
}

function handleDeleteCollection(id) {
  if (!confirm("Are you sure you want to delete this collection?")) return;

  const collections = loadCollections();
  const updated = collections.filter((c) => c.id !== id);
  saveCollections(updated);
  renderDashboard();
}

function getActiveTab() {
  const active = document.querySelector(".tabs .tab.active");
  return active ? active.dataset.tab : "all";
}

function applyFilters(collections) {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const sortValue = sortSelect ? sortSelect.value : "recent";
  const activeTab = getActiveTab();
  const user = getCurrentUser();

  let filtered = [...collections];

  if (activeTab === "mine" && user) {
    filtered = filtered.filter((c) => c.userId === user.id);
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (c) =>
        (c.title && c.title.toLowerCase().includes(searchTerm)) ||
        (c.tag && c.tag.toLowerCase().includes(searchTerm))
    );
  }

  filtered.sort((a, b) => {
    if (sortValue === "az") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortValue === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    // most recent
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return filtered;
}

function renderDashboard() {
  const grid = document.getElementById("collectionGrid");
  const emptyState = document.getElementById("emptyState");
  if (!grid) return;

  const collections = loadCollections();
  const filtered = applyFilters(collections);
  const isMineView = getActiveTab() === "mine";

  grid.innerHTML = "";

  if (!filtered.length) {
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }
  if (emptyState) emptyState.classList.add("hidden");

  filtered.forEach((c) => {
    const card = createCollectionCard(c, isMineView);
    grid.appendChild(card);
  });
}

function initTabs() {
  const tabs = document.querySelectorAll(".tabs .tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderDashboard();
    });
  });
}

function initControls() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const newBtn = document.getElementById("newCollectionBtn");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderDashboard();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      renderDashboard();
    });
  }

  if (newBtn) {
    newBtn.addEventListener("click", () => {
      window.location.href = "manage-collection.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  seedDemoCollections();
  initTabs();
  initControls();
  renderDashboard();
});
