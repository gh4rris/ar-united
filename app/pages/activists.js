import { validateToken } from "../app.js";
import { API_BASE_URL } from "../config.js";

export default function Activist() {
    return `
    <div id="profile-box">
        <h2 id="profile-name"></h2>
        <p id="profile-email"></p>
        <p id="profile-description">I am an animal rights activist</p>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" >
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`;
}

const allyActivists = `
<div id="profile-box">
        <div id="name-box">
            <h2 id="profile-name"></h2>
            <button id="ally-btn">Add Ally</button>
        </div>
        <p id="profile-email"></p>
        <p id="profile-description">I am an animal rights activist</p>
      <div id="posts-box"></div>`;

export async function activistEvents() {
    const user = JSON.parse(localStorage.user);
    const activist = await getActivist();
    let posts = [];
    if (!activist) {
        window.location.replace(`/activists/${user.slug}`);
        return
    } else if (user.id != activist.id) {
        posts = await activistPage(user, activist);
    } else {
        const postBtn = document.getElementById('post-btn');
        postBtn.addEventListener('click', async function(e) {
            await validateToken();
            const value = e.target.previousElementSibling.value;
            await newPost(value);
        });
        posts = await getUserPosts(user.id);
    }
    const nameElement = document.getElementById('profile-name');
    const emailElement = document.getElementById('profile-email');
    nameElement.innerText = `${activist.first_name} ${activist.last_name}`;
    emailElement.innerText = activist.email;
    for (let i = posts.length-1; i >= 0; i--) {
        insertPost(posts[i].id, posts[i].body);
    }
    
        
}

async function getActivist() {
    const slug = window.location.pathname.split('/')[2];
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${slug}`);
        if (!response.ok) {
            throw new Error("couldn't find user");
        }
        const activist = await response.json();
        return activist.user;
    }
    catch(error) {
        console.error(error.message);
    }
}

async function activistPage(user, activist) {
    const appElement = document.getElementById('app');
        appElement.innerHTML = allyActivists;
        const posts = await getUserPosts(activist.id);
        const ally = await isAlly(activist.id);
        const allyBtn = document.getElementById('ally-btn');
        if (ally.confirmed) {
            allyBtn.innerText = 'Allies';
            allyBtn.setAttribute("disabled", "");
        } else if (ally.requester_id === user.id) {
            allyBtn.innerText = 'Awaiting response';
            allyBtn.setAttribute("disabled", "");
        } else if (ally.requester_id === activist.id) {
            allyBtn.innerText = 'Confirm Ally';
            allyBtn.addEventListener('click', async() => {
                await confirmAlly(activist.id);
                allyBtn.innerText = 'Allies';
                allyBtn.setAttribute("disabled", "");
            })
        } else {
            allyBtn.addEventListener('click', async() => {
                addAlly(activist.id);
                allyBtn.innerText = 'Awaiting response';
                allyBtn.setAttribute("disabled", "");
            });
        }
        return posts
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

