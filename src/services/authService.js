import supabase from "../../utils/supabase.js";
import bcrypt from "bcryptjs";

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

// Generate a simple token (in production, use JWT)
const generateToken = (reg_no) => {
  return btoa(`${reg_no}:${Date.now()}`);
};

// Signup function
export const signup = async (userData) => {
  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("reg_no")
      .eq("reg_no", userData.reg_no)
      .single();

    if (existingUser) {
      throw new Error("User with this registration number already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insert new user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          reg_no: userData.reg_no,
          name: userData.name,
          contact: userData.contact,
          department: userData.department,
          password_hash: hashedPassword,
        },
      ])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login function
export const login = async (reg_no, password) => {
  try {
    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("reg_no", reg_no)
      .single();

    if (error || !user) {
      throw new Error("Invalid registration number or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Invalid registration number or password");
    }

    // Generate token
    const token = generateToken(reg_no);

    // Remove password_hash from user object before storing
    const { password_hash: _, ...userWithoutPassword } = user;

    // Store token and user info
    setToken(token);
    setUser(userWithoutPassword);

    return { success: true, user: userWithoutPassword };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout function
export const logout = async () => {
  try {
    // Clear local auth data
    clearAuth();
    
    return { success: true };
  } catch (error) {
    // Still clear local data even if something fails
    clearAuth();
    return { success: false, error: error.message };
  }
};

// Get current user from local storage
export const getCurrentUser = async () => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const user = getUser();
    
    if (!user) {
      throw new Error("No user data found");
    }

    return { success: true, user };
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
