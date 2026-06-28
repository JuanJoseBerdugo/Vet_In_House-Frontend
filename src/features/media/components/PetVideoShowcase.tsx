import { useEffect, useState } from "react";
import { getPetVideos, type PetVideo } from "../api/pixabayApi";

export function PetVideoShowcase() {
  const [videos, setVideos] = useState<PetVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "missing-key" | "error">("loading");

  useEffect(() => {
    let isMounted = true;

    getPetVideos()
      .then((items) => {
        if (!isMounted) return;

        if (items.length === 0) {
          setStatus("missing-key");
          return;
        }

        setVideos(items);
        setStatus("ready");
      })
      .catch(() => {
        if (isMounted) setStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentVideo = videos[currentIndex];

  function playNext() {
    if (videos.length <= 1) return;

    setIsFading(true);
    window.setTimeout(() => {
      setCurrentIndex((index) => (index + 1) % videos.length);
      setIsFading(false);
    }, 420);
  }

  return (
    <section className="video-showcase" aria-label="Videos de mascotas">
      {status === "ready" && currentVideo ? (
        <>
          <video
            key={currentVideo.id}
            className={`showcase-video ${isFading ? "is-fading" : ""}`}
            src={currentVideo.videoUrl}
            autoPlay
            muted
            playsInline
            onEnded={playNext}
            onError={playNext}
          />
          <div className="video-scrim" />
        </>
      ) : (
        <div className={`video-fallback video-fallback-${status}`} aria-hidden="true" />
      )}
    </section>
  );
}
