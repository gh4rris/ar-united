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
    let groups;
    if (!activist) {
        window.location.replace(`/activists/${user.slug}`);
        return
    } else if (user.id != activist.id) {
        groups = await managedGroups(activist.id);
    } else {
        groups = await managedGroups(user.id);
    }
    const adminGroups = document.getElementById('admin-grp-box');
    if (groups.length === 0) {
        adminGroups.remove();
    } else {
        for (const group of groups) {
            const link = document.createElement('a');
            link.href = `/groups/${group.slug}`;
            link.innerText = `${group.name}`;
            adminGroups.append(link);
        }
    }
}

async function managedGroups(userID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/groups/admin`);
        if (!response.ok) {
            throw new Error("couldn't find managed groups");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error.message);
    }
}