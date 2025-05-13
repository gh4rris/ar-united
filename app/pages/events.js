import { API_BASE_URL } from "../config.js";

export async function renderEvent(event) {
    const user = JSON.parse(localStorage.user);
    const group = await getGroup(event.group_id);
    if (user.id === group.admin_id) {
        document.getElementById('app').innerHTML = `
    <div id="event-box">
        <h2 id="event-name">${event.name}</h2>
        <p id="event-description">${event.description}</p>
        <button id="member-btn" disabled>Organiser</button>
        <button id="going-btn">Going</button>
        <button id="not-going-btn">Not Going</button>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" >
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`;
      eventEvents(event);
    } else {
        document.getElementById('app').innerHTML = `
    <div id="event-box">
        <h2 id="event-name">${event.name}</h2>
        <p id="event-description">${event.description}</p>
        <button id="going-btn">Going</button>
        <button id="not-going-btn">Not Going</button>
      <div id="posts-box"></div>`;
      eventEvents(event);
    }
}

async function eventEvents(event) {
    const goingBtn = document.getElementById('going-btn');
    const notGoingBtn = document.getElementById('not-going-btn');
    const going = await isGoing(event.id);
    if (going) {
        goingBtn.disabled = true;
    }
    goingBtn.addEventListener('click', async () => {
        await addGoing(event.id, goingBtn);
    });
    notGoingBtn.addEventListener('click', async () => {
        await removeGoing(event.id, goingBtn);
    })
}

async function getGroup(groupID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/groups/${groupID}`);
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

async function isGoing(eventID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/attenders/${eventID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error("couldn't find if going");
        }
        if (response.status === 200) {
            return await response.json();
        }
    }
    catch(error) {
        console.error(error.message)
    }
}

async function addGoing(eventID, button) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/attenders/${eventID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error("couldn't add going");
        }
        button.disabled = true;
    }
    catch(error) {
        console.error(error.message)
    }
}

async function removeGoing(eventID, button) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/attenders/${eventID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error("couldn't add going");
        }
        button.disabled = false;
    }
    catch(error) {
        console.error(error.message)
    }
}