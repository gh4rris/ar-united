import { validateToken } from "../token.js";
import { API_BASE_URL } from "../config.js";

export function renderCreateEvent(group) {
  document.getElementById("app").innerHTML = `
  <div id="create-evnt-box">
    <form id="create-evnt-form">
      <p>Host an activism event for your group!</p>
      <div id="ename-create-box" class="input-box">
        <label for="ename-input-create" class="label">Event name:</label>
        <input type="text" name="name" id="ename-input-create" class="input" required >
      </div>
      <div id="location-create-box" class="input-box">
        <label for="location-input-create" class="label">Location:</label>
        <input type="text" name="location" id="location-input-create" class="input" required >
      </div>
      <div id="date-create-box" class="input-box">
        <label for="date-input-create" class="label">Date:</label>
        <input type="date" name="date" id="date-input-create" class="input" >
      </div>
      <div id="desc-create-box">
        <label for="desc-input-create">Description:</label>
        <textarea name="description" id="desc-input-create" class="textarea" spellcheck="true" required></textarea>
      </div>
      <button type="submit" id="submit-btn-create" class="btn">Create Event</button>
    </form>
  </div>`;
  createEventEvents(group);
}

export function createEventEvents(group) {
  const form = document.getElementById("create-evnt-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const validToken = await validateToken();
    if (!validToken) {
      window.location.replace("/");
      return;
    }
    const date = e.target[2].value + "T00:00:00Z";
    const data = {
      name: e.target[0].value,
      location: e.target[1].value,
      date: date,
      description: e.target[3].value,
      group_id: group.id,
    };
    const event = await newEvent(data);
    window.location.assign(`/events/${event.slug}`);
  });
}

async function newEvent(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("couldn't create new event");
    }
    const eventObj = await response.json();
    return eventObj.event;
  } catch (error) {
    console.error(error.message);
  }
}
