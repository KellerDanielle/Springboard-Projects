"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  try {
    // User.login retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    currentUser = await User.login(username, password);
    resetLoginForm();
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  } catch (err) {
    console.error("Login failed", err);
    alert("Login failed: " + err.message);
  }
}

document.getElementById("login-form").addEventListener("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = document.getElementById("signup-name").value;
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  if (!name || !username || !password) {
    alert("Please fill out all fields.");
    return;
  }

  try {
    // User.signup retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    currentUser = await User.signup(username, password, name);
    resetSignupForm();
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  } catch (err) {
    console.error("Signup failed", err);
    alert("Signup failed: " + err.message);
  }
}

document.getElementById("signup-form").addEventListener("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

document.getElementById("nav-logout").addEventListener("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  try {
    // try to log in with these credentials (will be null if login failed)
    currentUser = await User.loginViaStoredCredentials(token, username);
  } catch (err) {
    console.error("Login via stored credentials failed", err);
  }
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users & profiles
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

async function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  hidePageComponents();

  // re-display stories (so that "favorite" stars can appear)
  putStoriesOnPage();
  document.getElementById("all-stories-list").style.display = "block";

  updateNavOnLogin();
  generateUserProfile();
  document.getElementById("stories-container").style.display = "block";
}

/** Show a "user profile" part of page built from the current user's info. */

function generateUserProfile() {
  console.debug("generateUserProfile");

  document.getElementById("profile-name").textContent = currentUser.name;
  document.getElementById("profile-username").textContent = currentUser.username;
  document.getElementById("profile-account-date").textContent = currentUser.createdAt.slice(0, 10);
}

/** Reset login form inputs */

function resetLoginForm() {
  document.getElementById("login-form").reset();
}

/** Reset signup form inputs */

function resetSignupForm() {
  document.getElementById("signup-form").reset();
}
