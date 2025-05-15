import { API_BASE_URL } from "../config.js";

export function renderUploadProfilePic(activist) {
    const user = JSON.parse(localStorage.user);
    if (user.id != activist.id) {
        window.location.replace(`/activists/${user.slug}`);
        return
    } 
    document.getElementById('app').innerHTML = `
    <h2>Upload a profile picture</h2>
    <form id="upload-profile-pic-form">
        <input type="file" id="profile-pic" accept="image/*"/>
        <button type="submit" id="upload-profile-pic-btn">Upload</button>
    </form>
    <a href="/activists/${activist.slug}">back</a>`;
    uploadProfilePicEvents(activist);
}

function uploadProfilePicEvents(activist) {
    const form = document.getElementById('upload-profile-pic-form')
    const uploadBtn = document.getElementById('upload-profile-pic-btn');
    form.addEventListener('submit', async(e) => {
        e.preventDefault();
        const picFile = document.getElementById('profile-pic').files[0];
        if (!picFile) return;
        const formData = new FormData();
        formData.append('profile-pic', picFile);
        toggleUploadButton(true, uploadBtn);
        await uploadImage(activist, formData);
        toggleUploadButton(false, uploadBtn);
    })
}

async function uploadImage(activist, formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/profile_pic`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.accessToken}`
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error("couldn't upload image");
        }
        window.location.assign(`/activists/${activist.slug}`);
    }
    catch(error) {
        console.error(error.message)
    }
}

function toggleUploadButton(uploading, button) {
    if (uploading) {
        button.innerText = 'Uploading...';
        button.disabled = true;
        return;
    }
    button.innerText = 'Upload';
    button.disabled = false;
}