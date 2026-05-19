import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Link } from "react-router-dom";

const ChatHeader = () => {
  const { selectedGroupChat, setSelectedGroupChat } = useChatStore();
  const { userList } = useAuthStore();

  const closeChat = () => {
    setSelectedGroupChat(null);
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <Link to={"/config-group-chat"}>
          <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="size-10 rounded-full relative">
                  <img src={selectedGroupChat.avatar_url || "/avatar.png"} alt={selectedGroupChat.name} />
                </div>
              </div>

              {/* User info */}
              <div>
                <h3 className="font-medium">{selectedGroupChat.name}</h3>
                <p className="text-sm text-base-content/70">
                  {selectedGroupChat.members.some(user => userList.filter(u => u.id === user && u.online).length > 0)}
                </p>
              </div>
          </div>
        </Link>

        {/* Close button */}
        <button onClick={closeChat}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
