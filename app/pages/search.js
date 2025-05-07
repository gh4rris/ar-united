import { API_BASE_URL } from "../config.js";

export default function Search() {
    return `<div id="result-box"></div>`
}

export async function searchEvents() {
    const resultBox = document.getElementById('result-box');
    const params = new URLSearchParams(window.location.search);
    const value = params.get('value');
    const type = params.get('type');
    if (value != '') {
        const results = await searchResultsUsers(value, type);
        for (const result of results) {
            if (result.id === JSON.parse(localStorage.user).id) {
                continue;
            }
            const link = document.createElement('a');
            if (type === 'activists') {
                link.href = `/activists/${result.slug}`;
                link.innerText = `${result.first_name} ${result.last_name}`;
            } else if (type === 'groups') {
                link.href = `/groups/${result.slug}`;
                link.innerText = `${result.name}`;
            }
            resultBox.append(link);
            resultBox.append(document.createElement('br'));
        }
    }
}

async function searchResultsUsers(value, type) {
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