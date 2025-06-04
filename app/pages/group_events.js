import { API_BASE_URL } from "../config.js";

export async function renderGroupEvents(group) {
  document.getElementById("app").innerHTML = `
  <div id="group-events-box">
    <div id="events-list-box" class="list-box">
        <h2>Events</h2>
    </div>
    <a id="back" href="/groups/${group.slug}">Back</a>
  </div>`;
  groupEventEvents(group);
}

async function groupEventEvents(group) {
  const eventsBox = document.getElementById("events-list-box");
  const events = await getGroupEvents(group.id);
  for (const event of events) {
    const link = document.createElement("a");
    link.href = `/events/${event.slug}`;
    link.innerText = event.name;
    eventsBox.append(link);
    eventsBox.append(document.createElement("br"));
  }
}

async function getGroupEvents(groupID) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/groups/${groupID}/events`,
    );
    if (!response.ok) {
      throw new Error("couldn't find group events");
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
}
