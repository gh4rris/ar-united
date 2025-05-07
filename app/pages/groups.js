import { API_BASE_URL } from "../config.js";

export default function Group() {
    return `
    <div id="group-box">
        <h2 id="group-name"></h2>
        <p id="group-description"></p>
        <button id="member-btn">Join Group</button>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" >
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`;
}

export async function groupEvents() {
    const user = JSON.parse(localStorage.user);
    const group = await getGroup();
    const memberBtn = document.getElementById('member-btn');
    if (!group) {
        window.location.replace(`/activists/${user.slug}`);
    } else if (user.id != group.admin_id) {
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
    } else {
        memberBtn.innerText = 'Admin';
        memberBtn.setAttribute('disabled', '');
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