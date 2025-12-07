import React, { useRef, useState } from "react";
import { createUserWithEmailAndPassword ,signInWithEmailAndPassword, updateProfile} from "firebase/auth";
import Header from "./Header";
import { checkValidData } from "../utils/validate";
import { auth } from "../utils/firebase";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { APP_IMG_BG_URL, PROFILE_BLUE_LOGO } from "../utils/constants";

const Login = () => {
  const [isSignInForm, SetIsSignInForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch();

  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);

  const handleButtonClick = () => {
    // Validate Form Data
    const message = checkValidData(email.current.value, password.current.value);
    setErrorMessage(message);


    if (message) return;

    //Sign In / Sign Up logic
    if (!isSignInForm) {
      // Sign Up logic
      createUserWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value,
      )
        .then((userCredential) => {
          // Signed up
          const user = userCredential.user;
          updateProfile(user, {
            displayName: name.current.value, photoURL: {PROFILE_BLUE_LOGO}
          }).then(() => {
            const {uid,email,displayName,photoURL} = auth.currentUser;
            dispatch(
              addUser({uid:uid,email:email,displayName:displayName,photoURL:photoURL})
            );
          }).catch((error) => {
            // An error occurred
            // ...
            setErrorMessage(error.message)
          });
          console.log(user);
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setErrorMessage(errorCode +" - "+errorMessage)
          // ..
        });
    } else {
      //Sign In Logic
      signInWithEmailAndPassword(auth, email.current.value, password.current.value)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          console.log(user)
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setErrorMessage(errorCode +" - "+errorMessage)
        });
    }
  };

  const toggleSignInForm = () => {
    SetIsSignInForm(!isSignInForm);
  };


  return (
    <div className="h-screen w-full m-0 overflow-hidden">
      <Header />

      <div className="absolute ">
        <img 
        className="h-screen object-cover"
          src={APP_IMG_BG_URL}
          alt="logo"
        />
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="absolute w-full md:w-3/12 py-12 px-12 bg-black my-36 mx-auto right-0 left-0 text-white rounded-lg bg-opacity-80"
      >
        <h1 className="font-bold text-3xl py-2">
          {isSignInForm ? "Sign In" : "Sign Up"}
        </h1>
        {!isSignInForm && (
          <input
            ref={name}
            type="text"
            placeholder="Full Name"
            className="p-4 my-4 w-full bg-gray-800"
          />
        )}
        <input
          ref={email}
          type="text"
          placeholder="Email Address"
          className="p-4 my-4 w-full bg-gray-800"
        />
        <input
          ref={password}
          type="Password"
          placeholder="Password"
          className="p-4 my-4 w-full bg-gray-800"
        />

        <p className=" py-2 text-red-500 font-bold text-lg">{errorMessage}</p>

        <button
          className="p-4 my-4 bg-red-700 w-full rounded-lg"
          onClick={handleButtonClick}
        >
          {isSignInForm ? "Sign In" : "Sign Up"}
        </button>

        <p className="py-4 cursor-pointer" onClick={toggleSignInForm}>
          {" "}
          {isSignInForm
            ? "New to Netflix? Sign Up Now"
            : "Already Registered? Sign In Now"}
        </p>
      </form>
    </div>
  );
};

export default Login;
