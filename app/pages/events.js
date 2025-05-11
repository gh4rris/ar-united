export function renderEvent(event) {
    document.getElementById('app').innerHTML = `
    <div id="event-box">
        <h2 id="event-name">${event.name}</h2>
        <p id="event-description">${event.description}</p>
        <button id="member-btn" disabled>Organiser</button>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" >
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`;
}