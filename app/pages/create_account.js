import { API_BASE_URL } from "../config.js";

export default function CreateAccount() {
    return `
    <p>Create an account and join the network of animal rights activists today!</p>
    <form id="create-acc-form">
        <div id="fname-create-box">
          <label for="fname-input-create">First name:</label>
          <input type="text" name="first_name" id="fname-input-create" required >
        </div>
        <div id="lname-create-box">
          <label for="lname-input-create">Last name:</label>
          <input type="text" name="last_name" id="lname-input-create">
        </div>
        <div id="dob-create-box">
          <label for="dob-input-create">Date of birth:</label>
          <input type="date" name="dob" id="dob-input-create" >
        </div>
        <div id="email-create-box">
          <label for="email-input-create">Email:</label>
          <input type="email" name="email" id="email-input-create" placeholder="example@email.com" required />
        </div>
        <div id="password-create-box">
          <label for="password-input-create">Password:</label>
          <input type="password" name="password" id="password-input-create" required />
        </div>
        <div id="re-password-create-box">
          <label for="re-password-input-create">Re-enter password:</label>
          <input type="password" name="re_password" id="re-password-input-create" required />
        </div>
        <button type="submit" id="submit-button-create">Create Account</button>
      </form>`
}

export function createAccountEvents() {
    const form = document.getElementById('create-acc-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        if (data.password != data.re_password) {
            console.error('passwords not the same');
        }
        delete(data.re_password);
        data.dob += 'T00:00:00Z';
        try {
          const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
          throw new Error("couldn't create user");
        }
        const responseData = await response.json();
        console.log(responseData);
        }
        catch(error) {
          console.error(error);
        }
    })
}