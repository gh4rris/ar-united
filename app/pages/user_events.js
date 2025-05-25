import { API_BASE_URL } from "../config.js";

export function renderUserEvents(activist) {
    const user = JSON.parse(localStorage.user);
        if (user.id === activist.id) {
            document.getElementById('app').innerHTML = `
        <div id="events-box">
            <div id="admin-evnt-box" class="list-box">
                <h2>Events you're organising</h2>
            </div>
            <div id="attend-evnt-box" class="list-box">
                <h2>Events you're attending</h2>
            </div>
            <a id="back" href="/activists/${activist.slug}">Back</a>
        </div>`;
        userEventEvents(activist);
        } else {
            document.getElementById('app').innerHTML = `
        <div id="events-box">
            <div id="admin-evnt-box" class="list-box">
                <h2>Events ${activist.first_name} is organising</h2>
            </div>
            <div id="attend-evnt-box" class="list-box">
                <h2>Events ${activist.first_name} is attending</h2>
            </div>
            <br>
            <a id="back" href="/activists/${activist.slug}">Back</a>
        </div>`;
        userEventEvents(activist);
        }
}

async function userEventEvents(activist) {
    const adminEvents = await organisedEvents(activist.id);
    const attendEvents = await attendingEvents(activist.id);
    const adminEventsBox = document.getElementById('admin-evnt-box');
    const attendEventsBox = document.getElementById('attend-evnt-box');
    if (adminEvents.length === 0) {
        adminEventsBox.remove();
    } else {
        appendEvents(adminEvents, adminEventsBox);
    }
    appendEvents(attendEvents, attendEventsBox);
}

function appendEvents(events, box) {
    for (const event of events) {
        const link = document.createElement('a');
        const lineBreak = document.createElement('br');
        link.href = `/events/${event.slug}`;
        link.innerText = `${event.name}`;
        box.append(link);
        box.append(lineBreak);
    }
}

async function organisedEvents(userID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/events/admin`);
        if (!response.ok) {
            throw new Error("couldn't find admin events");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error.message);
    }
}

async function attendingEvents(userID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/events`);
        if (!response.ok) {
            throw new Error("couldn't find attending events");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error.message);
    }
}