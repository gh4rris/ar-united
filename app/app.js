import { API_BASE_URL } from './config.js';
import { RenderHome } from './pages/home.js'
import { RenderCreateAccount } from './pages/create_account.js'
import { RenderLogin } from './pages/login.js'
import { RenderEditProfile } from './pages/edit_profile.js'
import { RenderActivist } from './pages/activists.js'
import { RenderAllies } from './pages/allies.js'
import { RenderCreateGroup } from './pages/create_group.js'
import { RenderUserGroups } from './pages/user_groups.js'
import { RenderGroup } from './pages/groups.js'
import { RenderCreateEvent } from './pages/create_event.js'
import { RenderSearch } from './pages/search.js'


const routes = [
    { pattern: /^\/$/, handler: () => RenderHome() , private: false },
    { pattern: /^\/create_account$/, handler: () => RenderCreateAccount(), private: false },
    { pattern: /^\/login$/, handler: () => RenderLogin(), private: false },
    { pattern: /^\/(activists)\/([\w-]+)$/, handler: (activist) => RenderActivist(activist), private: true },
    { pattern: /^\/(activists)\/([\w-]+)\/edit_profile$/, handler: (activist) => RenderEditProfile(activist), private: true },
    { pattern: /^\/(activists)\/([\w-]+)\/allies$/, handler: (activist) => RenderAllies(activist), private: true },
    { pattern: /^\/groups\/create_group$/, handler: () => RenderCreateGroup(), private: true },
    { pattern: /^\/(activists)\/([\w-]+)\/groups$/, handler: (activist) => RenderUserGroups(activist), private: true },
    { pattern: /^\/(groups)\/(\w+)$/, handler: (group) => RenderGroup(group), private: true },
    { pattern: /^\/(groups)\/(\w+)\/create_event$/, handler: (group) => RenderCreateEvent(group), private: true },
    { pattern: /^\/search$/, handler: () => RenderSearch(), private: true }
];

main();

async function main() {
    const database = await checkDatabase();
    if (!database) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    }

    document.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    })
    const logout = document.getElementById('logout');
    logout.addEventListener('click', async (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        history.replaceState(null, '', '/');
        await renderPage();
        await revokeRefreshToken();
    })
    const searchBtn = document.getElementById('search-btn');
    searchBtn.addEventListener('click', async () => {
        const searchInput = document.getElementById('search-input').value;
        const type = document.getElementById('search-type').value.toLowerCase();
        const url = `/search?value=${encodeURIComponent(searchInput)}&type=${encodeURIComponent(type)}`;
        await navigateTo(url);
    })
    const slug = localStorage.user ? JSON.parse(localStorage.user).slug : undefined;
    const profileLink = document.getElementById('profile-link');
    const alliesLink = document.getElementById('allies-link');
    const groupsLink = document.getElementById('groups-link');
    profileLink.href = slug ? `/activists/${slug}` : "/";
    alliesLink.href = slug ? `/activists/${slug}/allies` : "/";
    groupsLink.href = slug ? `/activists/${slug}/groups` : "/";
    
    window.addEventListener('popstate', renderPage);

    navigateTo(window.location.url);
}

async function navigateTo(url) {
    history.pushState(null, null, url);
    await renderPage();
}

async function renderPage() {
    const path = window.location.pathname;
    const token = localStorage.accessToken;
    const valid = token ? await validateToken() : false;
    const user = JSON.parse(localStorage.user);
    for (const route of routes) {
        const match = path.match(route.pattern);
        if (match) {
            if (route.private && !valid) {
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                window.location.replace('/');
                return
            } else if (!route.private && valid) {
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
                        }
                    route.handler(group);
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
    document.getElementById('app').innerHTML = `
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
        // renderNotFound();
    }
}

async function getGroup(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/groups/${slug}`);
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