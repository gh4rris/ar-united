export default function CreateEvent() {
    return `
    <form id="create-evnt-form">
        <div id="ename-create-box">
          <label for="ename-input-create">Event name:</label>
          <input type="text" name="name" id="ename-input-create" required >
        </div>
        <div id="location-create-box">
          <label for="location-input-create">Location:</label>
          <input type="text" name="location" id="location-input-create" required >
        </div>
        <div id="date-create-box">
          <label for="date-input-create">Date:</label>
          <input type="date" name="date" id="date-input-create" >
        </div>
        <div id="desc-create-box">
          <label for="desc-input-create">Description:</label>
          <textarea name="description" id="desc-input-create" rows="5" cols="33" spellcheck="true" required></textarea>
        </div>
        <button type="submit" id="submit-btn-create">Create Event</button>
      </form>`;
}

export function eventEvents() {}