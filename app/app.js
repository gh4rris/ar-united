import { API_BASE_URL, PRIVATE_PAGES, LOGOUT_ONLY } from './config.js';

const routes = {
    '/': () => import('./pages/home.js'),
    '/create_account': () => import('./pages/create_account.js'),
    '/edit_profile': () => import('./pages/edit_profile.js'),
    '/login': () => import('./pages/login.js'),
    '/activists': () => import('./pages/activists.js'),
    '/allies': () => import('./pages/allies.js'),
    '/create_group': () => import('./pages/create_group.js'),
    '/user_groups': () => import('./pages/user_groups.js'),
    '/groups': () => import('./pages/groups.js'),
    '/search': () => import('./pages/search.js')
};

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
    const appElement = document.getElementById('app');
    let path = window.location.pathname.split("/");
    const userSub = path.length > 3;
    path = userSub ? "/"+path[3] : "/"+path[1];
    if (path === '/groups' && userSub) {
        path = '/user_groups'
    }
    
    const loader = routes[path];
    const token = localStorage.accessToken;
    if (PRIVATE_PAGES.includes(path)) {
        if (!token) {
            window.location.replace('/');
            return
        }
        const valid = await validateToken();
        if (!valid) {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            window.location.replace('/');
            return
        }
    } else if (LOGOUT_ONLY.includes(path) && token) {
        const valid = await validateToken();
        if (!valid) {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            window.location.replace('/');
            return
        }
        const slug = JSON.parse(localStorage.user).slug;
        window.location.replace(`/activists/${slug}`);
        return
    }

    if (loader) {
        const module = await loader();
        
        appElement.innerHTML = module.default();
        if (typeof(module.homeEvents) === 'function') {
            module.homeEvents();
        } else if (typeof(module.createAccountEvents) === 'function') {
            module.createAccountEvents();
        } else if (typeof(module.loginEvents) === 'function') {
            module.loginEvents();
        } else if (typeof(module.editProfileEvents) === 'function') {
            module.editProfileEvents();
        } else if (typeof(module.activistEvents) === 'function') {
            module.activistEvents();
        } else if (typeof(module.alliesEvents) === 'function') {
            module.alliesEvents();
        } else if (typeof(module.createGroupEvents) === 'function') {
            module.createGroupEvents();
        } else if (typeof(module.userGroupEvents) === 'function') {
            module.userGroupEvents();
        } else if (typeof(module.groupEvents) === 'function') {
            module.groupEvents();
        } else if (typeof(module.searchEvents) === 'function') {
            module.searchEvents();
        }
    } else {
        appElement.innerHTML = `
        <h1>404</h1>
        <p>Page not found</p>`;
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