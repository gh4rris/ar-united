import { API_BASE_URL } from "../config.js";

export default function Search() {
    return `<div id="result-box"></div>`
}

export async function searchEvents() {
    // const resultBox = document.getElementById('result-box');
    const params = new URLSearchParams(window.location.search);
    const searchValue = params.get('search');
    if (searchValue != '') {
        const results = await searchResults(searchValue);
        console.log(results);
    }
}

async function searchResults(searchValue) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/search/users?search=${encodeURIComponent(searchValue)}`);
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