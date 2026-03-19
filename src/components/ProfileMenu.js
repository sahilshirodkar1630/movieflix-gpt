import { useState } from "react";
import { LogOut } from "lucide-react";
import { PROFILE_RED_LOGO } from "../utils/constants";

const ProfileMenu = ({ user, onSignOut }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Avatar */}
      <img
        src={PROFILE_RED_LOGO}
        className="w-10 h-10 cursor-pointer rounded-sm"
        alt="profile"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-[#141414] rounded-md shadow-lg text-white z-50">
          
          <div className="flex items-center gap-2 p-3 hover:bg-gray-700">
            <img
              src={user.photoURL}
              className="w-8 h-8 rounded-sm"
              alt=""
            />
            <p>{user.displayName}</p>
          </div>

          <div className="border-t border-gray-700" />

          <div
            onClick={onSignOut}
            className="flex items-center gap-2 p-3 hover:bg-gray-700 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;