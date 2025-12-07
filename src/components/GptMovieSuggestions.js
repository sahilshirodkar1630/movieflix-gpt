import { useSelector } from "react-redux";
import MovieList from "./MovieList";

const GptMovieSuggestions = () => {

    const {gptMovieResults,gptMovieNames} = useSelector((state) => state.gpt);
    if(!gptMovieNames) return null;


    return (
        <div className="p-4 m-4 bg-black text-white bg-opacity-80 ">
            <div>   
                {gptMovieNames.map((movie,index) => (
                    <MovieList 
                        key={movie} 
                        title={movie} 
                        movies={gptMovieResults[index]}
                    />
                ))}
            </div>


        </div>
    );
};

export default GptMovieSuggestions; 