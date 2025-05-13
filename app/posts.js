import { API_BASE_URL } from "./config.js";

export async function displayPosts(type, path) {
    const posts = await getPosts(type.id, path);
    for (let i = posts.length-1; i >= 0; i--) {
        insertPost(posts[i].id, posts[i].body);
    }
}

async function getPosts(typeID, path) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/${path}/${typeID}/posts`);
        if (!response.ok) {
            throw new Error("couldn't get user posts");
        }
        return await response.json();
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

export async function newPost(data, path) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.accessToken}`
            },
            body: JSON.stringify(data)
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