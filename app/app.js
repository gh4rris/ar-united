import { API_BASE_URL } from './config.js';
import { renderHome } from './pages/home.js'
import { renderCreateAccount } from './pages/create_account.js'
import { renderLogin } from './pages/login.js'
import { renderEditProfile } from './pages/edit_profile.js'
import { renderUploadProfilePic } from './pages/upload_profile_pic.js';
import { renderActivist } from './pages/activists.js'
import { renderAllies } from './pages/allies.js'
import { renderCreateGroup } from './pages/create_group.js'
import { renderUserGroups } from './pages/user_groups.js'
import { renderGroup } from './pages/groups.js'
import { renderGroupMembers } from './pages/group_members.js';
import { renderGroupEvents } from './pages/group_events.js';
import { renderCreateEvent } from './pages/create_event.js'
import { renderSearch } from './pages/search.js'
import { renderUserEvents } from './pages/user_events.js';
import { renderEvent } from './pages/events.js';


const routes = [
    { pattern: /^\/$/, handler: () => renderHome() , private: false },
    { pattern: /^\/create_account$/, handler: () => renderCreateAccount(), private: false },
    { pattern: /^\/login$/, handler: () => renderLogin(), private: false },
    { pattern: /^\/(activists)\/([\w-]+)$/, handler: (activist) => renderActivist(activist), private: true },
    { pattern: /^\/(activists)\/([\w-]+)\/edit_profile$/, handler: (activist) => renderEditProfile(activist), private: true },
    { pattern: /^\/(activists)\/([\w-]+)\/upload_profile_pic$/, handler: (activist) => renderUploadProfilePic(activist), private: true },
    { pattern: /^\/(activists)\/([\w-]+)\/allies$/, handler: (activist) => renderAllies(activist), private: true },
    { pattern: /^\/groups\/create_group$/, handler: () => renderCreateGroup(), private: true },
    { pattern: /^\/(activists)\/([\w-]+)\/groups$/, handler: (activist) => renderUserGroups(activist), private: true },
    { pattern: /^\/(groups)\/(\w+)$/, handler: (group) => renderGroup(group), private: true },
    { pattern: /^\/(groups)\/(\w+)\/members$/, handler: (group) => renderGroupMembers(group), private: true },
    { pattern: /^\/(groups)\/(\w+)\/events$/, handler: (group) => renderGroupEvents(group), private: true },
    { pattern: /^\/(groups)\/(\w+)\/create_event$/, handler: (group) => renderCreateEvent(group), private: true },
    { pattern: /^\/(activists)\/([\w-]+)\/events$/, handler: (activist) => renderUserEvents(activist), private: true },
    { pattern: /^\/(events)\/(\w+)$/, handler: (event) => renderEvent(event), private: true },
    { pattern: /^\/search$/, handler: () => renderSearch(), private: true }
];

const app = document.getElementById('app');
const profileLink = document.getElementById('profile-link');
const createGroupLink = document.getElementById('create-group-link');
const logout = document.getElementById('logout');
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const searchSelect = document.getElementById('search-type');

main();

async function main() {
    const database = await checkDatabase();
    if (!database) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    }
    searchBtn.addEventListener('click', async () => {
        const type = document.getElementById('search-type').value.toLowerCase();
        const url = `/search?value=${encodeURIComponent(searchInput.value)}&type=${encodeURIComponent(type)}`;
        await navigateTo(url);
    });
    logout.addEventListener('click', async (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        history.replaceState(null, '', '/');
        removeElements();
        await renderPage();
        await revokeRefreshToken();
    })
    
    if (localStorage.user) {
        profileLink.href = `/activists/${JSON.parse(localStorage.user).slug}`;
    } else {
        removeElements();
    }
    
    window.addEventListener('popstate', renderPage);

    navigateTo(window.location.url);
}

function removeElements() {
    searchInput.remove();
    searchBtn.remove();
    searchSelect.remove();
    profileLink.remove();
    createGroupLink.remove();
    logout.remove();
}

async function navigateTo(url) {
    history.pushState(null, null, url);
    await renderPage();
}

async function renderPage() {
    const path = window.location.pathname;
    const user = localStorage.user ? JSON.parse(localStorage.user) : null;
    const validToken = localStorage.accessToken ? await validateToken() : false;
    for (const route of routes) {
        const match = path.match(route.pattern);
        if (match) {
            if (route.private && !validToken) {
                window.location.replace('/');
                return
            } else if (!route.private && validToken) {
                window.location.replace(`/activists/${user.slug}`);
                return
            }

            if (match.length > 1) {
                if (match[1] === 'activists') {
                    if (match[1] != user.slug) {
                        const activist = await getActivist(match[2]);
                        if (!activist) {
                            renderNotFound();
                            return
                        }
                        route.handler(activist);
                        return
                    }
                    route.handler(user);
                    return
                } else if (match[1] === 'groups') {
                    const group = await getGroup(match[2]);
                    if (!group) {
                            renderNotFound();
                            return
                        }
                    route.handler(group);
                    return
                } else if (match[1] === 'events') {
                    const event = await getEvent(match[2]);
                    if (!event) {
                            renderNotFound();
                            return
                        }
                    route.handler(event);
                    return
                } else {
                    renderNotFound();
                    return
                }
            }
            route.handler();
            return
        }
    };
    renderNotFound()
}

function renderNotFound() {
    app.innerHTML = `
    <h1>404</h1>
    <p>Page not found</p>`;
    return
}

async function getActivist(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${slug}`);
        if (!response.ok) {
            throw new Error("couldn't find user");
        }
        const activist = await response.json();
        return activist.user;
    }
    catch(error) {
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
    }
    catch(error) {
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
    }
    catch(error) {
        console.error(error.message);
    }
}

export async function validateToken(retries=1) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/validate-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.accessToken}`
            }
        });
        if (retries > 0 && response.status === 401) {
            await refreshAccessToken();
            return await validateToken(retries - 1);
        }
        if (!response.ok) {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            throw new Error("invalid access token");
            
        }
        return response.ok;
    }
    catch(error) {
        console.log(error.message);
    }
}

export async function refreshAccessToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/refresh`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("couldn't refresh access token");
        }
        const responseData = await response.json();
        localStorage.setItem('accessToken', responseData.token);
        return
    }
    catch(error) {
        console.error(error.message);
    }
}

async function revokeRefreshToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/revoke`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("coudn't revoke token");
        }
    }
    catch(error) {
        console.error(error.message);
    }
}

async function checkDatabase() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`);
        if (!response.ok) {
            throw new Error("couldn't check database");
        }
        const responseData = await response.json();
        return responseData.entries;
    }
    catch(error) {
        console.error(error.message);
    }
}