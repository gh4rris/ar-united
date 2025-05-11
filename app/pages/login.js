import { API_BASE_URL } from "../config.js";

export function renderLogin() {
    document.getElementById('app').innerHTML = `
    <p>Enter your email and password</p>
    <form id="login-form">
        <div id="email-login-box">
          <label for="email-input-login">Email:</label>
          <input type="email" name="email" id="email-input-login" placeholder="example@email.com" required />
        </div>
        <div id="password-login-box">
          <label for="password-input-login">Password:</label>
          <input type="password" name="password" id="password-input-login" required />
        </div>
        <button type="submit" id="submit-btn-login">Submit</button>
      </form>`;
      loginEvents();
}

export function loginEvents() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      await userLogin(data);     
    });
  }

export async function userLogin(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error("couldn't fetch login data");
    }
    const responseData = await response.json();
    localStorage.setItem('user', JSON.stringify(responseData.user));
    localStorage.setItem('accessToken', responseData.token);
    const slug = JSON.parse(localStorage.user).slug;
    window.location.assign(`/activists/${slug}`);
  }
  catch(error) {
    console.error(error);
  }
}