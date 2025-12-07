import { useDispatch, useSelector } from "react-redux";
import { API_OPTIONS } from "../utils/constants";
import { addNowPlayingMovies } from "../utils/moviesSlice";
import { useEffect } from "react";

  const useNowPlayingMovies = () => {

    const dispatch = useDispatch();
    
    const nowPlayingMovies = useSelector(store => store.movies.nowPlayingMovies);
    
    const url = 'https://api.themoviedb.org/3/movie/now_playing?page=1';
    const getNowPlayingMovies = async () =>{
        const data = await fetch(url,API_OPTIONS);
        const json = await data.json();
        console.log(json);
        dispatch(addNowPlayingMovies(json));
    };

    useEffect(()=>{
       !nowPlayingMovies &&  getNowPlayingMovies();
    },[])


  }
  
  export default useNowPlayingMovies;

