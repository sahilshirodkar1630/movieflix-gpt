import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { toggleGptSearchView } from "../utils/gptSlice";
import { changeLanguage } from "../utils/configSlice";
import useAuthListener from "../hooks/useAuthListener";
import ProfileMenu from "./ProfileMenu";

import { APP_LOGO, SUPPORTED_LANGUAGES } from "../utils/constants";

const Header = () => {
  useAuthListener(); // 🔥 clean separation
  const dispatch = useDispatch();

  const user = useSelector((store) => store.user);
  const showGpt = useSelector((store) => store.gpt.showGptSearch);

  const handleSignOut = () => signOut(auth);

  return (
    <div className="absolute w-screen px-8 py-2 bg-gradient-to-b from-black z-10 flex justify-between items-center">
      
      {/* Logo */}
      <img className="w-40" src={APP_LOGO} alt="logo" />

      {/* Right Section */}
      {user && (
        <div className="flex items-center gap-4">

          {/* Language Selector */}
          {showGpt && (
            <select
              className="p-2 bg-gray-600 text-white rounded-lg"
              onChange={(e) => dispatch(changeLanguage(e.target.value))}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.identifier} value={lang.identifier}>
                  {lang.name}
                </option>
              ))}
            </select>
          )}

          {/* GPT Toggle */}
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
            onClick={() => dispatch(toggleGptSearchView())}
          >
            {showGpt ? "Home" : "GPT Search"}
          </button>

          {/* Profile */}
          <ProfileMenu user={user} onSignOut={handleSignOut} />
        </div>
      )}
    </div>
  );
};

export default Header;