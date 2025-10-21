import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface CustomAudioPlayerProps {
  src: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export function CustomAudioPlayer({ src }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateTime);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={togglePlay}
        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <span className="text-sm font-mono text-gray-700">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      <audio ref={audioRef} src={src} hidden />
    </div>
  );
}

export default CustomAudioPlayer;
