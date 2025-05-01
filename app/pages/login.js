import { API_BASE_URL } from "../config.js";

export default function Login() {
    return `
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
        <button type="submit" id="submit-button-login">Submit</button>
      </form>`;
}

export function loginEvents() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(this);
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
    window.location.assign('/profile');
  }
  catch(error) {
    console.error(error);
  }
}