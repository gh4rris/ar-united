const routes = {
    '/': () => import('./pages/home.js'),
    '/login': () => import('./pages/login.js'),
    '/create_account': () => import('./pages/create_account.js'),
    '/profile': () => import('./pages/profile.js')
};


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
    document.addEventListener('DOMContentLoaded', renderPage);
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
    if (path === '/profile') {
        if (!token) {
            window.location.replace('/');
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
        }
    } else {
        appElement.innerHTML = `
        <h1>404</h1>
        <p>Page not found</p>`;
    }
}

main();