import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { pushItemToTop } from "../lib/utils";

export const useChatStore = create((set, get) => ({
  messages: {},
  groupChats: [],
  selectedGroupChat: null,
  isGroupChatsLoading: false,
  isMessagesLoading: false,

  getGroupChats: async () => {
    set({ isGroupChatsLoading: true });
    const { authToken } = useAuthStore.getState();
    const { subscribeToGroupChat } = get();
    try {
      const res = await axiosInstance.get("/group_chats", { headers: { "Authorization": authToken } });
      const group_chats = res.data.data;
      set({ groupChats: group_chats });
      await group_chats.forEach(g => subscribeToGroupChat(g))
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isGroupChatsLoading: false });
    }
  },

  createGroupChat: async (groupChatData) => {
    const { authToken } = useAuthStore.getState();
    const formData = new FormData();
    formData.append("group_chat[name]", groupChatData.name);
    formData.append("group_chat[created_by_id]", groupChatData.created_by_id);
    groupChatData.user_group_chats_attributes.forEach((member) => {
      formData.append(`group_chat[user_group_chats_attributes][][user_id]`, member);
    });
    if (groupChatData.avatar) {
      formData.append("group_chat[avatar]", groupChatData.avatar);
    }

    try {
      const res = await axiosInstance.post("/group_chats", formData, { headers: { "Authorization": authToken } });
      set((state) => ({ groupChats: [...state.groupChats, res.data.data] }));
      toast.success("Group chat created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  updateGroupChat: async (groupChatData) => {
    const { authToken } = useAuthStore.getState();
    const { selectedGroupChat } = get();
    const formData = new FormData();
    formData.append("group_chat[name]", groupChatData.name);
    groupChatData.user_group_chats_attributes.forEach((member) => {
      if (typeof member === "object" && member._destroy) {
        formData.append(`group_chat[user_group_chats_attributes][][id]`, member.id);
        formData.append(`group_chat[user_group_chats_attributes][][_destroy]`, true);
      } else if (typeof member === "object") {
        formData.append(`group_chat[user_group_chats_attributes][][id]`, member.id);
        formData.append(`group_chat[user_group_chats_attributes][][user_id]`, member.user_id);
      } else {
        formData.append(`group_chat[user_group_chats_attributes][][user_id]`, member.user_id);
      }
    });
    if (groupChatData.avatar) {
      formData.append("group_chat[avatar]", groupChatData.avatar);
    }
    try {
      const res = await axiosInstance.put(`/group_chats/${selectedGroupChat.id}`, formData, { headers: { "Authorization": authToken } });
      set((state) => ({
        groupChats: state.groupChats.map(g => g.id === selectedGroupChat.id ? res.data.data : g),
      }));
      toast.success("Group chat updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  getMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    const { authToken } = useAuthStore.getState();
    const { messages } = get();
    try {
      const res = await axiosInstance.get(`/group_chats/${groupId}/messages`, { headers: { "Authorization": authToken } });
      messages[groupId] = res.data.data
      
      set({ messages: messages });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedGroupChat } = get();
    const socket = useAuthStore.getState().socket;

    if (messageData.rawImages.length > 0) {
      const formData = new FormData();
      formData.append("message[content]", messageData.text);
      messageData.rawImages.forEach((image, index) => {
        formData.append(`message[images][]`, image);
      });
      // formData.append("message[images]", messageData.rawImages);
      formData.append("message[user_id]", useAuthStore.getState().authUser.id);
      formData.append("message[group_chat_id]", selectedGroupChat.id);
      await axiosInstance.post(`/group_chats/${selectedGroupChat.id}/messages`, formData, { headers: { "Authorization": useAuthStore.getState().authToken } })

    } else {  
      const msg = {
        "command": "message",
        "identifier": JSON.stringify({ channel: "GroupChatChannel", id: selectedGroupChat.id }),
        "data": JSON.stringify({ "action": "chat", "message": messageData["text"], "group_chat_id": selectedGroupChat.id })
      }
      socket.send(JSON.stringify(msg))
    }
  },

  subscribeToGroupChat: async (groupChat=null) => {
    const { selectedGroupChat, messages, groupChats } = get();
    const { socket, authUser } = useAuthStore.getState();
    if (!selectedGroupChat && !groupChat) return;

    const subscribeGroup = groupChat || selectedGroupChat

    await socket.send(JSON.stringify(
      { "command": "subscribe", "identifier": JSON.stringify({ channel: "GroupChatChannel", id: subscribeGroup.id }) }
    ))

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (['ping', 'welcome', 'confirm_subscription'].includes(data.type)) return;
      if (JSON.parse(data.identifier).channel !== "GroupChatChannel") return;
      
      const message = data.message;
      const groupChatId = message.group_chat_id;
      
      if (messages[groupChatId]?.some(m => m.id === message.id)) return;

      messages[groupChatId] = [...(messages[groupChatId] || []), message]

      set({ groupChats: pushItemToTop(groupChats, groupChats.find(g => g.id === groupChatId)) });

      if (message['user_id'] === authUser.id) return;

      toast.success(`${message.user_name}: ${message.content} in ${message.group_chat_name}`)
    }
  },

  unsubscribeFromGroupChat: () => {
    const { selectedGroupChat } = get();
    const socket = useAuthStore.getState().socket;
    // socket.send(JSON.stringify(
    //   { "command": "subscribe", "identifier": JSON.stringify({ channel: "GroupChatChannel", id: selectedGroupChat.id }) }
    // ))
  },

  setselectedGroupChat: (selectedGroupChat) => set({ selectedGroupChat: selectedGroupChat }),
}));
