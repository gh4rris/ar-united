import { validateToken } from "../app.js";
import { API_BASE_URL } from "../config.js";

export default function Profile() {
    return `
    <div id="profile-box">
        <h2 id="profile-name"></h2>
        <p id="profile-email"></p>
        <p id="profile-description">I am an animal rights activist</p>
        <div id="new-post-box">
            <input type="text" name="post" id="post-input" >
            <button id="post-btn">Post</button>
      </div>
      <div id="posts-box"></div>`
}

export async function profileEvents() {
    const user = JSON.parse(localStorage.getItem('user'));
    const nameElement = document.getElementById('profile-name');
    const emailElement = document.getElementById('profile-email');
    nameElement.innerText = `${user.first_name} ${user.last_name}`;
    emailElement.innerText = user.email;
    const postBtn = document.getElementById('post-btn');
    const posts = await getUserPosts();
    for (let i = posts.length-1; i >= 0; i--) {
        insertPost(posts[i].id, posts[i].body);
    }
    postBtn.addEventListener('click', async function(e) {
        await validateToken();
        const value = e.target.previousElementSibling.value;
        await newPost(value);
    });
        
}

async function getUserPosts() {
    const userID = JSON.parse(localStorage.user).id
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/posts`);
        if (!response.ok) {
            throw new Error("couldn't get user posts")
        }
        return await response.json();
    }
    catch(error) {
        console.error(error);
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
        insertPost(responseData.post.id, responseData.post.body)
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

