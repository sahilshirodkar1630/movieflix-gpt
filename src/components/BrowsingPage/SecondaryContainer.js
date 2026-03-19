import React from 'react';
import MovieList from './MovieList';
import { useSelector } from 'react-redux';

const SecondaryContainer = () => {

  const movies = useSelector((state) => state.movies);

  console.log("SecondaryContainer movies: ", movies);

    return <div className=' w-screen bg-black'>
      <div className='mt-[-150px] md:mt-[-250px] px-2 md:px-6 relative z-20'>
      <MovieList title={"Now Playing"} movies ={movies?.nowPlayingMovies?.results}/>
      <MovieList title={"Trending"} movies ={movies?.topRatedMovies?.results}/>
      <MovieList title={"Popular"} movies ={movies?.popularMovies?.results}/>
      <MovieList title={"Upcoming"} movies ={movies?.upcomingMovies?.results}/>
      <MovieList title={"Now Playing"} movies ={movies?.nowPlayingMovies?.results}/>
      <MovieList title={"Now Playing"} movies ={movies?.nowPlayingMovies?.results}/>
      </div>
    </div>
}; 

export default SecondaryContainer;
