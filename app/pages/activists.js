import { validateToken } from "../app.js";
import { API_BASE_URL } from "../config.js";

export async function RenderActivist(activist) {
    const user = JSON.parse(localStorage.user);
    if (user.id === activist.id) {
        document.getElementById('app').innerHTML = `
    <div id="profile-box">
        <h2 id="profile-name"></h2>
        <p id="profile-email"></p>
        <p id="profile-description">I am an animal rights activist</p>
        <button id="edit-btn">Edit Profile</button>
        <div id="allies-box">
            <a id="user-allies" href="">Allies</a>
        </div>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" >
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`;
      await activistEvents(activist);
    } else {
        document.getElementById('app').innerHTML = `
<div id="profile-box">
        <div id="name-box">
            <h2 id="profile-name"></h2>
            <button id="ally-btn">Add Ally</button>
        </div>
        <p id="profile-email"></p>
        <p id="profile-description">I am an animal rights activist</p>
        <div id="allies-box">
            <a id="user-allies" href="">Allies</a>
        </div>
      <div id="posts-box"></div>`;
      await nonUserPage(user, activist);
    }
}

export async function activistEvents(activist) {
    const postBtn = document.getElementById('post-btn');
    const editBtn = document.getElementById('edit-btn');
    postBtn.addEventListener('click', async e => {
        await validateToken();
        const value = e.target.previousElementSibling.value;
        await newPost(value);
        e.target.previousElementSibling.value = '';
    });
    editBtn.addEventListener('click', () => {
        window.location.assign(`/activists/${activist.slug}/edit_profile`);
    })
    await displayPage(activist);
}

async function displayPage(activist) {
    const posts = await getUserPosts(activist.id);
    document.getElementById('profile-name').innerText = `${activist.first_name} ${activist.last_name}`;
    document.getElementById('profile-email').innerText = activist.email;
    document.getElementById('user-allies').href = `/activists/${activist.slug}/allies`;
    for (let i = posts.length-1; i >= 0; i--) {
        insertPost(posts[i].id, posts[i].body);
    }
}

async function nonUserPage(user, activist) {
    const ally = await isAlly(activist.id);
    const allyBtn = document.getElementById('ally-btn');
    if (ally.confirmed) {
        allyBtn.innerText = 'Allies';
        allyBtn.setAttribute('disabled', '');
    } else if (ally.requester_id === user.id) {
        allyBtn.innerText = 'Awaiting response';
        allyBtn.setAttribute('disabled', '');
    } else if (ally.requester_id === activist.id) {
        allyBtn.innerText = 'Confirm Ally';
        allyBtn.addEventListener('click', () => {
            confirmAlly(activist.id);
            allyBtn.innerText = 'Allies';
            allyBtn.setAttribute('disabled', '');
        })
    } else {
        allyBtn.addEventListener('click', () => {
            addAlly(activist.id);
            allyBtn.innerText = 'Awaiting response';
            allyBtn.setAttribute('disabled', '');
        });
    }
    await displayPage(activist);
}

async function getUserPosts(userID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/posts`);
        if (!response.ok) {
            throw new Error("couldn't get user posts");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error);
    }
}

async function isAlly(activistID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/allies/${activistID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error("couldn't check ally");
        }
        return await response.json();
    }
    catch(error) {
        console.error(error.message);
    }
}

async function addAlly(activistID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/allies/${activistID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error("couldn't add ally");
        }
        return
    }
    catch(error) {
        console.error(error.message);
    }
}

async function confirmAlly(activistID) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/allies/${activistID}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error("couldn't confirm ally");
        }
        return
    }
    catch(error) {
        console.error(error.message);
    }
}

async function newPost(value) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.accessToken}`
            },
            body: `{"body": "${value}", "user_id": "${JSON.parse(localStorage.user).id}"}`
        });
        if (!response.ok) {
            throw new Error("couldn't make post");
        }
        const responseData = await response.json();
        insertPost(responseData.post.id, responseData.post.body);
    }
    catch(error) {
        console.error(error);
    }
}

function insertPost(id, body) {
    const postsBox = document.getElementById('posts-box');
    const newPost = document.createElement('div');
    const paragraph = document.createElement('p');
    newPost.append(paragraph);
    newPost.setAttribute('id', id);
    paragraph.innerText = body;
    if (postsBox.children.length === 0) {
        postsBox.append(newPost);
    } else {
        postsBox.insertBefore(newPost, postsBox.children[0]);
    }
}

