import { validateToken } from "../token.js";
import { API_BASE_URL } from "../config.js";
import { displayPosts, newPost } from "../posts.js";

export async function renderEvent(event) {
    const user = JSON.parse(localStorage.user);
    const group = await getGroup(event.group_id);
    if (user.id === group.admin_id) {
        document.getElementById('app').innerHTML = `
    <div id="event-box">
        <h2 id="event-name">${event.name}</h2>
        <p id="event-description">${event.description}</p>
        <p id="event-location">${event.location}</p>
        <p id="event-date">${event.date.replace('T00:00:00Z', '')}</p>
        <div id="group-box">
            <a id="event-group" href="/groups/${group.slug}">${group.name}</a>
        </div>
        <div id="attending-box">
            <a id="event-attendees" href="/events/${event.slug}/attending">Attending</a>
        </div>
        <button id="member-btn" disabled>Organiser</button>
        <button id="going-btn">Going</button>
        <button id="not-going-btn">Not Going</button>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" class="input">
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`;
      eventEvents(event, user.id);
    } else {
        document.getElementById('app').innerHTML = `
    <div id="event-box">
        <h2 id="event-name">${event.name}</h2>
        <p id="event-description">${event.description}</p>
        <p id="event-location">${event.location}</p>
        <p id="event-date">${event.date.replace('T00:00:00Z', '')}</p>
        <div id="group-box">
            <a id="event-group" href="/groups/${group.slug}">${group.name}</a>
        </div>
        <div id="attending-box">
            <a id="event-attendees" href="/events/${event.slug}/attending">Attending</a>
        </div>
        <button id="going-btn">Going</button>
        <button id="not-going-btn">Not Going</button>
      <div id="posts-box"></div>`;
      goingButtons(event, user.id);
    }
}

async function eventEvents(event, userID) {
    const postBtn = document.getElementById('post-btn');
    postBtn.addEventListener('click', async (e) => {
        const validToken = await validateToken();
        if (!validToken) {
                window.location.replace('/');
                return
            }
        const value = e.target.previousElementSibling.value;
        const data = {'body': value}
        await newPost(data, `/events/${event.id}`);
        e.target.previousElementSibling.value = '';
    });
    await goingButtons(event, userID);
}

async function goingButtons(event, userID) {
    const goingBtn = document.getElementById('going-btn');
    const notGoingBtn = document.getElementById('not-going-btn');
    const going = await isGoing(event.id);
    if (going) {
        goingBtn.disabled = true;
    }
    goingBtn.addEventListener('click', async () => {
        const valid = await validateToken();
        if (valid) {
            await addGoing(event.id, goingBtn);
        }
    });
    notGoingBtn.addEventListener('click', async () => {
        const valid = await validateToken();
        if (valid) {
            await removeGoing(event.id, goingBtn);
        }
    });
    await displayPosts(event, 'events', userID);
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
        const response = await fetch(`${API_BASE_URL}/api/attendees/${eventID}`, {
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
        const response = await fetch(`${API_BASE_URL}/api/attendees/${eventID}`, {
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
        const response = await fetch(`${API_BASE_URL}/api/attendees/${eventID}`, {
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