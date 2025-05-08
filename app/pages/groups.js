import { API_BASE_URL } from "../config.js";

export default function Group() {
    return `
    <div id="group-box">
        <h2 id="group-name"></h2>
        <p id="group-description"></p>
        <button id="member-btn" disabled>Admin</button>
        <button id="create-event-btn">Create Event</button>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" >
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`;
}

const nonAdminHTML = `
<div id="group-box">
        <h2 id="group-name"></h2>
        <p id="group-description"></p>
        <button id="member-btn">Join Group</button>
      <div id="posts-box"></div>`

export async function groupEvents() {
    const user = JSON.parse(localStorage.user);
    const group = await getGroup();
    if (!group) {
        window.location.replace(`/activists/${user.slug}`);
    } else if (user.id != group.admin_id) {
        await nonAdminPage(user, group);
    } else {
        const eventBtn = document.getElementById('create-event-btn');
        eventBtn.addEventListener('click', () => {
            window.location.assign(`/groups/${group.slug}/create_event`)
        })
    }
    const nameElement = document.getElementById('group-name');
    const descriptionElement = document.getElementById('group-description');
    nameElement.innerText = `${group.name}`;
    descriptionElement.innerText = `${group.description}`;
}

export async function getGroup() {
    const slug = window.location.pathname.split('/')[2];
    try {
        const response = await fetch(`${API_BASE_URL}/api/groups/${slug}`);
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

async function nonAdminPage(user, group) {
    const appElement = document.getElementById('app');
    appElement.innerHTML = nonAdminHTML;
    const memberBtn = document.getElementById('member-btn');
    const member = await isMember(user.id, group.id);
    if (member) {
        memberBtn.innerText = 'Member';
        memberBtn.setAttribute('disabled', '');
    }
    memberBtn.addEventListener('click', () => {
        joinGroup(group.id);
        memberBtn.innerText = 'Member';
        memberBtn.setAttribute('disabled', '');
    })
}

async function isMember(userID, groupID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/groups/${groupID}`);
        if (!response.ok) {
            throw new Error("couldn't check member");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error.message);
    }
}

async function joinGroup(groupID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/groups/${groupID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error("couldn't join group");
        }
        return
    }
    catch(error) {
        console.error(error.message);
    }
}