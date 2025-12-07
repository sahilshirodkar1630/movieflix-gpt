import { IMG_CDN_URL } from "../utils/constants";

const MovieCard = ({ posterPath }) => {
  if (!posterPath) return null;
    console.log("MovieCard posterPath:", posterPath);
  return (
    <div className="w-36 md:w-48 px-4">
      <img alt="" src={IMG_CDN_URL + posterPath} />
    </div>
  );
};

export default MovieCard;
