# Code Walkthrough — MovieFlix GPT

This document explains the front-end code file by file so that someone who has never seen the project — or is new
to React — can understand **what each piece does, why it is written that way, and how data flows through the app**.

Read the [README](../README.md) first for features and setup.

---

## Contents

1. [The big picture](#1-the-big-picture)
2. [React, Redux and hooks — the concepts you need](#2-react-redux-and-hooks--the-concepts-you-need)
3. [Start-up: index.js, App.js, Body.js](#3-start-up-indexjs-appjs-bodyjs)
4. [Configuration: constants, Firebase, Gemini](#4-configuration-constants-firebase-gemini)
5. [The Redux store and its four slices](#5-the-redux-store-and-its-four-slices)
6. [Authentication](#6-authentication)
7. [Header and profile menu](#7-header-and-profile-menu)
8. [Data-fetching hooks](#8-data-fetching-hooks)
9. [The Browse page](#9-the-browse-page)
10. [Trailers: hero background and hover preview](#10-trailers-hero-background-and-hover-preview)
11. [GPT search](#11-gpt-search)
12. [Multi-language support](#12-multi-language-support)
13. [Styling with Tailwind](#13-styling-with-tailwind)
14. [Build and hosting files](#14-build-and-hosting-files)
15. [End-to-end traces](#15-end-to-end-traces)
16. [Glossary](#16-glossary)

---

## 1. The big picture

```
                   ┌─────────────────────────── Redux store ────────────────────────────┐
                   │  user        movies                       gpt               config  │
                   │  {uid,…}     nowPlaying/popular/…         showGptSearch     lang    │
                   │              trailerVideos{id: video}     names/results             │
                   └───────▲──────────────▲───────────────────────────▲───────────▲─────┘
                           │ dispatch     │ dispatch                  │ dispatch  │ dispatch
   Firebase Auth ──► useAuthListener   fetch hooks ◄── TMDB      GptSearchBar ◄── Gemini + TMDB
                           │              │                          │
                           ▼ useSelector  ▼ useSelector              ▼ useSelector
                       Header        MainContainer / MovieList   GptMovieSuggestions
```

- **Services outside the app**: Firebase (accounts), TMDB (movies, trailers, posters), Gemini (recommendations),
  YouTube (video playback).
- **Hooks and event handlers** call those services and **dispatch** the results into Redux.
- **Components** read what they need from Redux with `useSelector` and re-render when it changes.

---

## 2. React, Redux and hooks — the concepts you need

| Concept | One-line explanation | Where you see it |
|---|---|---|
| **Component** | A function that returns UI (JSX) | Every file in `components/` |
| **Props** | Inputs passed from a parent component | `<MovieList title movies />` |
| **JSX** | HTML-like syntax inside JavaScript | All components |
| **`useState`** | Local state; changing it re-renders the component | `Login` (form mode, error), `MovieList` (hover data), `ProfileMenu` (open/closed) |
| **`useRef`** | A box holding a value that survives re-renders without causing one; also a handle to a DOM element | Login inputs, GPT search input, `MovieCard` position |
| **`useEffect`** | Run side-effects (network calls, subscriptions) after render | Fetch hooks, auth listener |
| **Custom hook** | A function starting with `use` that bundles hooks for reuse | `hooks/` folder |
| **Redux store** | One global object holding shared state | `utils/appStore.js` |
| **Slice** | A piece of the store with its initial state and reducer functions | `utils/*Slice.js` |
| **Action / dispatch** | Send "what happened" to the store, e.g. `dispatch(addUser(user))` | Hooks and handlers |
| **`useSelector`** | Read part of the store and subscribe to changes | Most components |
| **Redux Toolkit + Immer** | Lets reducers "mutate" state (`state.lang = …`); Immer turns it into an immutable update | All slices |

---

## 3. Start-up: index.js, App.js, Body.js

### `src/index.js`

```js
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
reportWebVitals();
```

Finds `<div id="root">` in `public/index.html` and renders the app into it. `React.StrictMode` is commented out —
in development StrictMode runs effects twice, which would make every API call fire twice.

### `src/App.js`

```js
<Provider store={appStore}><Body/></Provider>
```

`Provider` makes the Redux store available to every component below it.

### `src/components/Body.js`

```js
const appRouter = createBrowserRouter([
  { path: "/",       element: <Login/> },
  { path: "/browse", element: <Browse/> },   // BrowsingPage/Browse
]);
return <RouterProvider router={appRouter} />;
```

Two routes. `createBrowserRouter` uses real URLs (`/browse`) via the browser History API. The router has to wrap
`Header`, because `Header` uses `useNavigate` (through `useAuthListener`), which only works inside a router.

---

## 4. Configuration: constants, Firebase, Gemini

### `src/utils/constants.js`

| Constant | Purpose |
|---|---|
| `APP_LOGO`, `APP_IMG_BG_URL` | Logo and login/search background images |
| `PROFILE_RED_LOGO`, `PROFILE_BLUE_LOGO` | Avatar in the header; default avatar saved at sign-up |
| `API_OPTIONS` | `fetch` options for every TMDB call: `GET`, JSON, `Authorization: Bearer <REACT_APP_TMDB_API_KEY>` |
| `IMG_CDN_URL` | TMDB image CDN prefix (`w780` = 780 px wide) |
| `SUPPORTED_LANGUAGES` | Options of the language dropdown (`en`, `hindi`, `spanish`, `marathi`, `konkani`) |
| `GEMINI_API_KEY` | From `REACT_APP_GEMINI_API_KEY` |

Keeping URLs and keys in one file means changing an endpoint or image is a one-line change.

`process.env.REACT_APP_*` values are injected by Create React App **at build time** from `.env`.

### `src/utils/firebase.js`

```js
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);
```

Initialises the Firebase app once and exports the `auth` object used for every auth call. The `firebaseConfig`
values (apiKey, projectId, …) identify the Firebase project; they are designed to be public — access is controlled
by Firebase's authorised domains and security rules.

### `src/utils/gemini.js`

```js
const geminiModel = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
export default geminiModel;
```

One shared Gemini client from the `@google/genai` SDK.

---

## 5. The Redux store and its four slices

### `appStore.js`

```js
configureStore({
  reducer: { user: userReducer, config: configReducer, movies: moviesReducer, gpt: gptReducer }
});
```

The keys become the top-level state: `store.user`, `store.config`, `store.movies`, `store.gpt`.

### `userSlice.js`

```js
initialState: null,
reducers: {
  addUser:    (state, action) => action.payload,   // replace with the user object
  removeUser: () => null,
}
```

Returning a value from a reducer replaces the whole slice — needed here because the state itself is `null` or an
object.

### `moviesSlice.js`

```js
initialState: {
  nowPlayingMovies: null, popularMovies: null, topRatedMovies: null, upcomingMovies: null,
  trailerVideos: {}                                   // { [movieId]: video }
},
reducers: {
  addNowPlayingMovies: (state, action) => { state.nowPlayingMovies = action.payload; },
  ...
  addTrailerVideos: (state, action) => {
    const { movieId, trailer } = action.payload;
    state.trailerVideos[movieId] = trailer;          // cache by id
  },
  removeMovie: () => null,
}
```

Each list stores TMDB's full response (`{ page, results: [...], total_pages, … }`), so components read
`movies.nowPlayingMovies.results`.

`trailerVideos` is a **dictionary keyed by movie id**. The hero banner and every hover preview share it, so a
trailer is fetched once per movie no matter how many components need it.

### `gptSlice.js`

```js
initialState: { showGptSearch: false, gptMovieResults: null, gptMovieNames: null },
reducers: {
  toggleGptSearchView: (state) => { state.showGptSearch = !state.showGptSearch; },
  addGptMovieResults: (state, action) => {
    const { movieNames, tmdbResults } = action.payload;
    state.gptMovieResults = tmdbResults;   // array of arrays, one per name
    state.gptMovieNames  = movieNames;     // array of strings
  },
}
```

`gptMovieNames[i]` and `gptMovieResults[i]` belong together (same index).

### `configSlice.js`

`{ lang: 'en' }` with `changeLanguage(lang)`.

---

## 6. Authentication

### `utils/validate.js`

```js
const isEmailValid    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isPasswordValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password);
if (!isEmailValid)    return "Email is not valid";
if (!isPasswordValid) return "Password is not valid";
return null;
```

- Email: something, `@`, something, `.`, something — no spaces.
- Password: the `(?=…)` parts are **look-aheads** — "somewhere there is a digit", "…a lowercase letter",
  "…an uppercase letter" — and `.{8,}` requires at least 8 characters.
- Returns an error message, or `null` when valid. Checking locally gives instant feedback and saves a network call.

### `components/Login.js`

**State and refs**

```js
const [isSignInForm, SetIsSignInForm] = useState(true);   // which mode the form is in
const [errorMessage, setErrorMessage] = useState(null);
const name = useRef(null), email = useRef(null), password = useRef(null);
```

The inputs are **uncontrolled**: `<input ref={email} />` — the value is read only when the button is clicked
(`email.current.value`), so typing does not re-render the component.

**Button click**

```js
const message = checkValidData(email.current.value, password.current.value);
setErrorMessage(message);
if (message) return;
isSignInForm ? handleSignIn() : handleSignUp();
```

**Sign-up**

```js
const { user } = await createUserWithEmailAndPassword(auth, email, password);
await updateProfile(user, { displayName: name.current.value, photoURL: PROFILE_BLUE_LOGO });
const { uid, email: userEmail, displayName, photoURL } = auth.currentUser;
dispatch(addUser({ uid, email: userEmail, displayName, photoURL: photoURL || PROFILE_BLUE_LOGO }));
```

Firebase creates the account and signs the user in. The name and avatar are added in a second call, so the user is
dispatched again afterwards — otherwise the auth listener (which fired at account creation) would have stored a user
without a name.

**Sign-in** — `signInWithEmailAndPassword`; Redux and navigation are handled by the listener below.

**Errors** — Firebase errors (e.g. `auth/invalid-credential`) are shown as `code - message` under the inputs.

**Form** — `onSubmit={(e) => e.preventDefault()}` stops the browser from reloading the page; the toggle text
switches between "New to Netflix? Sign Up Now" and "Already Registered? Sign In Now", and the Full Name input only
renders in sign-up mode.

### `hooks/useAuthListener.js`

```js
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      const { uid, email, displayName, photoURL } = user;
      dispatch(addUser({ uid, email, displayName, photoURL }));
      navigate("/browse");
    } else {
      dispatch(removeUser());
      navigate("/");
    }
  });
  return () => unsubscribe();     // cleanup when the component unmounts
}, []);
```

- `onAuthStateChanged` fires on page load (restoring a saved session), after sign-in/sign-up and after sign-out.
- This is the **single source of truth** for "who is logged in" and for redirects — Login and Header never navigate
  themselves.
- Only plain fields are copied into Redux (the Firebase `User` object is not serialisable).
- The **cleanup function** removes the listener. Without it, every mount would add another listener.
- `[]` → run once when the component mounts.

---

## 7. Header and profile menu

### `components/Header.js`

```js
useAuthListener();                                     // start the auth listener here
const user    = useSelector(store => store.user);
const showGpt = useSelector(store => store.gpt.showGptSearch);
const handleSignOut = () => signOut(auth);              // listener will clear Redux and redirect
```

Renders:

- the logo (always),
- and, only when `user` exists:
  - the **language `<select>`** — only in GPT mode — dispatching `changeLanguage(e.target.value)`,
  - the **GPT Search / Home** button dispatching `toggleGptSearchView()`,
  - `ProfileMenu`.

`Header` appears on both pages, so the listener is always active.

### `components/ProfileMenu.js`

`useState(open)`; `onMouseEnter` / `onMouseLeave` open and close a dropdown showing the user's `photoURL` and
`displayName` plus a **Sign out** row (with the `LogOut` icon from `lucide-react`) calling `onSignOut`.

---

## 8. Data-fetching hooks

All four list hooks have the same shape — here `useNowPlayingMovies`:

```js
const dispatch = useDispatch();
const nowPlayingMovies = useSelector(store => store.movies.nowPlayingMovies);

const getNowPlayingMovies = async () => {
  const data = await fetch('https://api.themoviedb.org/3/movie/now_playing?page=1', API_OPTIONS);
  const json = await data.json();
  dispatch(addNowPlayingMovies(json));
};

useEffect(() => {
  !nowPlayingMovies && getNowPlayingMovies();   // only if not already loaded
}, []);
```

| Hook | TMDB endpoint | Stores into |
|---|---|---|
| `useNowPlayingMovies` | `/movie/now_playing` | `movies.nowPlayingMovies` |
| `usePopularMovies` | `/movie/popular` | `movies.popularMovies` |
| `useTopRatedMovies` | `/movie/top_rated` | `movies.topRatedMovies` |
| `useUpcomingMovies` | `/movie/upcoming` | `movies.upcomingMovies` |

**Memoisation:** switching to GPT search and back unmounts and remounts the browse components; because the data is
already in Redux, nothing is refetched.

Why custom hooks? The component just says `useNowPlayingMovies();` — the *how* (URL, headers, parsing, storing)
lives in one reusable place.

---

## 9. The Browse page

### `BrowsingPage/Browse.js`

```js
const showGptSearch = useSelector(store => store.gpt.showGptSearch);
useNowPlayingMovies(); usePopularMovies(); useTopRatedMovies(); useUpcomingMovies();

return (
  <div>
    <Header />
    {showGptSearch ? <GptSearch /> : (<><MainContainer /><SecondaryContainer /></>)}
  </div>
);
```

Starts all four fetches, then shows either the AI search or the normal browse view — **conditional rendering**
driven by Redux, on the same URL.

### `BrowsingPage/MainContainer.js` — the hero

```js
const movies = useSelector(store => store.movies?.nowPlayingMovies?.results);
if (!movies) return;                       // data not loaded yet → render nothing
const { id, original_title, overview } = movies[0];
return (
  <div className='relative w-screen h-screen ...'>
    <VideoTitle title={original_title} overview={overview}/>
    <VideoBackground movieId={id}/>
    <div className="absolute bottom-0 ... bg-gradient-to-t from-black to-transparent z-10" />
  </div>
);
```

The `?.` (optional chaining) avoids crashes while data is still `null`. The bottom gradient blends the video into
the rows below.

### `BrowsingPage/VideoTitle.js`

Absolutely positioned over the video with a left-to-right dark gradient for readable text: large title, overview
(hidden on small screens with `hidden md:inline-block`), a white **Play** button and a grey **More Info** button
with inline SVG icons.

### `BrowsingPage/SecondaryContainer.js`

```js
const movies = useSelector(state => state.movies);
<div className='mt-[-150px] md:mt-[-250px] px-2 md:px-6 relative z-20'>
  <MovieList title="Now Playing" movies={movies?.nowPlayingMovies?.results}/>
  <MovieList title="Trending"    movies={movies?.topRatedMovies?.results}/>
  <MovieList title="Popular"     movies={movies?.popularMovies?.results}/>
  <MovieList title="Upcoming"    movies={movies?.upcomingMovies?.results}/>
  ...
</div>
```

The **negative top margin** pulls the first rows up over the bottom of the hero, the classic Netflix overlap;
`z-20` keeps them above the video.

### `BrowsingPage/MovieList.js`

```js
const [hoverData, setHoverData] = useState(null);
if (!movies) return null;
return (
  <div className="px-6 md:px-12 py-6 relative">
    {hoverData && <TrailerPreview hoverData={hoverData} />}
    <h1 className="text-lg md:text-3xl ...">{title}</h1>
    <div className="flex overflow-x-scroll no-scrollbar scroll-smooth">
      <div className='flex gap-3 md:gap-4'>
        {movies.map(movie => (
          <MovieCard key={movie.id} movieData={movie} onHover={setHoverData} />
        ))}
      </div>
    </div>
  </div>
);
```

- A horizontal flex row that scrolls (`overflow-x-scroll`) with the scrollbar hidden (`no-scrollbar` from the
  `tailwind-scrollbar-hide` plugin).
- `key={movie.id}` helps React track items efficiently when the list changes.
- The row owns `hoverData` and passes `setHoverData` down to each card — **lifting state up**, so only one preview
  per row is shown.

### `BrowsingPage/MovieCard.js`

```js
const cardRef = useRef(null);
const handleMouseEnter = () => {
  const rect = cardRef.current.getBoundingClientRect();   // where the card is on screen
  onHover({ movie: movieData, position: rect });
};
<div ref={cardRef} className="w-36 md:w-44 px-4 hover:scale-125"
     onMouseEnter={handleMouseEnter} onMouseLeave={() => onHover(null)}>
  <img alt="" src={IMG_CDN_URL + movieData.poster_path} />
</div>
```

`getBoundingClientRect()` returns the card's `top`, `left`, `width`, … in the viewport, which the preview uses to
position itself. `hover:scale-125` enlarges the poster on hover.

---

## 10. Trailers: hero background and hover preview

### `hooks/useMovieTrailer.js`

```js
const trailerVideos = useSelector(store => store.movies.trailerVideos);

useEffect(() => {
  if (!movieId) return;
  if (trailerVideos[movieId]) return;          // already cached → skip

  const fetchTrailer = async () => {
    const data = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos`, API_OPTIONS);
    const json = await data.json();
    if (!json.results) return;

    const official = json.results.filter(v => v.type === "Trailer" && v.name === "Official Trailer");
    const trailer = official.length > 0 ? official[0] : json.results[0];   // fallback: any video

    dispatch(addTrailerVideos({ movieId, trailer }));
  };
  fetchTrailer();
}, [movieId, trailerVideos, dispatch]);
```

TMDB returns many videos per movie (teasers, clips, featurettes); the hook prefers the one named "Official
Trailer" and otherwise uses the first video. The result's `key` is a YouTube video id.

### `BrowsingPage/VideoBackground.js`

```js
useMovieTrailer(movieId);
const trailerVideo = useSelector(store => store.movies.trailerVideos?.[movieId]);

<iframe className="w-full h-full object-cover aspect-video"
  src={`https://www.youtube.com/embed/${trailerVideo?.key}?&autoplay=1&mute=1&loop=1&playlist=${trailerVideo?.key}&controls=0&modestbranding=1`}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" />
```

YouTube embed parameters:

| Parameter | Effect |
|---|---|
| `autoplay=1` | Start immediately |
| `mute=1` | Required — browsers only allow autoplay for muted video |
| `loop=1` + `playlist=<same id>` | Loop a single video (YouTube needs the playlist parameter for looping) |
| `controls=0`, `modestbranding=1` | Hide controls and reduce branding — looks like a background |

The container is `absolute … -z-10`, so the video sits behind the title.

### `BrowsingPage/TrailerPreview.js`

```js
const { movie, position } = hoverData;
useMovieTrailer(movie.id);
const trailer = useSelector(store => store.movies.trailerVideos?.[movie.id]);
if (!trailer) return null;

<div className="fixed z-50 bg-black ..."
     style={{ top: position.top - 220, left: position.left, width: position.width * 2 }}>
  <iframe className="w-full h-48" src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1`} />
  <div className="p-2"><h2>{movie.title || movie.original_title}</h2></div>
</div>
```

- `position: fixed` + the card's viewport coordinates places the preview **220 px above** the hovered card at
  **twice** its width.
- It renders nothing until the trailer is in Redux, then appears automatically when the fetch completes.
- Moving the mouse away sets `hoverData` to `null` in `MovieList`, which removes the preview.

---

## 11. GPT search

### `GptSearchPage/GptSearch.js`

A fixed full-screen background image (`-z-10`) with `GptSearchBar` and `GptMovieSuggestions` on top.

### `GptSearchPage/GptSearchBar.js`

```js
const langKey = useSelector(store => store.config.lang);
const searchText = useRef(null);

const searchMovieInTmdb = async (movieName) => {
  const url = 'https://api.themoviedb.org/3/search/movie?query=' + movieName +
              '&include_adult=false&language=en-US&page=1';
  const data = await fetch(url, API_OPTIONS);
  return (await data.json()).results;          // array of matching movies
};

const handleGptSearchClick = async () => {
  const gptQuery =
    "Act as a Movie recommendation engine. " +
    "Suggest me some movies based on: " + searchText.current.value +
    " Only give me names of 10 movies,comma separated like the example result given ahead. " +
    "Example Result: Gadar, Sholay, Dangal, 3 Idiots, Lagaan, Taare Zameen Par, Chak De India, Swades, Munna Bhai M.B.B.S., PK";

  const response = await geminiModel.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: gptQuery,
  });

  const gptMoviesArray = response.text.split(",");
  const promiseArray  = gptMoviesArray.map(name => searchMovieInTmdb(name.trim()));
  const tmdbResults   = await Promise.all(promiseArray);

  dispatch(addGptMovieResults({ movieNames: gptMoviesArray, tmdbResults }));
};
```

Step by step:

1. **Prompt engineering** — the prompt gives Gemini a role ("movie recommendation engine"), the user's request, a
   strict output format (10 names, comma-separated) and a **one-shot example** of that format. A predictable format
   is what makes step 3 possible.
2. **Gemini call** — `generateContent` with the `gemini-2.5-flash` model; `response.text` is the plain-text answer.
3. **Parse** — `split(",")` → an array of names.
4. **Ground in real data** — Gemini only returns names; TMDB turns each into real movies with posters and ids.
5. **Parallel requests** — `map` starts all 10 searches at once (each returns a Promise), and `Promise.all` waits for
   all of them. Ten sequential requests would take roughly ten times as long.
6. **Store** — names and results go into the `gpt` slice.

The input placeholder and button label come from `lang[langKey]` (section 12).

### `GptSearchPage/GptMovieSuggestions.js`

```js
const { gptMovieResults, gptMovieNames } = useSelector(state => state.gpt);
if (!gptMovieNames) return null;
return (
  <div className="p-4 m-4 bg-black text-white bg-opacity-80">
    {gptMovieNames.map((movie, index) => (
      <MovieList key={movie} title={movie} movies={gptMovieResults[index]} />
    ))}
  </div>
);
```

Each suggested name becomes a row titled with that name, showing all TMDB matches for it. Reusing `MovieList` means
AI results get posters, scrolling and hover trailers for free.

---

## 12. Multi-language support

### `utils/languageConstants.js`

```js
const lang = {
  en:      { search: "Search", gptSearchPlaceholder: "What would you like to watch today?", ... },
  hindi:   { search: "खोज",   gptSearchPlaceholder: "आप आज क्या देखना चाहेंगे?", ... },
  spanish: { ... }, marathi: { ... }, konkani: { ... },
};
```

A dictionary: language key → UI strings.

### How it flows

1. `Header` shows a `<select>` built from `SUPPORTED_LANGUAGES` (only in GPT mode).
2. Changing it dispatches `changeLanguage("hindi")` → `store.config.lang = "hindi"`.
3. `GptSearchBar` reads `langKey` and renders `lang[langKey].gptSearchPlaceholder` and `lang[langKey].search`.
4. Redux re-renders the search bar instantly in the new language.

Adding a language = one entry in `SUPPORTED_LANGUAGES` + one object in `languageConstants.js`.

---

## 13. Styling with Tailwind

- `tailwind.config.js` scans `./src/**/*.{js,jsx,ts,tsx}` for class names and adds the `tailwind-scrollbar-hide`
  plugin (`no-scrollbar` class).
- `index.css` contains the Tailwind directives.

Patterns used throughout:

| Pattern | Example | Purpose |
|---|---|---|
| Layering | `absolute`, `fixed`, `-z-10`, `z-20`, `z-50` | Video behind text; rows over video; preview on top |
| Gradients | `bg-gradient-to-b from-black`, `bg-gradient-to-t from-black to-transparent` | Readable header and smooth hero → rows transition |
| Responsive | `md:w-3/12`, `hidden md:inline-block`, `md:pt-[8%]` | Different layout from 768 px up |
| Arbitrary values | `mt-[-250px]`, `bg-[#141414]` | Exact values not in the default scale |
| Interaction | `hover:scale-125`, `hover:bg-gray-700`, `transition` | Hover feedback |
| Transparency | `bg-opacity-80`, `bg-black/70` | See-through overlays |

---

## 14. Build and hosting files

| File | Purpose |
|---|---|
| `package.json` | Dependencies and scripts (`start`, `build`, `test`, `eject`) via `react-scripts` |
| `public/index.html` | The HTML page with `<div id="root">` |
| `public/manifest.json`, icons | PWA metadata and icons |
| `firebase.json` | Firebase Hosting serves the `build/` folder |
| `.firebaserc` | Default Firebase project for `firebase deploy` |
| `.firebase/*.cache` | Firebase CLI's upload cache (generated) |
| `.gitignore` | Ignores `node_modules`, `build`, `.env` |
| `src/setupTests.js`, `reportWebVitals.js` | Create React App defaults for Jest and performance metrics |

### Unused files

The components directly under `src/components/` — `Browse.js`, `MainContainer.js`, `SecondaryContainer.js`,
`MovieList.js`, `MovieCard.js`, `VideoBackground.js`, `VideoTitle.js`, `GptSearch.js`, `GptSearchBar.js`,
`GptMovieSuggestions.js` — are **earlier versions** kept from before the code was reorganised into `BrowsingPage/`
and `GptSearchPage/`. Nothing imports them; `Body.js` uses `BrowsingPage/Browse`.

---

## 15. End-to-end traces

### A. First visit and sign-up

1. `index.js` → `App` (Redux `Provider`) → `Body` (router) → `/` → `Login`.
2. `Login` renders `Header`, which starts `useAuthListener`; Firebase reports "no user" → `removeUser()` →
   `navigate("/")`.
3. User switches to Sign Up, fills the form, clicks the button → `checkValidData` passes.
4. `createUserWithEmailAndPassword` → Firebase signs the user in → listener fires → `addUser` → `navigate("/browse")`.
5. `updateProfile` adds name and avatar → `addUser` again with the full profile.
6. `/browse` → `Browse` → four fetch hooks → four `add…Movies` dispatches.
7. `MainContainer` → `VideoBackground` → `useMovieTrailer(firstMovieId)` → `addTrailerVideos` → hero video plays.
8. `SecondaryContainer` → four `MovieList` rows of `MovieCard` posters.

### B. Hover a poster

`MovieCard.onMouseEnter` → `getBoundingClientRect()` → `MovieList.setHoverData({ movie, position })` →
`TrailerPreview` mounts → `useMovieTrailer(movie.id)` (fetch only if not cached) → floating player appears →
`onMouseLeave` → `setHoverData(null)` → preview disappears.

### C. AI search in Hindi

1. Header **GPT Search** → `toggleGptSearchView()` → `Browse` renders `GptSearch`.
2. Language select → `changeLanguage("hindi")` → placeholder becomes "आप आज क्या देखना चाहेंगे?".
3. User types "feel-good sports movies" → **खोज** → `handleGptSearchClick`.
4. Gemini returns "Chak De India, Lagaan, Dangal, …" → split → 10 parallel TMDB searches → `Promise.all`.
5. `addGptMovieResults` → `GptMovieSuggestions` renders 10 `MovieList` rows.

### D. Sign out

`ProfileMenu` → `signOut(auth)` → listener fires with no user → `removeUser()` → `navigate("/")`.

---

## 16. Glossary

| Term | Meaning |
|---|---|
| **SPA** | Single-page application: one HTML page, views change with JavaScript |
| **Create React App** | Tooling (`react-scripts`) that sets up Webpack, Babel, Jest and a dev server |
| **Redux Toolkit** | The official, concise way to write Redux |
| **Slice** | A part of the Redux state plus the reducers that update it |
| **Memoisation** | Remembering a result to avoid recomputing/refetching it |
| **Optional chaining (`?.`)** | Access a property only if the object exists, otherwise `undefined` |
| **Promise.all** | Wait for many promises at once; resolves with all results in order |
| **Uncontrolled input** | An input whose value lives in the DOM, read via a ref |
| **Prompt engineering** | Writing LLM instructions so the output is reliable and parseable |
| **TMDB** | The Movie Database, a community movie API |
| **Gemini** | Google's family of large language models |
| **Firebase Auth** | Google's hosted authentication service |
| **`onAuthStateChanged`** | Firebase callback fired whenever the signed-in user changes |
