export default function Search() {
    return `<div id="result-box"></div>`
}

export function searchEvents() {
    // const resultBox = document.getElementById('result-box');
    const params = new URLSearchParams(window.location.search);
    const searchValue = params.get('search');
    console.log(searchValue)
}