import { FaPlay } from 'react-icons/fa6'
import { coverGradient } from '../lib/music-cover'
import { genreLabel, moodLabel } from '../lib/music-options'
import type { MusicTrack } from '../lib/music-types'
import { AudioPlayer } from './AudioPlayer'
import './SongCard.css'

type SongCardProps = {
  track: MusicTrack
  href?: string
  showPlayer?: boolean
}

export function SongCard({ track, href, showPlayer = false }: SongCardProps) {
  const cover = (
    <div
      className="song-card__cover"
      style={{ backgroundImage: track.coverUrl ? `url(${track.coverUrl})` : coverGradient(track.genre + track.id) }}
    >
      <span className="song-card__play" aria-hidden="true">
        <FaPlay />
      </span>
    </div>
  )

  return (
    <article className="song-card">
      {href ? (
        <a className="song-card__link" href={href} aria-label={`Ouvrir ${track.title}`}>
          {cover}
        </a>
      ) : (
        cover
      )}
      <div className="song-card__body">
        <h3 className="song-card__title">
          {href ? <a href={href}>{track.title}</a> : track.title}
        </h3>
        <p className="song-card__meta">
          {genreLabel(track.genre)} · {moodLabel(track.mood)}
        </p>
      </div>
      {showPlayer && track.audioUrl ? <AudioPlayer track={track} compact /> : null}
    </article>
  )
}
