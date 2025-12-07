import React, { useState ,useEffect} from "react";
import { LogOut } from "lucide-react";
import { auth } from '../utils/firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux';
import { addUser, removeUser } from '../utils/userSlice';
import {onAuthStateChanged } from 'firebase/auth';
import { toggleGptSearchView } from "../utils/gptSlice.js";
import { APP_LOGO,PROFILE_RED_LOGO,PROFILE_BLUE_LOGO, SUPPORTED_LANGUAGES } from "../utils/constants.js";
import { changeLanguage } from "../utils/configSlice.js";


const Header = () => {
 const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(store => store.user);
  const gptSearch = useSelector(store => store.gpt.showGptSearch);

  const handleSignOut = () =>{
    signOut(auth).then(() => {
    }).catch((error) => {
      // An error happened.
      console.error(error);
    });
  };

  
  useEffect(() =>{
      console.log("Working");
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const {uid,email,displayName,photoURL} = user;
          dispatch(addUser({uid:uid,email:email,displayName:displayName,photoURL:photoURL}));
          navigate("/browse");
              // ...
        } else {
              // User is signed out
          dispatch(removeUser());
          navigate("/");
  
              // ...
        }
      });
      
      //Unsubscribe when component unmounts
      return () => unsubscribe();
    
  },[]);

  const handleGptSearchClick = () => {
  dispatch(toggleGptSearchView());
  }
  const handleLanguageChange = (e) => {
    dispatch(changeLanguage(e.target.value));
  }


  return (
    <div className='absolute w-screen px-8 py-2 bg-gradient-to-b from-black z-10 flex flex-col md:flex-row justify-between '>
      <img className='w-40 mx-auto md:mx-0'
      src= {APP_LOGO}
      alt='logo'
      />
        {user && (
          <div className="flex justify-between"> 
          { gptSearch && (
              <select className="p-2 my-5 mx-2 bg-gray-600 text-white rounded-lg"
              onChange={handleLanguageChange}
              >
                {SUPPORTED_LANGUAGES.map((lang) => 
                  <option key={lang.identifier} value={lang.identifier}>{lang.name}</option>
                )}
              </select>
            )
          }       
          <button className="py-0 px-4 my-5 mx-2 bg-red-600 text-white rounded-lg"
          onClick={handleGptSearchClick}>
            {gptSearch ? "Home Page" : "GPT Search" }
          </button>

          <div
          className="relative p-5"
          onMouseEnter={() => setIsProfileOpen(true)}
          onMouseLeave={() => setIsProfileOpen(false)}
        >
          {/* Profile Image */}
          <img
            src={PROFILE_RED_LOGO}
            alt="Sahil Shirodkar"
            className="w-12 h-12 rounded-sm cursor-pointer"
          />


          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div
              className="absolute right-0 top-[90%] w-56 bg-[#141414] text-white rounded-md 
                        shadow-[0_4px_15px_rgba(0,0,0,0.7)] border border-gray-800 text-sm 
                        transition-all duration-200 z-50"
            >
              {/* Little triangle pointer */}
              <div className="absolute right-6 -top-2 w-3 h-3 bg-[#141414] rotate-45 border-l border-t border-gray-700"></div>

              {/* Profile Section */}
              <div className="flex items-center space-x-3 px-4 py-2 hover:bg-[#2c2c2c] cursor-pointer mt-2">
                <img
                  className="w-8 h-8 rounded-sm object-cover text-white"
                  src={user.photoURL}
                  alt={user.displayName}
                />
                <p>{user.displayName}</p>
              </div>

              <div className="border-t border-gray-700 my-1" />

              {/* Sign Out */}
              <div onClick={handleSignOut}
              className="px-4 py-2 hover:bg-[#2c2c2c] cursor-pointer flex items-center gap-2 text-gray-300">
                <LogOut size={16} />
                <span>Sign out of Netflix</span>
              </div>
            </div>
          )}
        </div>
        </div>
        )
        }




    </div>
  )
}

export default Header;
