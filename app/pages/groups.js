import { validateToken } from "../loadPage.js";
import { API_BASE_URL } from "../config.js";
import { displayPosts, newPost } from "../posts.js";

export function renderGroup(group) {
    const user = JSON.parse(localStorage.user);
    if (user.id === group.admin_id) {
        document.getElementById('app').innerHTML = `
    <div id="group-box">
        <h2 id="group-name">${group.name}</h2>
        <p id="group-description">${group.description}</p>
        <button id="member-btn" disabled>Admin</button>
        <button id="create-event-btn">Create Event</button>
        <div id="members-box">
            <a id="group-members" href="/groups/${group.slug}/members">Members</a>
        </div>
        <div id="events-box">
            <a id="group-events" href="/groups/${group.slug}/events">Events</a>
        </div>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" class="input">
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`;
      groupEvents(user, group);
    } else {
        document.getElementById('app').innerHTML = `
<div id="group-box">
        <h2 id="group-name">${group.name}</h2>
        <p id="group-description">${group.description}</p>
        <button id="member-btn">Join Group</button>
        <div id="members-box">
            <a id="group-members" href="/groups/${group.slug}/members">Members</a>
        </div>
        <div id="events-box">
            <a id="group-events" href="/groups/${group.slug}/events">Events</a>
        </div>
      <div id="posts-box"></div>`;
      nonAdminPage(user, group);
    }
}


export async function groupEvents(user, group) {
    const eventBtn = document.getElementById('create-event-btn');
    const postBtn = document.getElementById('post-btn');
    eventBtn.addEventListener('click', () => {
        window.location.assign(`/groups/${group.slug}/create_event`)
    });
    postBtn.addEventListener('click', async (e) => {
        const validToken = await validateToken();
        if (!validToken) {
                window.location.replace('/');
                return
            }
        const value = e.target.previousElementSibling.value;
        const data = {'body': value}
        await newPost(data, `/groups/${group.id}`);
        e.target.previousElementSibling.value = '';
    });
    await displayPosts(group, 'groups', user.id);
}

async function nonAdminPage(user, group) {
    const memberBtn = document.getElementById('member-btn');
    const member = await isMember(user.id, group.id);
    if (member) {
        memberBtn.innerText = 'Member';
        memberBtn.disabled = true;
    }
    memberBtn.addEventListener('click', () => {
        joinGroup(group.id);
        memberBtn.innerText = 'Member';
        memberBtn.disabled = true;
    });
    await displayPosts(group, 'groups', user.id);
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