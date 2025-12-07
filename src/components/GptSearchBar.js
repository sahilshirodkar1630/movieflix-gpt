import { useDispatch, useSelector } from "react-redux";
import lang from "../utils/languageConstants";
import { useRef } from "react";
import geminiModel from "../utils/gemini";
import { API_OPTIONS } from "../utils/constants";
import { addGptMovieResults } from "../utils/gptSlice";

const GptSearchBar = () => {
  const dispatch = useDispatch();
  const langKey = useSelector((store) => store.config.lang);
  const searchText = useRef(null);

  //search movie in tmdb apis
  const searchMovieInTmdb = async (movieName) => {
    const url = 'https://api.themoviedb.org/3/search/movie?query='+movieName+'&include_adult=false&language=en-US&page=1';
    const data = await fetch(url,API_OPTIONS);
    const jsonData = await data.json();
    return jsonData.results;
  }


  const handleGptSearchClick = async () => {
    // Make API Call to get Movie
    const gptQuery =
      "Act as a Movie recommendation engine. " +
      "Suggest me some movies based on: " +
      searchText.current.value +
      " Only give me names of 10 movies,comma separated like the example result given ahead. Example Result: Gadar, Sholay, Dangal, 3 Idiots, Lagaan, Taare Zameen Par, Chak De India, Swades, Munna Bhai M.B.B.S., PK";

    const response = await geminiModel.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: gptQuery,
    });

    const gptResults = response.text;
    console.log("GPT Results: ", response.text);
    if(!gptResults) {
        console.log("No results from GPT");
    };

    const gptMoviesArray = gptResults.split(",");
    //For each movie search in tmdb and get movie details
    const promiseArray = gptMoviesArray.map((movieName) => { 
       return searchMovieInTmdb(movieName.trim());
    });

    const tmdbResults = await Promise.all(promiseArray);
    console.log("TMDB Results: ", tmdbResults);

    dispatch(addGptMovieResults({movieNames:gptMoviesArray,tmdbResults}));

  };


  return (
    <div className="pt-[40%] md:pt-[8%] flex justify-center rounded-lg">
      <form
        className=" m-1 wd-full md:w-1/2  bg-black grid grid-cols-12"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          ref={searchText}
          type="text"
          className="p-4 m-4 col-span-9 rounded-lg"
          placeholder={lang[langKey].gptSearchPlaceholder}
        />
        <button
          className="mpy-2 px-4  m-4 bg-red-700 text-white rounded-lg col-span-3"
          onClick={handleGptSearchClick}
        >
          {lang[langKey].search}
        </button>
      </form>
    </div>
  );
};

export default GptSearchBar;
