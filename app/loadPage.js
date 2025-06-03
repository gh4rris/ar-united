import { API_BASE_URL } from "./config.js";
import { validateToken, revokeRefreshToken } from "./token.js";
import { renderHome } from "./pages/home.js";
import { renderCreateAccount } from "./pages/create_account.js";
import { renderLogin } from "./pages/login.js";
import { renderEditProfile } from "./pages/edit_profile.js";
import { renderUploadProfilePic } from "./pages/upload_profile_pic.js";
import { renderActivist } from "./pages/activists.js";
import { renderAllies } from "./pages/allies.js";
import { renderCreateGroup } from "./pages/create_group.js";
import { renderUserGroups } from "./pages/user_groups.js";
import { renderGroup } from "./pages/groups.js";
import { renderGroupMembers } from "./pages/group_members.js";
import { renderGroupEvents } from "./pages/group_events.js";
import { renderCreateEvent } from "./pages/create_event.js";
import { renderSearch } from "./pages/search.js";
import { renderUserEvents } from "./pages/user_events.js";
import { renderEvent } from "./pages/events.js";
import { renderEventAttendees } from "./pages/event_attendees.js";

const routes = [
  { pattern: /^\/$/, handler: () => renderHome(), private: false },
  {
    pattern: /^\/create_account$/,
    handler: () => renderCreateAccount(),
    private: false,
  },
  { pattern: /^\/login$/, handler: () => renderLogin(), private: false },
  {
    pattern: /^\/(activists)\/([\w-]+)$/,
    handler: (activist) => renderActivist(activist),
    private: true,
  },
  {
    pattern: /^\/(activists)\/([\w-]+)\/edit_profile$/,
    handler: (activist) => renderEditProfile(activist),
    private: true,
  },
  {
    pattern: /^\/(activists)\/([\w-]+)\/upload_profile_pic$/,
    handler: (activist) => renderUploadProfilePic(activist),
    private: true,
  },
  {
    pattern: /^\/(activists)\/([\w-]+)\/allies$/,
    handler: (activist) => renderAllies(activist),
    private: true,
  },
  {
    pattern: /^\/groups\/create_group$/,
    handler: () => renderCreateGroup(),
    private: true,
  },
  {
    pattern: /^\/(activists)\/([\w-]+)\/groups$/,
    handler: (activist) => renderUserGroups(activist),
    private: true,
  },
  {
    pattern: /^\/(groups)\/(\w+)$/,
    handler: (group) => renderGroup(group),
    private: true,
  },
  {
    pattern: /^\/(groups)\/(\w+)\/members$/,
    handler: (group) => renderGroupMembers(group),
    private: true,
  },
  {
    pattern: /^\/(groups)\/(\w+)\/events$/,
    handler: (group) => renderGroupEvents(group),
    private: true,
  },
  {
    pattern: /^\/(groups)\/(\w+)\/create_event$/,
    handler: (group) => renderCreateEvent(group),
    private: true,
  },
  {
    pattern: /^\/(activists)\/([\w-]+)\/events$/,
    handler: (activist) => renderUserEvents(activist),
    private: true,
  },
  {
    pattern: /^\/(events)\/(\w+)$/,
    handler: (event) => renderEvent(event),
    private: true,
  },
  {
    pattern: /^\/(events)\/(\w+)\/attending$/,
    handler: (event) => renderEventAttendees(event),
    private: true,
  },
  { pattern: /^\/search$/, handler: () => renderSearch(), private: true },
];

export async function navigateTo(url) {
  history.pushState(null, null, url);
  await renderPage();
}

export async function renderPage() {
  const path = window.location.pathname;
  const validToken = localStorage.accessToken ? await validateToken() : false;
  const user = localStorage.user ? JSON.parse(localStorage.user) : null;
  const navBar = document.getElementById("nav-bar");

  if (validToken && navBar.style.display === "none") {
    renderNavBar(user, navBar);
  } else if (!validToken) {
    navBar.style.display = "none";
  }

  for (const route of routes) {
    const match = path.match(route.pattern);
    if (match) {
      if (route.private && !validToken) {
        window.location.replace("/");
        return;
      } else if (!route.private && validToken) {
        window.location.replace(`/activists/${user.slug}`);
        return;
      }

      if (match.length > 1) {
        if (match[1] === "activists") {
          if (match[1] != user.slug) {
            const activist = await getActivist(match[2]);
            if (!activist) {
              renderNotFound();
              return;
            }
            route.handler(activist);
            return;
          }
          route.handler(user);
          return;
        } else if (match[1] === "groups") {
          const group = await getGroup(match[2]);
          if (!group) {
            renderNotFound();
            return;
          }
          route.handler(group);
          return;
        } else if (match[1] === "events") {
          const event = await getEvent(match[2]);
          if (!event) {
            renderNotFound();
            return;
          }
          route.handler(event);
          return;
        } else {
          renderNotFound();
          return;
        }
      }
      route.handler();
      return;
    }
  }
  renderNotFound();
}

function renderNotFound() {
  document.getElementById("app").innerHTML = `
    <h1>404</h1>
    <p>Page not found</p>`;
  return;
}

function renderNavBar(user, navBar) {
  navBar.style.display = "block";
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  const logout = document.getElementById("logout");
  const profileLink = document.getElementById("profile-link");
  profileLink.href = `/activists/${user.slug}`;
  searchBtn.addEventListener("click", async () => {
    const type = document.getElementById("search-type").value.toLowerCase();
    const url = `/search?value=${encodeURIComponent(searchInput.value)}&type=${encodeURIComponent(type)}`;
    await navigateTo(url);
  });
  logout.addEventListener("click", async (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    navBar.style.display = "none";
    history.replaceState(null, "", "/");
    await renderPage();
    await revokeRefreshToken();
  });
}

async function getActivist(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${slug}`);
    if (!response.ok) {
      throw new Error("couldn't find user");
    }
    const activist = await response.json();
    return activist.user;
  } catch (error) {
    console.error(error.message);
  }
}

async function getGroup(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups/${slug}/slug`);
    if (!response.ok) {
      throw new Error("couldn't get group");
    }
    const responseData = await response.json();
    return responseData.group;
  } catch (error) {
    console.error(error.message);
  }
}

async function getEvent(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/${slug}`);
    if (!response.ok) {
      throw new Error("couldn't get event");
    }
    const responseData = await response.json();
    return responseData.event;
  } catch (error) {
    console.error(error.message);
  }
}
