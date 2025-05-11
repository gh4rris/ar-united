export function renderUserEvents(activist) {
    const user = JSON.parse(localStorage.user);
        if (user.id === activist.id) {
            document.getElementById('app').innerHTML = `
        <div id="admin-evnt-box">
            <h2>Events you're organising</h2>
        </div>
        <div id="attend-evnt-box">
            <h2>Events you're attending</h2>
        </div>`
        userEventEvents(activist);
        } else {
            document.getElementById('app').innerHTML = `
        <div id="admin-evnt-box">
            <h2>Events ${activist.first_name} is organising</h2>
        </div>
        <div id="attend-evnt-box">
            <h2>Events ${activist.first_name} is attending</h2>
        </div>`
        userEventEvents(activist);
        }
}

function userEventEvents(activist) {
    console.log(activist)
}