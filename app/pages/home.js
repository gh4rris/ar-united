export function renderHome() {
    document.getElementById('app').innerHTML = `
    <div id="home-box">
        <h1>AR United</h1>
        <h2 id="home-h2">Hub for Animal Rights groups and activists</h2>
        <p id="home-p">Welcome to AR United. Join the network of Animal Rights activists today!</p>
        <button id="home-login-btn" class="btn">Login</button>
        <button id="home-create-btn" class="btn">New user</button>
    </div>`;
    homeEvents();
}

export function homeEvents() {
    const login = document.getElementById('home-login-btn');
    const createAccount = document.getElementById('home-create-btn');
    login.addEventListener('click', () => {
        window.location.assign('/login');
    })
    createAccount.addEventListener('click', () => {
        window.location.assign('/create_account');
    })
}