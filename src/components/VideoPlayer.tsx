import { useEffect, useRef, useState } from 'react'
import { BIRTHDAY_VIDEO_SRC } from '../config'

type VideoPlayerProps = {
  onContinue: () => void
  onPlayStart?: () => void
  onPlayEnd?: () => void
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VideoPlayer(props: VideoPlayerProps) {
  const { onContinue } = props
  const videoRef = useRef<HTMLVideoElement>(null)

  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    // Reset when source path changes (e.g. after rebuild)
    setReady(false)
    setFailed(false)
    setProgress(0)
    setEnded(false)
    setPlaying(false)
  }, [])

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video || !ready) return
    if (video.paused) {
      try {
        await video.play()
      } catch {
        /* autoplay policies */
      }
    } else {
      video.pause()
    }
  }

  const onSeek = (value: number) => {
    const video = videoRef.current
    if (!video || !duration) return
    video.currentTime = (value / 100) * duration
    setProgress(value)
  }

  return (
    <div className="video-player">
      <div className="video-stage">
        {!failed ? (
          <video
            ref={videoRef}
            className="video-el"
            src={BIRTHDAY_VIDEO_SRC}
            playsInline
            preload="metadata"
            autoPlay
            muted={muted}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration)
              setReady(true)
              setFailed(false)
            }}
            onTimeUpdate={(event) => {
              const { currentTime, duration: dur } = event.currentTarget
              if (dur > 0) setProgress((currentTime / dur) * 100)
            }}
            onPlay={() => {
              setPlaying(true)
              setEnded(false)
              try {
                props.onPlayStart?.()
              } catch {
                /* ignore */
              }
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false)
              setEnded(true)
              setProgress(100)
              try {
                props.onPlayEnd?.()
              } catch {
                /* ignore */
              }
            }}
            onError={() => {
              setFailed(true)
              setReady(false)
            }}
            onClick={() => void togglePlay()}
          />
        ) : (
          <div className="video-empty">
            <p className="video-empty-title">Video load nahi hui</p>
            <p className="video-empty-copy">
              Hosted video path: <code>{BIRTHDAY_VIDEO_SRC}</code>
            </p>
            <button type="button" className="primary-btn" onClick={onContinue}>
              Continue to gift
            </button>
          </div>
        )}

        {ready && !playing && !ended ? (
          <>
            <button type="button" className="play-burst" onClick={() => void togglePlay()} aria-label="Play video">
              <span />
            </button>

            {muted ? (
              <div className="video-unmute-overlay">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={async () => {
                    const video = videoRef.current
                    if (!video) return
                    try {
                      video.muted = false
                      setMuted(false)
                      await video.play()
                      props.onPlayStart?.()
                    } catch {
                      /* ignore */
                    }
                  }}
                >
                  Play with sound
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="video-controls">
        <button type="button" className="ghost-btn" onClick={() => void togglePlay()} disabled={!ready}>
          {playing ? 'Pause' : ended ? 'Replay' : 'Play'}
        </button>
        <input
          className="seek"
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          disabled={!ready}
          onChange={(event) => onSeek(Number(event.target.value))}
          aria-label="Video progress"
        />
        <span className="time-label">
          {formatTime((progress / 100) * duration)} / {formatTime(duration)}
        </span>
        <button
          type="button"
          className="ghost-btn"
          disabled={!ready}
          onClick={() => {
            const video = videoRef.current
            if (!video) return
            video.muted = !video.muted
            setMuted(video.muted)
          }}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      <div className="video-actions">
        <button type="button" className="primary-btn" onClick={onContinue}>
          {ended ? 'Open the gift' : 'Skip to gift'}
        </button>
      </div>
    </div>
  )
}
