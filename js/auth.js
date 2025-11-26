// js/auth.js

const AUTH_USER_KEY = "user";

/**
 * For now we simulate a logged-in user.
 * Set DEMO_LOGGED_IN = false to see guest view.
 */
const DEMO_LOGGED_IN = true;

if (DEMO_LOGGED_IN && !localStorage.getItem(AUTH_USER_KEY)) {
  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({ id: 1, username: "demoUser" })
  );
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY));
  } catch (e) {
    return null;
  }
}

function isLoggedIn() {
  return Boolean(getCurrentUser());
}

function initAuthUI() {
  const guestNav = document.getElementById("guestNav");
  const userMenu = document.getElementById("userMenu");
  const userNameLabel = document.getElementById("userNameLabel");

  const loggedIn = isLoggedIn();
  const user = getCurrentUser();

  // Elements that only appear when logged in
  const authOnlyEls = document.querySelectorAll(".hidden-when-guest");

  if (loggedIn && user) {
    if (guestNav) guestNav.style.display = "none";
    if (userMenu) userMenu.style.display = "flex";
    if (userNameLabel) userNameLabel.textContent = user.username;

    authOnlyEls.forEach((el) => (el.style.display = ""));
  } else {
    if (guestNav) guestNav.style.display = "flex";
    if (userMenu) userMenu.style.display = "none";

    authOnlyEls.forEach((el) => (el.style.display = "none"));
  }
}

document.addEventListener("DOMContentLoaded", initAuthUI);
