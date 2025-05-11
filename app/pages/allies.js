import { API_BASE_URL } from "../config.js";

export async function RenderAllies(activist) {
    document.getElementById('app').innerHTML = `<div id="ally-box"></div>`;
    alliesEvents(activist);
}

export async function alliesEvents(activist) {
    const allyBox = document.getElementById('ally-box');
    const allies = await getAllies(activist.id);
    for (const ally of allies) {
        const link = document.createElement('a');
        link.href = `/activists/${ally.slug}`;
        link.innerText = `${ally.first_name} ${ally.last_name}`;
        allyBox.append(link);
        allyBox.append(document.createElement('br'));
    }
}

async function getAllies(userID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/allies`);
        if (!response.ok) {
            throw new Error("couldn't find allies");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error.message);
    }
}