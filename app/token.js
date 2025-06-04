import { API_BASE_URL } from "./config.js";

export async function validateToken(retries = 1) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/validate-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.accessToken}`,
      },
    });
    if (retries > 0 && response.status === 401) {
      await refreshAccessToken();
      return await validateToken(retries - 1);
    }
    if (!response.ok) {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      throw new Error("invalid access token");
    }
    return response.ok;
  } catch (error) {
    console.log(error.message);
  }
}

export async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("couldn't refresh access token");
    }
    const responseData = await response.json();
    localStorage.setItem("accessToken", responseData.token);
    return;
  } catch (error) {
    console.error(error.message);
  }
}

export async function revokeRefreshToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/revoke`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("coudn't revoke token");
    }
  } catch (error) {
    console.error(error.message);
  }
}
