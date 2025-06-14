import { validateToken } from "../token.js";
import { API_BASE_URL } from "../config.js";
import { displayPosts, newPost } from "../posts.js";

export async function renderActivist(activist) {
  const user = JSON.parse(localStorage.user);
  if (user.id === activist.id) {
    document.getElementById("app").innerHTML = `
    <div id="profile-box">
      <div id="profile-img-details-box">
        <div id="img-box">
          <img id="profile-pic-img" src="${activist.profile_pic_url}" alt="profile-pic" width="200">
          <button id="upload-pic-btn" class="btn2">Upload Profile Picture</button>
        </div>
        <div id="profile-details-box"> 
          <div id="name-box">
            <h2 id="profile-name">${activist.first_name} ${activist.last_name}</h2>
          </div>
          <p id="profile-email">${activist.email}</p>
          <p id="profile-bio">${activist.bio}</p>
          <button id="edit-btn" class="btn2">Edit Profile</button>
        </div>
      </div>
      <div id="profile-age-box">
        <div id="profile-allies-box">
            <a id="user-allies" href="/activists/${activist.slug}/allies">Allies</a>
        </div>
        <div id="profile-groups-box">
            <a id="user-groups" href="/activists/${activist.slug}/groups">Groups</a>
        </div>
        <div id="profile-events-box">
            <a id="user-events" href="/activists/${activist.slug}/events">Events</a>
        </div>
      </div>
      <div id="new-post-box">
        <input type="text" name="post" id="post-input" class="input" placeholder="Share your thoughts...">
        <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>
    </div>`;
    await activistEvents(user, activist);
  } else {
    document.getElementById("app").innerHTML = `
    <div id="profile-box">
      <div id="profile-img-details-box">
        <div id="img-box">
          <img id="profile-pic-img" src="${activist.profile_pic_url}" alt="profile-pic" width="200">
        </div>
        <div id="profile-details-box">
          <div id="name-box">
            <h2 id="profile-name">${activist.first_name} ${activist.last_name}</h2>
            <button id="ally-btn" class="btn2">Add Ally</button>
          </div>
          <p id="profile-email">${activist.email}</p>
          <p id="profile-bio">${activist.bio}</p>
        </div>
      </div>
      <div id="profile-age-box">
        <div id="profile-allies-box">
          <a id="user-allies" href="/activists/${activist.slug}/allies">Allies</a>
        </div>
        <div id="profile-groups-box">
            <a id="user-groups" href="/activists/${activist.slug}/groups">Groups</a>
        </div>
        <div id="profile-events-box">
            <a id="user-events" href="/activists/${activist.slug}/events">Events</a>
        </div>
      </div>
      <div id="posts-box"></div>
    </div>`;
    await nonUserPage(user, activist);
  }
}

export async function activistEvents(user, activist) {
  const profilePic = document.getElementById("profile-pic-img");
  const postBtn = document.getElementById("post-btn");
  const editBtn = document.getElementById("edit-btn");
  const uploadPicBtn = document.getElementById("upload-pic-btn");
  postBtn.addEventListener("click", async (e) => {
    const validToken = await validateToken();
    if (!validToken) {
      window.location.replace("/");
      return;
    }
    const value = e.target.previousElementSibling.value;
    const data = { body: value };
    await newPost(data, "");
    e.target.previousElementSibling.value = "";
  });
  editBtn.addEventListener("click", () => {
    window.location.assign(`/activists/${activist.slug}/edit_profile`);
  });
  if (profilePic.src != window.location) {
    uploadPicBtn.innerText = "Change Profile Picture";
  }
  uploadPicBtn.addEventListener("click", () => {
    window.location.assign(`/activists/${activist.slug}/upload_profile_pic`);
  });
  await displayPosts(activist, "users", user.id);
}

async function nonUserPage(user, activist) {
  const ally = await isAlly(activist.id);
  const allyBtn = document.getElementById("ally-btn");
  if (ally.confirmed) {
    allyBtn.innerText = "Allies";
    allyBtn.disabled = true;
  } else if (ally.requester_id === user.id) {
    allyBtn.innerText = "Awaiting response";
    allyBtn.disabled = true;
  } else if (ally.requester_id === activist.id) {
    allyBtn.innerText = "Confirm Ally";
    allyBtn.addEventListener("click", () => {
      confirmAlly(activist.id);
      allyBtn.innerText = "Allies";
      allyBtn.disabled = true;
    });
  } else {
    allyBtn.addEventListener("click", () => {
      addAlly(activist.id);
      allyBtn.innerText = "Awaiting response";
      allyBtn.disabled = true;
    });
  }
  await displayPosts(activist, "users", user.id);
}

async function isAlly(activistID) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/allies/${activistID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("couldn't check ally");
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
}

async function addAlly(activistID) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/allies/${activistID}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("couldn't add ally");
    }
    return;
  } catch (error) {
    console.error(error.message);
  }
}

async function confirmAlly(activistID) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/allies/${activistID}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("couldn't confirm ally");
    }
    return;
  } catch (error) {
    console.error(error.message);
  }
}
