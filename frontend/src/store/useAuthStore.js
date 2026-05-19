import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { pushItemToTop } from "../lib/utils.js";

const BASE_URL = import.meta.env.MODE === "development" ? "ws://localhost:3000/cable" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  userList: [],
  socket: null,
  authToken: null,

  checkAuth: async () => {
    const { authToken, connectSocket, getUserList } = get()
    try {
      const token = localStorage.getItem("authToken");
      const res = await axiosInstance.get("/users/check_auth", { headers: { "Authorization": token || authToken } });
      set({ authUser: res.data.data });
      set({ authToken: token || authToken });
      await getUserList();

      await connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/sign_up", { "user": data });
      
      set({ authUser: res.data.data });
      set({ authToken: res.headers.authorization });
      localStorage.setItem("authToken", res.headers.authorization);

      toast.success(res.data.message);
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    const { getUserList, connectSocket } = get()
    try {
      const res = await axiosInstance.post("/login", { "user": data });
      
      set({ authUser: res.data.data });
      set({ authToken: res.headers.authorization })
      localStorage.setItem("authToken", res.headers.authorization);
      toast.success(res.data.message);

      await getUserList();
      await connectSocket();
    } catch (error) {
      toast.error(error.response.data.error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    const { authToken, disconnectSocket } = get();

    try {
      disconnectSocket();
      await axiosInstance.delete("/logout", { headers: { "Authorization": authToken } });
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.log(error);
      
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append("user[name]", data.name);
      formData.append("user[email]", data.email);
      if (data.avatar) {
        formData.append("user[avatar]", data.avatar);
      }
      const res = await axiosInstance.put("/users/update", formData, { headers: { "Authorization": get().authToken } });
      set({ authUser: res.data.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  getUserList: async () => {
    const { authToken } = get();

    try {
      const res = await axiosInstance.get("/users/get_users", { headers: { "Authorization": authToken } });
      
      set({ userList: res.data.data });
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
    }
  },

  connectSocket: async () => {
    const { authUser, authToken, userList } = get();
    if (!authUser) return;

    const wss = new WebSocket(`${BASE_URL}?auth_token=${authToken.replace('Bearer ', '')}`);
    set({ socket: wss });

    const waitFor = conditionFunction => {
      const poll = resolve => {
        if(conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 400);
      }
    
      return new Promise(poll);
    }

    await waitFor(_ => wss.readyState === 1);

    wss.send(JSON.stringify(
      { command: "subscribe", identifier: JSON.stringify({ channel: "UserChannel" }) }
    ))
    wss.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (['ping', 'welcome', 'confirm_subscription'].includes(data.type)) return;
      if (JSON.parse(data.identifier).channel !== "UserChannel") return;
      console.log(data);

      const message = data.message.message;
      const userListCopy = [...userList];
      if (message.includes("online")) {
        const userId = message.replace("user online-", "")
        
        set({ userList: pushItemToTop(userList, { ...userList.find(u => u.id.toString() === userId), online: true }) })
      } else {
        const userId = message.replace("user offline-", "")
        ;
        set({ userList: pushItemToTop(userList, { ...userList.find(u => u.id.toString() === userId), online: false }) })
      }
    }

    wss.onerror = (error) => console.log(error);    
  },

  disconnectSocket: () => {
    const { socket } = get();
    socket.close();
  },
}));
