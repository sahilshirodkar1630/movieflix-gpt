import MovieCard from "./MovieCard";
import { useState } from "react";
import TrailerPreview from "./TrailerPreview";


const MovieList = ({ title, movies }) => {

  console.log("Title:", title);
  console.log("Movies:", movies);
  const [hoverData, setHoverData] = useState(null);

  if (!movies) return null;

  
  return (
    <div className="px-6 md:px-12 py-6 relative">
      {/* 🎬 Floating Preview */}
      {hoverData && (
        <TrailerPreview hoverData={hoverData} />
      )}
      
      <h1 className=" text-lg md:text-3xl py-4 font-medium text-white">{title}</h1>
      <div className="flex overflow-x-scroll no-scrollbar scroll-smooth">
        <div className='flex gap-3 md:gap-4 '>
          {movies?.map((movie) => (
            <MovieCard
              key={movie.id}
              movieData={movie}
              onHover={setHoverData}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;
