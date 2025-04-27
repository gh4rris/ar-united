import { API_BASE_URL } from "../config.js";

export default function Login() {
    return `
    <p>Enter your email and password</p>
    <form id="login-form">
        <div id="email-login">
          <label for="email-input-login">Email:</label>
          <input type="email" name="email" id="email-input-login" placeholder="example@email.com" required />
        </div>
        <div id="password-login">
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
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      console.log(responseData)
      console.log(`My access: ${responseData.token}`)
      console.log(`My refresh: ${responseData.refresh_token}`)
    })
}