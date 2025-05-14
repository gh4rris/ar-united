import { API_BASE_URL } from "../config.js";

export async function renderGroupMembers(group) {
    document.getElementById('app').innerHTML = `
        <div id="admin-box">
            <h2>Group Admin</h2>
        </div>
        <div id="member-box">
            <h2>Members</h2>
        </div>
        <br>
        <a id="back" href="/groups/${group.slug}">Back</a>`;
        groupMembersEvents(group);
}

async function groupMembersEvents(group) {
    const adminBox = document.getElementById('admin-box');
    const memberBox = document.getElementById('member-box');
    const admin = await getGroupAdmin(group.id);
    const members = await getGroupMembers(group.id);
    appendLinks([admin], adminBox);
    appendLinks(members, memberBox);
}

function appendLinks(activists, box) {
    for (const activist of activists) {
        const link = document.createElement('a');
        link.href = `/activists/${activist.slug}`;
        link.innerText = `${activist.first_name} ${activist.last_name}`;
        box.append(link);
        box.append(document.createElement('br'));
    }
}

async function getGroupAdmin(groupID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/groups/${groupID}/admin`)
        if (!response.ok) {
            throw new Error("couldn't find group admin");
        }
        const responseData = await response.json();
        return responseData.user;
    }
    catch(error) {
        console.error(error.message);
    }
}

async function getGroupMembers(groupID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/groups/${groupID}/users`)
        if (!response.ok) {
            throw new Error("couldn't find group members");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error.message);
    }
}