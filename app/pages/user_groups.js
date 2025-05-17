import { API_BASE_URL } from "../config.js"

export function renderUserGroups(activist) {
    const user = JSON.parse(localStorage.user);
    if (user.id === activist.id) {
        document.getElementById('app').innerHTML = `
    <div id="admin-grp-box">
        <h2>Groups you manage</h2>
    </div>
    <div id="member-grp-box">
        <h2>Groups you're a member of</h2>
    </div>
    <br>
    <a id="Back" href="/activists/${activist.slug}">Back</a>`;
    userGroupEvents(activist);
    } else {
        document.getElementById('app').innerHTML = `
    <div id="admin-grp-box">
        <h2>Groups ${activist.first_name} manages</h2>
    </div>
    <div id="member-grp-box">
        <h2>Groups ${activist.first_name} is a member of</h2>
    </div>
    <br>
    <a id="Back" href="/activists/${activist.slug}">Back</a>`;
    userGroupEvents(activist);
    }
}

export async function userGroupEvents(activist) {
    const adminGroups = await managedGroups(activist.id);
    const isMemberGroups = await memberGroups(activist.id);
    const adminGroupsBox = document.getElementById('admin-grp-box');
    const memberGroupsBox = document.getElementById('member-grp-box');
    if (adminGroups.length === 0) {
        adminGroupsBox.remove();
    } else {
        appendGroups(adminGroups, adminGroupsBox);
    }
    appendGroups(isMemberGroups, memberGroupsBox);
}

function appendGroups(groups, box) {
    for (const group of groups) {
            const link = document.createElement('a');
            const lineBreak = document.createElement('br');
            link.href = `/groups/${group.slug}`;
            link.innerText = `${group.name}`;
            box.append(link);
            box.append(lineBreak);
        }
}

async function managedGroups(userID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/groups/admin`);
        if (!response.ok) {
            throw new Error("couldn't find admin groups");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error.message);
    }
}

async function memberGroups(userID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/groups`);
        if (!response.ok) {
            throw new Error("couldn't find member groups");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error.message);
    }
}