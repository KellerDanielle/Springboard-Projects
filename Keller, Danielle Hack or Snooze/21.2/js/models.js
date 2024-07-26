"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /**
   * Creates an instance of Story.
   * @param {Object} storyData - An object containing story details.
   * @param {string} storyData.storyId - The ID of the story.
   * @param {string} storyData.title - The title of the story.
   * @param {string} storyData.author - The author of the story.
   * @param {string} storyData.url - The URL of the story.
   * @param {string} storyData.username - The username of the story poster.
   * @param {string} storyData.createdAt - The creation date of the story.
   */
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /**
   * Parses hostname out of URL and returns it.
   * @returns {string} The hostname of the URL.
   */
  getHostName() {
    return new URL(this.url).host;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /**
   * Generates a new StoryList. Calls the API, builds an array of Story instances,
   * and returns a StoryList instance.
   * @param {Object} httpClient - The HTTP client for making requests (default is axios).
   * @returns {Promise<StoryList>} The StoryList instance.
   */
  static async getStories(httpClient = axios) {
    try {
      const response = await httpClient.get(`${BASE_URL}/stories`);
      const stories = response.data.stories.map(story => new Story(story));
      return new StoryList(stories);
    } catch (error) {
      console.error("Failed to fetch stories", error);
      throw new Error("Failed to fetch stories");
    }
  }

  /**
   * Adds story data to API, makes a Story instance, and adds it to story list.
   * @param {User} user - The current instance of User who will post the story.
   * @param {Object} storyData - An object containing the story details.
   * @param {string} storyData.title - The title of the story.
   * @param {string} storyData.author - The author of the story.
   * @param {string} storyData.url - The URL of the story.
   * @param {Object} httpClient - The HTTP client for making requests (default is axios).
   * @returns {Promise<Story>} The new Story instance.
   */
  async addStory(user, { title, author, url }, httpClient = axios) {
    if (!title || !author || !url) {
      throw new Error("Title, author, and URL are required");
    }

    try {
      const token = user.loginToken;
      const response = await httpClient.post(`${BASE_URL}/stories`, {
        token,
        story: { title, author, url }
      });
      const story = new Story(response.data.story);
      this._addToStoryLists(user, story);
      return story;
    } catch (error) {
      console.error("Failed to add story", error);
      throw new Error("Failed to add story");
    }
  }

  /**
   * Deletes story from API and removes it from the story lists.
   * @param {User} user - The current User instance.
   * @param {string} storyId - The ID of the story to remove.
   * @param {Object} httpClient - The HTTP client for making requests (default is axios).
   * @returns {Promise<void>}
   */
  async removeStory(user, storyId, httpClient = axios) {
    try {
      const token = user.loginToken;
      await httpClient.delete(`${BASE_URL}/stories/${storyId}`, {
        data: { token }
      });
      this._removeFromStoryLists(user, storyId);
    } catch (error) {
      console.error("Failed to remove story", error);
      throw new Error("Failed to remove story");
    }
  }

  /**
   * Adds a story to the internal story lists.
   * @param {User} user - The current User instance.
   * @param {Story} story - The Story instance to add.
   * @private
   */
  _addToStoryLists(user, story) {
    this.stories.unshift(story);
    user.ownStories.unshift(story);
  }

  /**
   * Removes a story from the internal story lists.
   * @param {User} user - The current User instance.
   * @param {string} storyId - The ID of the story to remove.
   * @private
   */
  _removeFromStoryLists(user, storyId) {
    this.stories = this.stories.filter(story => story.storyId !== storyId);
    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
    user.favorites = user.favorites.filter(s => s.storyId !== storyId);
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /**
   * Creates an instance of User.
   * @param {Object} userData - An object containing user details.
   * @param {string} userData.username - The username of the user.
   * @param {string} userData.name - The name of the user.
   * @param {string} userData.createdAt - The creation date of the user.
   * @param {Array} userData.favorites - The user's favorite stories.
   * @param {Array} userData.ownStories - The user's own stories.
   * @param {string} token - The login token of the user.
   */
  constructor({ username, name, createdAt, favorites = [], ownStories = [] }, token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));
    this.loginToken = token;
  }

  /**
   * Registers a new user in the API, creates a User instance, and returns it.
   * @param {string} username - The new username.
   * @param {string} password - The new password.
   * @param {string} name - The user's full name.
   * @param {Object} httpClient - The HTTP client for making requests (default is axios).
   * @returns {Promise<User>} The new User instance.
   */
  static async signup(username, password, name, httpClient = axios) {
    try {
      const response = await httpClient.post(`${BASE_URL}/signup`, {
        user: { username, password, name }
      });
      let { user, token } = response.data;
      return new User({ ...user }, token);
    } catch (error) {
      console.error("Failed to sign up user", error);
      throw new Error("Failed to sign up user");
    }
  }

  /**
   * Logs in a user with the API, creates a User instance, and returns it.
   * @param {string} username - An existing user's username.
   * @param {string} password - An existing user's password.
   * @param {Object} httpClient - The HTTP client for making requests (default is axios).
   * @returns {Promise<User>} The User instance.
   */
  static async login(username, password, httpClient = axios) {
    try {
      const response = await httpClient.post(`${BASE_URL}/login`, {
        user: { username, password }
      });
      let { user, token } = response.data;
      return new User({ ...user }, token);
    } catch (error) {
      console.error("Failed to log in user", error);
      throw new Error("Failed to log in user");
    }
  }

  /**
   * Logs in a user automatically using stored credentials.
   * @param {string} token - The login token.
   * @param {string} username - The username.
   * @param {Object} httpClient - The HTTP client for making requests (default is axios).
   * @returns {Promise<User|null>} The User instance or null if login failed.
   */
  static async loginViaStoredCredentials(token, username, httpClient = axios) {
    try {
      const response = await httpClient.get(`${BASE_URL}/users/${username}`, {
        params: { token }
      });
      let { user } = response.data;
      return new User({ ...user }, token);
    } catch (error) {
      console.error("loginViaStoredCredentials failed", error);
      return null;
    }
  }

  /**
   * Adds a story to the list of user favorites and updates the API.
   * @param {Story} story - The Story instance to add to favorites.
   * @param {Object} httpClient - The HTTP client for making requests (default is axios).
   * @returns {Promise<void>}
   */
  async addFavorite(story, httpClient = axios) {
    try {
      this.favorites.push(story);
      await this._updateFavorite("add", story, httpClient);
    } catch (error) {
      console.error("Failed to add favorite", error);
      throw new Error("Failed to add favorite");
    }
  }

  /**
   * Removes a story from the list of user favorites and updates the API.
   * @param {Story} story - The Story instance to remove from favorites.
   * @param {Object} httpClient - The HTTP client for making requests (default is axios).
   * @returns {Promise<void>}
   */
  async removeFavorite(story, httpClient = axios) {
    try {
      this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
      await this._updateFavorite("remove", story, httpClient);
    } catch (error) {
      console.error("Failed to remove favorite", error);
      throw new Error("Failed to remove favorite");
    }
  }

  /**
   * Updates the API with favorite/not-favorite.
   * @param {string} newState - "add" or "remove".
   * @param {Story} story - The Story instance to update.
   * @param {Object} httpClient - The HTTP client for making requests (default is axios).
   * @private
   * @returns {Promise<void>}
   */
  async _updateFavorite(newState, story, httpClient) {
    try {
      const method = newState === "add" ? "POST" : "DELETE";
      const token = this.loginToken;
      await httpClient({
        url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
        method,
        data: { token }
      });
    } catch (error) {
      console.error(`Failed to ${newState} favorite`, error);
      throw new Error(`Failed to ${newState} favorite`);
    }
  }

  /**
   * Checks if a given Story instance is a favorite of this user.
   * @param {Story} story - The Story instance to check.
   * @returns {boolean} True if the story is a favorite, false otherwise.
   */
  isFavorite(story) {
    return this.favorites.some(s => s.storyId === story.storyId);
  }
}
