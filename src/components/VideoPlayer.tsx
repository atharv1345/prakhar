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
  const fileRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  const [src, setSrc] = useState(BIRTHDAY_VIDEO_SRC)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const loadFile = (file: File) => {
    if (!file.type.startsWith('video/')) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setFailed(false)
    setReady(false)
    setEnded(false)
    setProgress(0)
    setPlaying(false)
    setSrc(url)
  }

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
            key={src}
            ref={videoRef}
            className="video-el"
            src={src}
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
              // Notify parent to pause background audio
              try {
                props.onPlayStart?.()
              } catch {}
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false)
              setEnded(true)
              setProgress(100)
              // Notify parent to resume background audio
              try {
                props.onPlayEnd?.()
              } catch {}
            }}
            onError={() => {
              if (src.startsWith('blob:')) {
                setFailed(true)
                setReady(false)
                return
              }
              setFailed(true)
              setReady(false)
            }}
            onClick={() => void togglePlay()}
          />
        ) : (
          <div className="video-empty">
            <p className="video-empty-title">Apni video yahan add karo</p>
            <p className="video-empty-copy">
              File ko <code>public/videos/surprise.mp4</code> naam se rakho, ya neeche se choose karo.
            </p>
            <button type="button" className="primary-btn" onClick={() => fileRef.current?.click()}>
              Choose video
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
                    } catch {}
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
        <button type="button" className="ghost-btn" onClick={() => fileRef.current?.click()}>
          Change video
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) loadFile(file)
          event.target.value = ''
        }}
      />

      <div className="video-actions">
        <button type="button" className="primary-btn" onClick={onContinue}>
          {ended ? 'Open the gift' : 'Skip to gift'}
        </button>
      </div>
    </div>
  )
}
