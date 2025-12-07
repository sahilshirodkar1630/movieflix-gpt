import React from 'react';
import MovieList from './MovieList';
import { useSelector } from 'react-redux';

const SecondaryContainer = () => {

  const movies = useSelector((state) => state.movies);

  console.log("SecondaryContainer movies: ", movies);

    return <div className=' w-screen bg-black'>
      <div className='md:-mt-96 pl-2 md:pl-6 relative z-20'>
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
