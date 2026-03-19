import useMovieTrailer from "../../hooks/useMovieTrailer";
import { useSelector } from "react-redux";


const TrailerPreview = ({ hoverData }) => {
  const { movie, position } = hoverData;
  useMovieTrailer(movie.id);

  const trailer = useSelector(
    store => store.movies.trailerVideos?.[movie.id]
  );

  if (!trailer) return null;

  return (
     <div
      className="fixed z-50 bg-black text-white rounded-lg shadow-lg overflow-hidden"
      style={{
        top: position.top - 220, // 👈 ABOVE the card
        left: position.left,
        width: position.width * 2 // 👈 2x card width
      }}
    >
      <iframe
        className="w-full h-48"
        src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1`}
      />

      <div className="p-2">
        <h2 className="text-sm font-bold">
          {movie.title || movie.original_title}
        </h2>
      </div>
    </div>
  );
};

export default TrailerPreview;