import { API_BASE_URL } from "../config.js";

export function RenderCreateEvent(group) {
    document.getElementById('app').innerHTML = `
    <form id="create-evnt-form">
        <div id="ename-create-box">
          <label for="ename-input-create">Event name:</label>
          <input type="text" name="name" id="ename-input-create" required >
        </div>
        <div id="location-create-box">
          <label for="location-input-create">Location:</label>
          <input type="text" name="location" id="location-input-create" required >
        </div>
        <div id="date-create-box">
          <label for="date-input-create">Date:</label>
          <input type="date" name="date" id="date-input-create" >
        </div>
        <div id="desc-create-box">
          <label for="desc-input-create">Description:</label>
          <textarea name="description" id="desc-input-create" rows="5" cols="33" spellcheck="true" required></textarea>
        </div>
        <button type="submit" id="submit-btn-create">Create Event</button>
      </form>`;
      createEventEvents(group);
}

export function createEventEvents(group) {
  const form = document.getElementById('create-evnt-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = e.target[2].value + 'T00:00:00Z';
    const data = {'name': e.target[0].value, 'location': e.target[1].value,
      'date': date, 'description': e.target[3].value, 'group_id': group.id
    }
    newEvent(data);
  })
}

async function newEvent(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error("couldn't create new event");
    }
  }
  catch(error) {
    console.error(error.message);
  }
}