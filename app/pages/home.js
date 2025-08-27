import { newAccount } from "./create_account.js";
import { userLogin } from "./login.js";

export function renderHome() {
  document.getElementById("app").innerHTML = `
    <div id="home-box">
        <h1>AR United</h1>
        <h2 id="home-h2">Hub for Animal Rights groups and activists</h2>
        <p id="home-p">Welcome to AR United. Join the network of Animal Rights activists today!</p>
        <button id="home-login-btn" class="btn">Login</button>
        <button id="home-create-btn" class="btn">New user</button>
        <button id="guest-btn" class="btn">Guest</button>
    </div>`;
  homeEvents();
}

export function homeEvents() {
  const login = document.getElementById("home-login-btn");
  const createAccount = document.getElementById("home-create-btn");
  const guest = document.getElementById("guest-btn");
  login.addEventListener("click", () => {
    window.location.assign("/login");
  });
  createAccount.addEventListener("click", () => {
    window.location.assign("/create_account");
  });
  guest.addEventListener("click", async () => {
    const emailRNG = Math.floor(Math.random() * 1000000);
    const passwordRNG = String(Math.floor(Math.random() * 100000000));
    const data = {
      first_name: "Guest",
      last_name: "Account",
      dob: "1970-01-01T00:00:00Z",
      email: `${emailRNG}@guest.com`,
      password: passwordRNG,
      is_guest: true,
    };
    await newAccount(data);
    const loginData = { email: data.email, password: data.password };
    await userLogin(loginData);
  });
}
