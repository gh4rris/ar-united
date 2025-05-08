import { API_BASE_URL } from "../config.js"
import { getActivist } from "./activists.js"

export default function UserGroups() {
    return `
    <div id="admin-grp-box">
        <h2>Groups you manage</h2>
    </div>
    <div id="member-grp-box">
        <h2>Groups you're a member of</h2>
    </div>`
}

export async function userGroupEvents() {
    const user = JSON.parse(localStorage.user);
    const activist = await getActivist();
    let adminGroups;
    let isMemberGroups;
    if (!activist) {
        window.location.replace(`/activists/${user.slug}`);
        return
    } else if (user.id != activist.id) {
        adminGroups = await managedGroups(activist.id);
        isMemberGroups = await memberGroups(activist.id);
    } else {
        adminGroups = await managedGroups(user.id);
        isMemberGroups = await memberGroups(user.id);
    }
    const adminGroupsBox = document.getElementById('admin-grp-box');
    const memberGroupsBox = document.getElementById('member-grp-box');
    if (adminGroups.length === 0) {
        adminGroupsBox.remove();
    } else {
        for (const group of adminGroups) {
            const link = document.createElement('a');
            link.href = `/groups/${group.slug}`;
            link.innerText = `${group.name}`;
            adminGroupsBox.append(link);
        }
    }
    for (const group of isMemberGroups) {
        const link = document.createElement('a');
        link.href = `/groups/${group.slug}`;
        link.innerText = `${group.name}`;
        memberGroupsBox.append(link);
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