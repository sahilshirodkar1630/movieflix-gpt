import React, { useState } from 'react';
import { APP_IMG_BG_URL } from '../../utils/constants';
import GptMovieSuggestions from './GptMovieSuggestions';
import GptSearchBar from './GptSearchBar';

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