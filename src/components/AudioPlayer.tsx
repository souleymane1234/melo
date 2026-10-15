import { useEffect, useId, useRef, useState } from 'react'
import { FaPause, FaPlay, FaVolumeHigh, FaVolumeXmark } from 'react-icons/fa6'
import { coverGradient } from '../lib/music-cover'
import { genreLabel } from '../lib/music-options'
import type { MusicTrack } from '../lib/music-types'
import './AudioPlayer.css'

type AudioPlayerProps = {
  track: MusicTrack
  compact?: boolean
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer({ track, compact = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(track.durationSeconds ?? 0)
  const [volume, setVolume] = useState(0.85)
  const [muted, setMuted] = useState(false)
  const progressId = useId()
  const volumeId = useId()

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.load()
    setPlaying(false)
    setCurrent(0)
  }, [track.audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = muted ? 0 : volume
  }, [volume, muted])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      return
    }
    try {
      await audio.play()
    } catch {
      setPlaying(false)
    }
  }

  const progressMax = duration > 0 ? duration : 0
  const progressValue = Math.min(current, progressMax || current)

  return (
    <div className={`audio-player${compact ? ' audio-player--compact' : ''}`}>
      <div
        className="audio-player__cover"
        style={{ backgroundImage: track.coverUrl ? `url(${track.coverUrl})` : coverGradient(track.genre + track.id) }}
        aria-hidden="true"
      />
      <div className="audio-player__body">
        <div className="audio-player__meta">
          <p className="audio-player__title">{track.title}</p>
          <p className="audio-player__style">{genreLabel(track.genre)}</p>
        </div>

        <audio
          ref={audioRef}
          src={track.audioUrl}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || track.durationSeconds || 0)}
        />

        <div className="audio-player__controls">
          <button
            type="button"
            className="audio-player__play"
            onClick={() => void togglePlay()}
            aria-label={playing ? 'Mettre en pause' : 'Lire'}
          >
            {playing ? <FaPause aria-hidden="true" /> : <FaPlay aria-hidden="true" />}
          </button>

          <label className="audio-player__progress" htmlFor={progressId}>
            <span className="visually-hidden">Progression</span>
            <input
              id={progressId}
              type="range"
              min={0}
              max={progressMax || 1}
              step={0.1}
              value={progressValue}
              onChange={(event) => {
                const next = Number(event.target.value)
                const audio = audioRef.current
                if (audio) audio.currentTime = next
                setCurrent(next)
              }}
            />
            <span className="audio-player__time">
              {formatTime(current)} / {formatTime(duration)}
            </span>
          </label>

          <div className="audio-player__volume">
            <button
              type="button"
              className="audio-player__mute"
              onClick={() => setMuted((value) => !value)}
              aria-label={muted ? 'Activer le son' : 'Couper le son'}
            >
              {muted || volume === 0 ? <FaVolumeXmark aria-hidden="true" /> : <FaVolumeHigh aria-hidden="true" />}
            </button>
            <label htmlFor={volumeId} className="visually-hidden">
              Volume
            </label>
            <input
              id={volumeId}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(event) => {
                const next = Number(event.target.value)
                setVolume(next)
                if (next > 0) setMuted(false)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
