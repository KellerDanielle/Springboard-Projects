"use strict";

// Story-related DOM elements
const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoritedStories = $("#favorited-stories");
const $ownStories = $("#my-stories");
const $storiesContainer = $("#stories-container");

// Selector that finds all three story lists
const $storiesLists = $(".stories-list");

// Form-related DOM elements
const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $submitForm = $("#submit-form");

// Navigation-related DOM elements
const $navSubmitStory = $("#nav-submit-story");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

// User profile DOM element
const $userProfile = $("#user-profile");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */
function hidePageComponents() {
  const components = [
    $storiesLists,
    $submitForm,
    $loginForm,
    $signupForm,
    $userProfile
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */
async function start() {
  console.debug("start");

  try {
    // "Remember logged-in user" and log in, if credentials in localStorage
    await checkForRememberedUser();
    await getAndShowStoriesOnStart();

    // if we got a logged-in user
    if (currentUser) updateUIOnUserLogin();
  } catch (error) {
    console.error("Error starting the app:", error);
  }
}

// Once the DOM is entirely loaded, begin the app
console.warn(`HEY STUDENT: This program sends many debug messages to
the console. If you don't see the message 'start' below this, you're not
seeing those helpful debug messages. In your browser console, click on
menu 'Default Levels' and add Verbose`);
$(start);
