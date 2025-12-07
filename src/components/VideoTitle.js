
const VideoTitle = ({title,overview}) => {
    console.log("VideoTitle props: ", title, overview);
        return (
        <div className=' w-screen aspect-video pt-[8%] px-6 md:px-20 absolute text-white bg-gradient-to-r from-black/70'>
            <h1 className='text-6xl font-bold '>{title}</h1>
            <p className='hidden md:inline-block py-6 text-lg w-1/4'>{overview}</p>
             <div className="flex gap-3 my-4 md:my-0">
                {/* Play Button */}
                <button className="bg-white text-black font-medium py-1 md:py-4 px-2 md:px-10 text-xl rounded-lg flex items-center hover:bg-gray-300 transition">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="currentColor" 
                        viewBox="0 0 24 24" 
                        className="w-5 h-5 mr-1"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    Play
                    </button>

                    {/* More Info Button */}
                    <button className=" hidden md:flex bg-gray-500/70 text-white font-medium p-4 px-12 text-xl rounded-lg flex flex-row items-center gap-2 hover:bg-gray-500 transition">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="currentColor" 
                        viewBox="0 0 24 24" 
                        className="w-5 h-5 mr-1"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                                10-4.48 10-10S17.52 2 12 2zm0 17a1.25 1.25 0 110-2.5
                                1.25 1.25 0 010 2.5zm1-4h-2V7h2v8z" />
                    </svg>
                    More Info
                    </button>
            </div>
        </div>
    );
};

export default VideoTitle;