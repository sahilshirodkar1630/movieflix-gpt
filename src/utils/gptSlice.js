import { createSlice } from "@reduxjs/toolkit";

const gptSlice = createSlice({
    name:'gpt',
    initialState:{
        showGptSearch:false,
        gptMovieResults: null,
        gptMovieNames: null
    },
    reducers:{
        toggleGptSearchView: (state,action) =>{
            state.showGptSearch = !state.showGptSearch;
        },
        addGptMovieResults: (state,action) =>{  
            const {movieNames, tmdbResults} = action.payload;
            state.gptMovieResults  = tmdbResults;
            state.gptMovieNames = movieNames;
        }

    }
});

export const { toggleGptSearchView,addGptMovieResults } = gptSlice.actions;
export default gptSlice.reducer;