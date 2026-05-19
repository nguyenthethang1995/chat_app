import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import UserImageProfile from "./UserImageProfile";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedGroupChat,
    subscribeToGroupChat,
    unsubscribeFromGroupChat,
  } = useChatStore();
  const { authUser, userList } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedGroupChat.id);

    // return () => unsubscribeFromGroupChat();
  }, [selectedGroupChat.id, getMessages]);

  useEffect(() => {
    subscribeToGroupChat();
  }, [selectedGroupChat.id])

  useEffect(() => {
    if (messageEndRef.current && messages[selectedGroupChat.id]) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages[selectedGroupChat.id]]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(messages[selectedGroupChat.id] || []).map((message) => (
          <div
            key={message.id}
            className={`chat ${message.user_id === authUser.id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <UserImageProfile user={message.user_id === authUser.id
                      ? authUser
                      : userList.find((user) => user.id === message.user_id)} />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.created_at)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message?.image_urls?.map((image_url) => ( 
                <img
                  src={image_url}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              ))}
              {<p>{message.content}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
