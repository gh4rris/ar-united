import { API_BASE_URL } from "../config.js";

export function renderEventAttendees(event) {
    document.getElementById('app').innerHTML = `
    <div id="event-attenders-box">
        <h2>Attending ${event.name}</h2>
    </div><br>
    <a id="back" href="/events/${event.slug}">Back</a>`;
    eventAttendeesEvents(event);
}

async function eventAttendeesEvents(event) {
    const attendBox = document.getElementById('event-attenders-box');
    const attenders = await getAttendees(event.id);
    for (const activist of attenders) {
        const link = document.createElement('a');
        const lineBreak = document.createElement('br');
        link.href = `/activists/${activist.slug}`;
        link.innerText = `${activist.first_name} ${activist.last_name}`;
        attendBox.append(link);
        attendBox.append(lineBreak);
    }
}

async function getAttendees(eventID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/events/${eventID}/users`);
        if (!response.ok) {
            throw new Error("couldn't find attenders");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error.message);
    }
}