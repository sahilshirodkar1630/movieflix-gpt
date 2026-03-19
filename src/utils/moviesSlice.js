import { createSlice } from "@reduxjs/toolkit";

const moviesSlice = createSlice({
    name:'movie',
    initialState:{
        nowPlayingMovies: null,
        popularMovies: null,
        topRatedMovies: null,
        upcomingMovies: null,
        trailerVideos: {}
    },
    reducers:{
        addNowPlayingMovies: (state,action) =>{
            state.nowPlayingMovies =  action.payload;
        },
        addPopularMovies: (state,action) =>{
            state.popularMovies =  action.payload;
        },
        addTopRatedMovies: (state,action) =>{
            state.topRatedMovies  =  action.payload;
        },
        addUpcomingMovies: (state,action) =>{
            state.upcomingMovies =  action.payload;
        },
        addTrailerVideos: (state,action) =>{
            const { movieId, trailer } = action.payload;
            state.trailerVideos[movieId] = trailer;
        },
        removeMovie: (state,action) =>{
            return null;
        }
    }
});

export const { addNowPlayingMovies,addPopularMovies,addTopRatedMovies,addUpcomingMovies,removeMovie,addTrailerVideos } = moviesSlice.actions;
export default moviesSlice.reducer;