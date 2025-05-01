import { API_BASE_URL } from './config.js';

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
    if (['/profile', '/edit_profile'].includes(path)) {
        if (!token) {
            window.location.replace('/');
            return
        }
        const valid = await validateToken();
        if (!valid) {
            window.location.replace('/');
            return
        }
    } else if (path === '/login' && token) {
        const valid = await validateToken();
        if (valid) {
            window.location.replace('/profile');
            return
        }
    }

    if (loader) {
        const module = await loader();
        
        appElement.innerHTML = module.default();
        if (typeof(module.loginEvents) === 'function') {
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

async function validateToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/validate-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error("invalid access token");
        }
        return response.ok
    }
    catch(error) {
        console.log(error);
    }
}