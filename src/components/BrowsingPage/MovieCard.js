import { IMG_CDN_URL } from "../../utils/constants";
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import useMovieTrailer from "../../hooks/useMovieTrailer";

const MovieCard = ({ movieData,onHover }) => {
  const cardRef = useRef(null);
  const handleMouseEnter = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    onHover({movie: movieData,position: rect,});
  };
  return (
    <div 
    ref={cardRef}
      className={"w-36 md:w-44 px-4 hover:scale-125"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => onHover(null)}>
      <img alt="" src={IMG_CDN_URL + movieData.poster_path} />
    </div>
  );
};

export default MovieCard;
