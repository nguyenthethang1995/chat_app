import { MessageSquare } from "lucide-react";

const UserImageProfile = ({ user }) => {
  return (
    <>
      <img
        src={user.avatar_url || "/avatar.png"}
        alt={user.name}
        className={`max-w-[3rem] rounded-full object-cover border-4 aspect-square ${user.online ? "border-green-500" : "border-base-300"}`}
      />
    </>
  );
};

export default UserImageProfile;
