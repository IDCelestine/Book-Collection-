// js/manage-collection.js

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

function getCollectionById(id) {
  const collections = loadCollections();
  return collections.find((c) => String(c.id) === String(id));
}

function upsertCollection(existingId, data) {
  const collections = loadCollections();
  const now = new Date().toISOString();
  const user = getCurrentUser();

  if (existingId) {
    const index = collections.findIndex((c) => String(c.id) === String(existingId));
    if (index !== -1) {
      collections[index] = {
        ...collections[index],
        ...data,
        updatedAt: now,
      };
    }
  } else {
    const newCol = {
      id: Date.now(),
      userId: user ? user.id : null,
      title: data.title,
      tag: data.tag,
      description: data.description,
      createdAt: now,
      updatedAt: now,
      itemCount: 0,
    };
    collections.push(newCol);
  }

  saveCollections(collections);
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  const formTitle = document.getElementById("formTitle");
  const form = document.getElementById("collectionForm");
  const titleInput = document.getElementById("title");
  const tagInput = document.getElementById("tag");
  const descInput = document.getElementById("description");
  const cancelBtn = document.getElementById("cancelBtn");

  if (editId) {
    if (formTitle) formTitle.textContent = "Edit Collection";
    const col = getCollectionById(editId);
    if (col) {
      if (titleInput) titleInput.value = col.title || "";
      if (tagInput) tagInput.value = col.tag || "";
      if (descInput) descInput.value = col.description || "";
    }
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = titleInput.value.trim();
      const tag = tagInput.value.trim();
      const description = descInput.value.trim();

      if (!title) {
        alert("Title is required.");
        return;
      }

      upsertCollection(editId, { title, tag, description });
      window.location.href = "dashboard.html";
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
  }
});
