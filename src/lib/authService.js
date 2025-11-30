// const BASE_URL = "http://localhost:8081";
const BASE_URL = "https://lostandfound-backend-production-634d.up.railway.app";

// Token management
export const getToken = () => {
  return localStorage.getItem("authToken");
};

export const setToken = (token) => {
  localStorage.setItem("authToken", token);
};

export const clearToken = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

// User data management
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Clear all auth data
export const clearAuth = () => {
  clearToken();
};

// Signup function
export const signup = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Signup failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login function
export const login = async (reg_no, password) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reg_no, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Store token and user info
    setToken(data.token);
    setUser(data.user);

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout function
export const logout = async () => {
  try {
    const token = getToken();
    
    if (token) {
      await fetch(`${BASE_URL}/api/users/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Clear local auth data regardless of API response
    clearAuth();
    
    return { success: true };
  } catch (error) {
    // Still clear local data even if API call fails
    clearAuth();
    return { success: false, error: error.message };
  }
};

// Get current user from API
export const getCurrentUser = async () => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}/api/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get user info");
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get auth headers for API requests
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
