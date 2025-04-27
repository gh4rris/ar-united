export default function Profile() {
    return `
    <div id="profile-box">
        <h2 id="profile-name">Lisa Simpson</h2>
        <p id="profile-email">lisa@gmail.com</p>
        <p id="profile-description">I am an animal rights activist</p>
      </div>`
}

export function profileEvents() {
    const user = JSON.parse(localStorage.getItem('user'));
    const nameElement = document.getElementById('profile-name');
    const emailElement = document.getElementById('profile-email');
    nameElement.innerText = `${user.first_name} ${user.last_name}`;
    emailElement.innerText = user.email;
}