import  { useRef, useState } from "react";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  updateProfile
} from "firebase/auth";
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
    // 🔹 Handle Sign Up
  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name.current.value,
        photoURL: PROFILE_BLUE_LOGO,
      });

      const { uid, email: userEmail, displayName, photoURL } = auth.currentUser;

      dispatch(addUser({ uid, email: userEmail, displayName, photoURL: photoURL || PROFILE_BLUE_LOGO}));
    } catch (error) {
      setErrorMessage(error.code + " - " + error.message);
    }
  };

  // 🔹 Handle Sign In
  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      );

      console.log("Signed in:", userCredential.user);
    } catch (error) {
      setErrorMessage(error.code + " - " + error.message);
    }
  };

  const handleButtonClick = () => {
    // Validate Form Data
    const message = checkValidData(email.current.value, password.current.value);
    setErrorMessage(message);
    if (message) return;


    //Sign In / Sign Up logic
   
    isSignInForm ? handleSignIn() : handleSignUp();
  };


  const toggleSignInForm = () => {
    SetIsSignInForm(!isSignInForm);
  };


  return (
    <div className="h-screen w-full m-0 overflow-hidden">
      <Header />

      {/* Background */}
      <div className="absolute inset-0">
        <img 
        className="w-full h-full object-cover"
          src={APP_IMG_BG_URL}
          alt="logo"
        />
      </div>

      {/* Form */}
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
