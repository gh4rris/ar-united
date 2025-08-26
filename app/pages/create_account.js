import { API_BASE_URL } from "../config.js";
import { userLogin } from "./login.js";

export function renderCreateAccount() {
  document.getElementById("app").innerHTML = `
    <div id="create-acc-box">
      <p id="create-acc-p">Create an account and join the network of animal rights activists today!</p>
      <form id="create-acc-form">
          <div id="fname-create-box" class="input-box">
            <label for="fname-input-create" class="label">First name:</label>
            <input type="text" name="first_name" id="fname-input-create" class="input" required >
          </div>
          <div id="lname-create-box" class="input-box">
            <label for="lname-input-create" class="label">Last name:</label>
            <input type="text" name="last_name" id="lname-input-create" class="input">
          </div>
          <div id="dob-create-box" class="input-box">
            <label for="dob-input-create" class="label">Date of birth:</label>
            <input type="date" name="dob" id="dob-input-create" class="input">
          </div>
          <div id="email-create-box" class="input-box">
            <label for="email-input-create" class="label">Email:</label>
            <input type="email" name="email" id="email-input-create" placeholder="example@email.com" class="input" required />
          </div>
          <div id="password-create-box" class="input-box">
            <label for="password-input-create" class="label">Password:</label>
            <input type="password" name="password" id="password-input-create" class="input" required />
          </div>
          <div id="re-password-create-box" class="input-box">
            <label for="re-password-input-create" class="label">Re-enter password:</label>
            <input type="password" name="re_password" id="re-password-input-create" class="input" required />
          </div>
          <button type="submit" id="submit-btn-create" class="btn">Create Account</button>
          <a href="/" class="back">Back</a>
      </form>
    </div>`;
  createAccountEvents();
}

export function createAccountEvents() {
  const form = document.getElementById("create-acc-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    if (data.password != data.re_password) {
      console.error("passwords not the same");
      return;
    }
    delete data.re_password;
    data.dob += "T00:00:00Z";
    const user = await newAccount(data);
    if (!user) {
      console.error("field error");
      return;
    }
    const loginData = { email: user.email, password: data.password };
    await userLogin(loginData);
  });
}

export async function newAccount(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("couldn't create user");
    }
    const accountObj = await response.json();
    return accountObj.user;
  } catch (error) {
    console.error(error);
  }
}
