import { API_BASE_URL } from "../config.js";

export function RenderCreateGroup() {
    document.getElementById('app').innerHTML = `
    <form id="create-grp-form">
        <div id="gname-create-box">
          <label for="gname-input-create">Group name:</label>
          <input type="text" name="name" id="gname-input-create" required >
        </div>
        <div id="desc-create-box">
          <label for="desc-input-create">Description:</label>
          <textarea name="description" id="desc-input-create" rows="5" cols="33" spellcheck="true" required></textarea>
        </div>
        <button type="submit" id="submit-btn-create">Create Group</button>
      </form>`;
      createGroupEvents();
}

export function createGroupEvents() {
  const form = document.getElementById('create-grp-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {'name': e.target[0].value, 'description': e.target[1].value};
    const group = await newGroup(data);
    window.location.assign(`/groups/${group.slug}`);
  });
}

async function newGroup(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.accessToken}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error("couldn't create group");
    }
    const groupObj = await response.json();
    return groupObj.group;
  }
  catch(error) {
    console.error(error.message);
  }
}