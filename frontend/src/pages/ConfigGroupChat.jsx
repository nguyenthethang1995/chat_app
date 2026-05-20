import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, UserCog, MessageSquareCode } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { redirect, useNavigate } from "react-router-dom";

const ConfigGroupChat = () => {
  const { authUser, isUpdatingProfile, updateProfile, userList } = useAuthStore();
  const { createGroupChat, selectedGroupChat, updateGroupChat } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(selectedGroupChat?.avatar_url || "");
  const [rawSelectedImg, setRawSelectedImg] = useState(null);
  const [groupChat, setGroupChat] = useState({
    name: selectedGroupChat?.name || "",
    members: selectedGroupChat?.members || []
  });
  const navigate = useNavigate();


  const handleUpsertGroupChat = async () => {
    // validate form
    if (!groupChat.name) {
      return toast.error("Group chat name is required");
    }

    try {
      if (selectedGroupChat) {
        await updateGroupChat({
          name: groupChat.name,
          user_group_chats_attributes: [...new Set([...selectedGroupChat.members, ...groupChat.members])].map(member => {
            
            const userGroupChatId = selectedGroupChat.user_group_chats[member];
            console.log('aaa', userGroupChatId);
            // if the member is new, add it, if not check if it should be kept or destroyed
            if (!userGroupChatId) {
              return { user_id: member };
            }
            // check if the member is in the updated members list, if yes keep it, if not mark it for destruction
            const isMember = groupChat.members.includes(member);
            return isMember ? { id: userGroupChatId, user_id: member } : { id: userGroupChatId, _destroy: true };
          }),
          avatar: rawSelectedImg
        });
      } else {
        await createGroupChat({
          name: groupChat.name,
          user_group_chats_attributes: [...groupChat.members, authUser.id],
          created_by_id: authUser.id,
          avatar: rawSelectedImg,
        });
      }

      navigate("/");
    } catch (error) {
      console.log("Error creating group chat:", error);
      toast.error(error.response.data.message || "Failed to create group chat");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      setSelectedImg(reader.result);
      setRawSelectedImg(file);
    };
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">{selectedGroupChat?.name || "New Group Chat"}</h1>
            <p className="mt-2">Your group chat information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <MessageSquareCode className="w-4 h-4" />
                Group Chat Name
              </div>
              <input
                type="text"
                placeholder="Enter group chat name"
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                value={groupChat.name}
                onChange={(e) => setGroupChat({ ...groupChat, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <UserCog className="w-4 h-4" />
                Edit Members
              </div>
              <div className="px-4 py-2.5 bg-base-200 rounded-lg border w-full max-h-60 overflow-y-auto">
                {userList.map(user => (
                  <label key={user.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={groupChat.members.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGroupChat({ ...groupChat, members: [...groupChat.members, user.id] });
                        } else {
                          setGroupChat({ ...groupChat, members: groupChat.members.filter(id => id !== user.id) });
                        }
                      }}
                      className="checkbox checkbox-sm"
                    />
                    <span>{user.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg bg-base-300 hover:bg-base-400 transition-colors">
              Cancel
            </button>
            <button onClick={handleUpsertGroupChat} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
              {selectedGroupChat ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ConfigGroupChat;
