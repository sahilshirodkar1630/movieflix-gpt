import MovieCard from "./MovieCard";

const MovieList = ({ title, movies }) => {
  console.log("Title:", title);
  console.log("Movies:", movies);
  if (!movies) return null;
  return (
    <div className="px-6  scrollbar-hide  ">
      <h1 className=" text-lg md:text-3xl py-4 font-medium text-white">{title}</h1>
      <div className="flex overflow-x-scroll no-scrollbar ">
        <div className='flex '>
          {movies?.map((movie) => (
            <MovieCard key={movie.id} posterPath={movie.poster_path} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;
