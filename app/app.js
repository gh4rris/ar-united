import { API_BASE_URL } from './config.js';
import { navigateTo, renderPage } from './loadPage.js';

main();

async function main() {
    const database = await checkDatabase();
    if (!database) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    }

    window.addEventListener('popstate', () => {
        renderPage();
    });

    navigateTo(window.location.url);
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