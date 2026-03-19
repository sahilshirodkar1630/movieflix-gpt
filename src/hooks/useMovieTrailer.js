import { useDispatch, useSelector } from "react-redux";
import { API_OPTIONS } from "../utils/constants";
import { useEffect } from "react";
import { addTrailerVideos } from "../utils/moviesSlice";

  const useMovieTrailer = (movieId) => {

    const dispatch = useDispatch();
    const trailerVideos = useSelector(store => store.movies.trailerVideos);
    useEffect(()=>{
       if(!movieId) return
       if (trailerVideos[movieId]) return;

      const fetchTrailer = async () => {
      const data = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos`,
        API_OPTIONS
      );
      const json = await data.json();

      console.log("Videos: ", data);
      if(!json.results){
         return;
      }
     
      const filteredData = json.results?.filter(
         (video) => video.type === "Trailer" && video.name === "Official Trailer"
      );
         
      const trailer = filteredData?.length>0 ? filteredData[0] : json?.results[0];
      console.log("Trailer: ", trailer);
      dispatch(addTrailerVideos({ movieId, trailer }));
    };

    fetchTrailer();
      
    },[movieId])

  }
  
  export default useMovieTrailer;

