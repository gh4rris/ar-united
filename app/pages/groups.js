import { API_BASE_URL } from "../config.js";

export default function Group() {
    return `
    <div id="group-box">
        <h2 id="group-name"></h2>
        <p id="group-description"></p>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" >
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`;
}

export async function groupEvents() {
    const user = JSON.parse(localStorage.user);
    const group = await getGroup();
    if (!group) {
        window.location.replace(`/activists/${user.slug}`);
    }
    const nameElement = document.getElementById('group-name');
    const descriptionElement = document.getElementById('group-description');
    nameElement.innerText = `${group.name}`;
    descriptionElement.innerText = `${group.description}`;
}

export async function getGroup() {
    const slug = window.location.pathname.split('/')[2];
    try {
        const response = await fetch(`${API_BASE_URL}/api/groups/${slug}`)
        if (!response.ok) {
            throw new Error("couldn't get group");
        }
        const responseData = await response.json();
        return responseData.group;
    }
    catch(error) {
        console.error(error.message);
    }
}