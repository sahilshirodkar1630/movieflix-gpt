import { useDispatch, useSelector } from "react-redux";
import { API_OPTIONS } from "../utils/constants";
import { addPopularMovies } from "../utils/moviesSlice";
import { useEffect } from "react";

  const usePopularMovies = () => {

    const dispatch = useDispatch();
    const popularMovies = useSelector(store => store.movies.popularMovies);

    const url = 'https://api.themoviedb.org/3/movie/popular?page=1';
    const getPopularMovies = async () =>{
        const data = await fetch(url,API_OPTIONS);
        const json = await data.json();
        console.log(json);
        dispatch(addPopularMovies(json));
    };

    useEffect(()=>{
       !popularMovies && getPopularMovies();
    },[])


  }
  
  export default usePopularMovies;

