"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

// Event handler for showing the main list of all stories
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

// Event handler for showing the story submit form
function navSubmitStoryClick(evt) {
  console.debug("navSubmitStoryClick", evt);
  hidePageComponents();
  $allStoriesList.show();
  $submitForm.show();
}

// Event handler for showing favorite stories
function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  putFavoritesListOnPage();
}

// Event handler for showing user's own stories
function navMyStories(evt) {
  console.debug("navMyStories", evt);
  hidePageComponents();
  putUserStoriesOnPage();
  $ownStories.show();
}

// Event handler for showing the login/signup form
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
  $storiesContainer.hide();
}

// Event handler for showing the user profile
function navProfileClick(evt) {
  console.debug("navProfileClick", evt);
  hidePageComponents();
  $userProfile.show();
}

// Update navbar on user login
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  document.querySelector(".main-nav-links").style.display = 'flex';
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// Attach event handlers to navbar items
document.querySelector("#nav-all").addEventListener("click", navAllStories);
$navSubmitStory.on("click", navSubmitStoryClick);
document.querySelector("#nav-favorites").addEventListener("click", navFavoritesClick);
document.querySelector("#nav-my-stories").addEventListener("click", navMyStories);
$navLogin.on("click", navLoginClick);
$navUserProfile.on("click", navProfileClick);
