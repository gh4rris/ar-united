import { API_BASE_URL } from "../config.js";
import { validateToken } from "../app.js";

export async function renderEditProfile(activist) {
  const user = JSON.parse(localStorage.user);
  if (user.id != activist.id) {
    window.location.replace(`/activists/${user.slug}`);
  }
  document.getElementById('app').innerHTML = `
  <form id="edit-profile-form">
      <div id="fname-edit-box">
        <label for="fname-input-edit">First name:</label>
        <input type="text" name="first_name" id="fname-input-edit" required />
      </div>
      <div id="lname-edit-box">
        <label for="lname-input-edit">Last name:</label>
        <input type="text" name="last_name" id="lname-input-edit" />
      </div>
      <div id="email-edit-box">
        <label for="email-input-edit">Email:</label>
        <input type="email" name="email" id="email-input-edit" required />
      </div>
      <button type="submit">Save changes</button>
    </form>`
    editProfileEvents(user);
}

export function editProfileEvents(user) {
  const form = document.getElementById('edit-profile-form');
  document.getElementById('fname-input-edit').value = user.first_name;
  document.getElementById('lname-input-edit').value = user.last_name;
  document.getElementById('email-input-edit').value = user.email;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await validateToken();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    await saveProfileChanges(user, data);
  })
}

async function saveProfileChanges(user, data) {
  if (user.first_name === data.first_name && user.last_name === data.last_name && user.email === data.email) {
    window.location.assign(`/activists/${user.slug}`);
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.accessToken}`
        },
        body: `{"first_name": "${data.first_name}", "last_name": "${data.last_name}",
        "email": "${data.email}"}`
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
