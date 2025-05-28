import { API_BASE_URL } from './config.js';
import { navigateTo, renderPage } from './loadPage.js';

export function renderNavBar() {
    const user = JSON.parse(localStorage.user);
    const appBox = document.getElementById('app');
    const navBar = document.createElement('div');
    navBar.innerHTML = `
    <div id="search-box">
        <input type="text" id="search-input" placeholder="search" />
        <button id="search-btn">Search</button>
        <select id="search-type">
            <option value="All">All</option>
            <option value="Activists">Activists</option>
            <option value="Groups">Groups</option>
            <option value="Events">Events</option>
        </select>
    </div>
    <nav>
        <a href="/groups/create_group" id="create-group-link">Create a group</a>
        <div id="login-links">
            <a href="/activists/${user.slug}" id="profile-link">Profile</a>
            <a href="" id="logout">Logout</a>
        </div>
    </nav>`;
    document.body.insertBefore(navBar, appBox);
    navBarEvents(navBar);
}

function navBarEvents(navBar) {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const logout = document.getElementById('logout');
    searchBtn.addEventListener('click', async () => {
        const type = document.getElementById('search-type').value.toLowerCase();
        const url = `/search?value=${encodeURIComponent(searchInput.value)}&type=${encodeURIComponent(type)}`;
        await navigateTo(url);
    });
    logout.addEventListener('click', async (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        navBar.remove();
        history.replaceState(null, '', '/');
        await renderPage();
        await revokeRefreshToken();
    })
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