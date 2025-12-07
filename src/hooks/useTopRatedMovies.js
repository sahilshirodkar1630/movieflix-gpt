import { useDispatch, useSelector } from "react-redux";
import { API_OPTIONS } from "../utils/constants";
import { addTopRatedMovies } from "../utils/moviesSlice";
import { useEffect } from "react";

  const useTopRatedMovies = () => {

    const dispatch = useDispatch();
    const topRatedMovies = useSelector(store => store.movies.topRatedMovies);

    const url = 'https://api.themoviedb.org/3/movie/top_rated?page=1';
    const getTopRatedMovies = async () =>{
        const data = await fetch(url,API_OPTIONS);
        const json = await data.json();
        console.log(json);
        dispatch(addTopRatedMovies(json));
    };

    useEffect(()=>{
        !topRatedMovies && getTopRatedMovies();
    },[])


  }
  
  export default useTopRatedMovies;

