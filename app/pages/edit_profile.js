import { API_BASE_URL } from "../config.js";
import { validateToken } from "../app.js";

export default function EditProfile() {
    return `
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
}

export function editProfileEvents() {
  const user = JSON.parse(localStorage.user);
  const form = document.getElementById('edit-profile-form');
  document.getElementById('fname-input-edit').setAttribute('value', user.first_name);
  document.getElementById('lname-input-edit').setAttribute('value', user.last_name);
  document.getElementById('email-input-edit').setAttribute('value', user.email);
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    await validateToken();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    await saveProfileChanges(data);
  })
}

async function saveProfileChanges(data) {
  const user = JSON.parse(localStorage.user);
  if (user.first_name === data.first_name && user.last_name === data.last_name && user.email === data.email) {
    window.location.assign('/profile');
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
      window.location.assign('/profile');
    }
    catch(error) {
      console.error(error);
    }
  }
}
