import { API_BASE_URL } from "../config.js";

export function renderGroup(group) {
    const user = JSON.parse(localStorage.user);
    if (user.id === group.admin_id) {
        document.getElementById('app').innerHTML = `
    <div id="group-box">
        <h2 id="group-name">${group.name}</h2>
        <p id="group-description">${group.description}</p>
        <button id="member-btn" disabled>Admin</button>
        <button id="create-event-btn">Create Event</button>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" >
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`;
      groupEvents(group);
    } else {
        document.getElementById('app').innerHTML = `
<div id="group-box">
        <h2 id="group-name">${group.name}</h2>
        <p id="group-description">${group.description}</p>
        <button id="member-btn">Join Group</button>
      <div id="posts-box"></div>`;
      nonAdminPage(user, group);
    }
}


export async function groupEvents(group) {
    const eventBtn = document.getElementById('create-event-btn');
    eventBtn.addEventListener('click', () => {
        window.location.assign(`/groups/${group.slug}/create_event`)
    });
}

async function nonAdminPage(user, group) {
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
    });
}

async function isMember(userID, groupID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/groups/${groupID}`);
        if (!response.ok) {
            throw new Error("couldn't check member");
        }
        if (response.status === 200) {
            return await response.json();
        }
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