import React from 'react';
import { useSelector } from 'react-redux';
import VideoTitle from './VideoTitle';
import VideoBackground from './VideoBackground';

const MainContainer = () => {

    const movies = useSelector(store => store.movies?.nowPlayingMovies?.results);
    if(!movies) return; // early return if movies is undefined 

    const movie = movies[0]; // get the first movie from the array
    const {id,original_title,overview} = movie;
    console.log("MainContainer movie: ", movie); // log the movie to verify
    console.log("Movie ID: ", id);
    return (
        <div className='relative w-screen h-screen pb-32 md:pb-48'>
            <VideoTitle title={original_title} overview={overview}/>
            <VideoBackground movieId={id}/>
            <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black to-transparent z-10" />
        </div>
    );
};

export default MainContainer;