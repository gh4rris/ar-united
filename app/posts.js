import { API_BASE_URL } from "./config.js";

export async function displayPosts(type, path, userID) {
  const posts = await getPosts(type.id, path);
  for (let i = posts.length - 1; i >= 0; i--) {
    insertPost(posts[i].id, posts[i].body, posts[i].user_id === userID);
  }
}

async function getPosts(typeID, path) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${path}/${typeID}/posts`);
    if (!response.ok) {
      throw new Error("couldn't get user posts");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

function insertPost(id, body, userPost) {
  const postsBox = document.getElementById("posts-box");
  const newPost = document.createElement("div");
  const paragraph = document.createElement("p");
  newPost.classList.add("post");
  newPost.setAttribute("id", id);
  paragraph.innerText = body;
  newPost.append(paragraph);
  if (userPost) {
    const x = document.createElement("i");
    x.classList.add("fa-solid");
    x.classList.add("fa-xmark");
    newPost.append(x);
    x.addEventListener("click", async () => {
      await deletePost(id);
      newPost.remove();
    });
  }
  if (postsBox.children.length === 0) {
    postsBox.append(newPost);
  } else {
    postsBox.insertBefore(newPost, postsBox.children[0]);
  }
}

export async function newPost(data, path) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.accessToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("couldn't make post");
    }
    const responseData = await response.json();
    insertPost(responseData.post.id, responseData.post.body, true);
  } catch (error) {
    console.error(error);
  }
}

async function deletePost(postID) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("couldn't delete post");
    }
  } catch (error) {
    console.error(error.message);
  }
}
