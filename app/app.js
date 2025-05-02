import { API_BASE_URL, PRIVATE_PAGES, LOGOUT_ONLY } from './config.js';

const routes = {
    '/': () => import('./pages/home.js'),
    '/login': () => import('./pages/login.js'),
    '/create_account': () => import('./pages/create_account.js'),
    '/profile': () => import('./pages/profile.js'),
    '/edit_profile': () => import('./pages/edit_profile.js')
};

main();

function main() {
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
    
    window.addEventListener('popstate', renderPage);
    navigateTo(window.location.pathname);
}

async function navigateTo(url) {
    history.pushState(null, null, url);
    await renderPage();
}

async function renderPage() {
    const appElement = document.getElementById('app');
    const path = window.location.pathname;
    const loader = routes[path];
    const token = localStorage.getItem('accessToken');
    if (PRIVATE_PAGES.includes(path)) {
        if (!token) {
            window.location.replace('/');
            return
        }
        const valid = await validateToken();
        if (!valid) {
            window.location.replace('/');
            return
        }
    } else if (LOGOUT_ONLY.includes(path) && token) {
        const valid = await validateToken();
        if (valid) {
            window.location.replace('/profile');
            return
        }
    }

    if (loader) {
        const module = await loader();
        
        appElement.innerHTML = module.default();
        if (typeof(module.homeEvents) === 'function') {
            module.homeEvents();
        } else if (typeof(module.loginEvents) === 'function') {
            module.loginEvents();
        } else if (typeof(module.createAccountEvents) === 'function') {
            module.createAccountEvents();
        } else if (typeof(module.profileEvents) === 'function') {
            module.profileEvents();
        } else if (typeof(module.editProfileEvents) === 'function') {
            module.editProfileEvents();
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
        return response.ok
    }
    catch(error) {
        console.log(error);
    }
}

export async function refreshAccessToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/refresh`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("couldn't refresh access token")
        }
        const responseData = await response.json();
        localStorage.setItem('accessToken', responseData.token);
        return
    }
    catch(error) {
        console.error(error)
    }
}

async function revokeRefreshToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/revoke`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error("coudn't revoke token")
        }
    }
    catch(error) {
        console.error(error)
    }
}