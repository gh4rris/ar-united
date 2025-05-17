import { API_BASE_URL } from "../config.js";
import { validateToken } from "../app.js";

export async function renderEditProfile(activist) {
  const user = JSON.parse(localStorage.user);
  if (user.id != activist.id) {
    window.location.replace(`/activists/${user.slug}`);
    return
  }
  document.getElementById('app').innerHTML = `
  <div id="edit-profile-box">
    <form id="edit-profile-form">
        <div id="fname-edit-box" class="input-box">
          <label for="fname-input-edit" class="label">First name:</label>
          <input type="text" name="first_name" id="fname-input-edit" value="${user.first_name}" class="input" required />
        </div>
        <div id="lname-edit-box" class="input-box">
          <label for="lname-input-edit" class="label">Last name:</label>
          <input type="text" name="last_name" id="lname-input-edit" value="${user.last_name}" class="input"/>
        </div>
        <div id="email-edit-box" class="input-box">
          <label for="email-input-edit" class="label">Email:</label>
          <input type="email" name="email" id="email-input-edit" value="${user.email}" class="input" required />
        </div>
        <div id="bio-edit-box">
            <label for="bio-input-edit">Bio:</label>
            <textarea name="bio" id="bio-input-edit" rows="6" cols="35" spellcheck="true">${user.bio}</textarea>
          </div>
        <button id="save-edit-btn" type="submit">Save changes</button>
      </form>
      <a href="/activists/${activist.slug}" class="back">Back</a>
    </div>`;
    editProfileEvents(user);
}

export function editProfileEvents(user) {
  const form = document.getElementById('edit-profile-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await validateToken();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    await saveProfileChanges(user, data);
  })
}

async function saveProfileChanges(user, data) {
  if (user.first_name === data.first_name && user.last_name === data.last_name && user.email === data.email && user.bio === data.bio) {
    window.location.assign(`/activists/${user.slug}`);
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.accessToken}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error("couldn't update user")
      }
      const responseData = await response.json();
      localStorage.setItem('user', JSON.stringify(responseData.user));
      window.location.assign(`/activists/${user.slug}`);
    }
    catch(error) {
      console.error(error);
    }
  }
}
