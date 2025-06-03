import { API_BASE_URL } from "../config.js";

export function renderLogin() {
  document.getElementById("app").innerHTML = `
  <div id="login-box">
    <p id="login-p">Enter your email and password</p>
    <form id="login-form">
        <div id="email-login-box" class="input-box">
          <label for="email-input-login" class="label">Email:</label>
          <input type="email" name="email" id="email-input-login" class="input" placeholder="example@email.com" required />
        </div>
        <div id="password-login-box" class="input-box">
          <label for="password-input-login" class="label">Password:</label>
          <input type="password" name="password" id="password-input-login" class="input" required />
        </div>
        <button type="submit" id="submit-btn-login" class="btn">Submit</button>
      </form>
      <a href="/" class="back">Back</a>
    </login>`;
  loginEvents();
}

export function loginEvents() {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    await userLogin(data);
  });
}

export async function userLogin(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("couldn't fetch login data");
    }
    const responseData = await response.json();
    localStorage.setItem("user", JSON.stringify(responseData.user));
    localStorage.setItem("accessToken", responseData.token);
    const slug = JSON.parse(localStorage.user).slug;
    window.location.assign(`/activists/${slug}`);
  } catch (error) {
    console.error(error);
  }
}
