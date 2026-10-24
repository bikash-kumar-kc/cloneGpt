import { useState, useCallback } from "react";
import { useAudio } from "./useAudio";

export const useAudioManager = () => {
  const audioRef = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = useCallback(
    async (audioSrc: string) => {
      if (!audioSrc || !audioRef.current) return;

      try {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.src = audioSrc;
        await audioRef.current.play();
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    [audioRef],
  );

  return {
    audioRef,
    isPlaying,
    setIsPlaying,
    playAudio,
  };
};
