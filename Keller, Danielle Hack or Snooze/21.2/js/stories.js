"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

// Constants for class names
const CLASS_FAVORITE = "fas";
const CLASS_NOT_FAVORITE = "far";
const CLASS_TRASH_CAN = "trash-can";
const CLASS_STORY_LINK = "story-link";
const CLASS_STORY_HOSTNAME = "story-hostname";
const CLASS_STORY_AUTHOR = "story-author";
const CLASS_STORY_USER = "story-user";

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  try {
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();
    displayStoriesOnPage();
  } catch (error) {
    console.error("Failed to get and show stories", error);
    alert("Failed to load stories. Please try again later.");
  }
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * - showDeleteBtn: show delete button?
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story, showDeleteBtn = false) {
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);

  return $(`
    <li id="${story.storyId}">
      <div>
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="${CLASS_STORY_LINK}">
          ${story.title}
        </a>
        <small class="${CLASS_STORY_HOSTNAME}">(${hostName})</small>
        <div class="${CLASS_STORY_AUTHOR}">by ${story.author}</div>
        <div class="${CLASS_STORY_USER}">posted by ${story.username}</div>
      </div>
    </li>
  `);
}

/** Make delete button HTML for story */
function getDeleteBtnHTML() {
  return `<span class="${CLASS_TRASH_CAN}"><i class="fas fa-trash-alt"></i></span>`;
}

/** Make favorite/not-favorite star for story */
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? CLASS_FAVORITE : CLASS_NOT_FAVORITE;
  return `<span class="star"><i class="${starType} fa-star"></i></span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function displayStoriesOnPage() {
  console.debug("displayStoriesOnPage");

  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Handle deleting a story. */
async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  try {
    await storyList.removeStory(currentUser, storyId);
    displayUserStoriesOnPage();
  } catch (error) {
    console.error("Failed to delete story", error);
    alert("Failed to delete story. Please try again later.");
  }
}

$ownStories.on("click", `.${CLASS_TRASH_CAN}`, deleteStory);

/** Handle submitting new story form. */
async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username;
  const storyData = { title, url, author, username };

  try {
    const story = await storyList.addStory(currentUser, storyData);
    const $story = generateStoryMarkup(story);
    $allStoriesList.prepend($story);
    $submitForm.slideUp("slow");
    $submitForm.trigger("reset");
  } catch (error) {
    console.error("Failed to submit new story", error);
    alert("Failed to submit new story. Please try again later.");
  }
}

$submitForm.on("submit", submitNewStory);

/******************************************************************************
 * Functionality for list of user's own stories
 */
function displayUserStoriesOnPage() {
  console.debug("displayUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  $ownStories.show();
}

/******************************************************************************
 * Functionality for favorites list and star/unstar a story
 */
function displayFavoritesListOnPage() {
  console.debug("displayFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

/** Handle favorite/un-favorite a story */
async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  try {
    if ($tgt.hasClass(CLASS_FAVORITE)) {
      await currentUser.removeFavorite(story);
      $tgt.closest("i").toggleClass(`${CLASS_FAVORITE} ${CLASS_NOT_FAVORITE}`);
    } else {
      await currentUser.addFavorite(story);
      $tgt.closest("i").toggleClass(`${CLASS_NOT_FAVORITE} ${CLASS_FAVORITE}`);
    }
  } catch (error) {
    console.error("Failed to toggle favorite", error);
    alert("Failed to toggle favorite. Please try again later.");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);
