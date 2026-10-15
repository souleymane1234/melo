import './PageLoader.css'

type PageLoaderProps = {
  label?: string
  /** Hauteur minimale de la zone de chargement */
  fullPage?: boolean
}

export function PageLoader({
  label = 'Chargement…',
  fullPage = false,
}: PageLoaderProps) {
  return (
    <div
      className={`page-loader${fullPage ? ' page-loader--full' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="page-loader__orb" aria-hidden="true">
        <span className="page-loader__ring page-loader__ring--outer" />
        <span className="page-loader__ring page-loader__ring--inner" />
        <span className="page-loader__core" />
      </div>
      <p className="page-loader__label">{label}</p>
    </div>
  )
}
