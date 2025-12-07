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
        <div className='pt-[30%] bg-black md:pt-0'>
            <VideoTitle title={original_title} overview={overview}/>
            <VideoBackground movieId={id}/>
        </div>
    );
};

export default MainContainer;