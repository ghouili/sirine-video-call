import React, { useEffect, useRef } from "react";
const VideoCard = ({ peer, videodata }) => {
  const ref = useRef();
  // console.log(peer);
  useEffect(() => {
    // console.log(peer);
    // ref.current.srcObject = peer.streams[0];
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
      // console.log(stream);
    });
    // peer.on("track", (track, stream) => {});
    // console.log(ref);
  }, [peer]);

  return (
    <>
      <video
        className={`rounded bg-slate-200 m-auto  ${
          videodata && videodata.video ? null : "hidden"
        }`}
        playsInline
        autoPlay
        ref={ref}
      />
      {videodata && videodata.video ? null : (
        <div className="rounded-full w-36 h-36 m-auto flex justify-center items-center border-4 border-gray-50 text-2xl text-white font-mono bg-blue-600 ">
          {peer.userName}
        </div>
      )}
    </>
  );
};

export default VideoCard;
