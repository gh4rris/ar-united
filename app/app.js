const routes = {
    '/': () => import('./pages/home.js'),
    '/login': () => import('./pages/login.js'),
    '/create_account': () => import('./pages/create_account.js')
};

const appElement = document.getElementById('app');

function main() {
    document.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    })
    
    window.addEventListener('popstate', renderPage);
    document.addEventListener('DOMContentLoaded', renderPage);
    navigateTo('/');
}

async function navigateTo(url) {
    history.pushState(null, null, url);
    await renderPage();
}

async function renderPage() {
    const path = window.location.pathname;
    const loader = routes[path];

    if (loader) {
        const module = await loader();
        appElement.innerHTML = module.default();
        if (typeof(module.loginEvents) === 'function') {
            module.loginEvents();
        } else if (typeof(module.createAccountEvents) === 'function') {
            module.createAccountEvents();
        }
    } else {
        appElement.innerHTML = `
        <h1>404</h1>
        <p>Page not found</p>`;
    }
}

main();