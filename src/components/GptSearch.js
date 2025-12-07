import React, { useState } from 'react';
import GptSearchBar from './GptSearchBar';
import GptMovieSuggestions from './GptMovieSuggestions';
import { APP_IMG_BG_URL } from '../utils/constants';

const GptSearch = () => {
    return (
    <>
         <div className="fixed -z-10 ">
                <img
                className='h-screen object-cover md:h-auto md:object-contain'
                src={APP_IMG_BG_URL}
                alt="logo"
                />
            </div>

        <div className ="">
            <GptSearchBar />
            <GptMovieSuggestions />
        </div>
    </>
    );
};

export default GptSearch;