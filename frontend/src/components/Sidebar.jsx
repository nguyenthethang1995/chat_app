import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { MessageSquareMore } from "lucide-react";
import UserImageProfile from "./UserImageProfile";

const Sidebar = () => {
  const { groupChats, getGroupChats, setselectedGroupChat, isGroupChatsLoading, selectedGroupChat } = useChatStore();
  const { userList } = useAuthStore();

  useEffect(() => {
    getGroupChats();
  }, []);
  
  if (isGroupChatsLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-4 overflow-x-auto">
          {/* <label className="cursor-pointer flex items-center gap-2"> */}
            {/* <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span> */}
          {/* </label> */}
          {userList.map(user => (
            <div key={user.id} className="relative text-center">
              <UserImageProfile user={user} />
              <span className="text-xs text-zinc-500">{user?.name?.substring(0,5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        <button onClick={() => setselectedGroupChat(null)}>
          <Link to={"/config-group-chat"} className={`btn btn-xl ml-10`}>
            <MessageSquareMore className="size-5" />
            <span className="hidden sm:inline">Create Group Chat</span>
          </Link>
        </button>

        {groupChats.map((group) => (
          <button
            key={group.id}
            onClick={() => setselectedGroupChat(group)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${group.id === selectedGroupChat?.id ? "border-l-4 border-green-500" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={group.avatar_url || "/avatar.png"}
                alt={group.name}
                className="size-12 object-cover rounded-full"
              />
              {group.members.filter(user => userList.includes(user)).length > 0 && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{group.name}</div>
              <div className="text-sm text-zinc-400">
                {group.members.some(user => userList.filter(u => u.id === user && u.online).length > 0)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};
export default Sidebar;
