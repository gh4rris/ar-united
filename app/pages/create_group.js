import { validateToken } from "../app.js";
import { API_BASE_URL } from "../config.js";

export function renderCreateGroup() {
    document.getElementById('app').innerHTML = `
    <div id="create-grp-box">
      <form id="create-grp-form">
          <div id="gname-create-box">
            <label for="gname-input-create">Group name:</label>
            <input type="text" name="name" id="gname-input-create" class="input" required >
          </div>
          <div id="desc-create-box">
            <label for="desc-input-create">Description:</label>
            <textarea name="description" id="desc-input-create" class="textarea" rows="6" cols="38" spellcheck="true" required></textarea>
          </div>
          <button type="submit" id="submit-btn-create" class="btn">Create Group</button>
        </form>
      </div>`;
      createGroupEvents();
}

export function createGroupEvents() {
  const form = document.getElementById('create-grp-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const validToken = await validateToken();
      if (!validToken) {
        window.location.replace('/');
        return
    }
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