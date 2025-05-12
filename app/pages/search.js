import { API_BASE_URL } from "../config.js";

export function renderSearch() {
    document.getElementById('app').innerHTML = `
    <div id="result-box">
        <h2>Results</h2>
    </div>`;
    searchEvents();
}

export async function searchEvents() {
    const resultBox = document.getElementById('result-box');
    const params = new URLSearchParams(window.location.search);
    const value = params.get('value');
    const type = params.get('type');
    if (value != '') {
        const results = await searchResults(value, type);
        for (const result of results) {
            if (result.id === JSON.parse(localStorage.user).id) {
                continue;
            }
            const link = document.createElement('a');
            if (!result.admin_id && !result.group_id) {
                link.href = `/activists/${result.slug}`;
                link.innerText = `${result.first_name} ${result.last_name}`;
            } else if (!result.group_id) {
                link.href = `/groups/${result.slug}`;
                link.innerText = result.name;
            } else {
                link.href = `/events/${result.slug}`;
                link.innerText = result.name
            }
            resultBox.append(link);
            resultBox.append(document.createElement('br'));
        }
    }
}

async function searchResults(value, type) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/search?value=${encodeURIComponent(value)}&type=${encodeURIComponent(type)}`);
        if (!response.ok) {
            throw new Error("couldn't find users");
        }
        const responseData = await response.json();
        return responseData;
    }
    catch(error) {
        console.error(error.message);
    }
}