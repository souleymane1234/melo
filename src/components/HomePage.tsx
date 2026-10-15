import { MUSIC_ROUTES } from '../lib/music-routes'
import { HeroScene } from './HeroScene'
import { HomeLanding } from './HomeLanding'
import './HomePage.css'

export function HomePage() {
  return (
    <main id="accueil">
      <HeroScene
        subtitle="Une chanson personnalisée pour ceux que vous aimez"
        title="« Ils ont écouté. Ils n’ont plus rien dit. »"
        lead="Créez une chanson unique à partir de votre histoire, puis envoyez-la par SMS ou e-mail : la personne l’écoute et la télécharge en un clic."
        primaryHref={MUSIC_ROUTES.generate}
        primaryLabel="Créer une chanson"
        secondaryHref="#comment-ca-marche"
        secondaryLabel="Comment ça marche"
        trustItems={['Gratuit', 'Envoi par SMS ou e-mail', 'Écoute et téléchargement']}
      />
      <HomeLanding />
    </main>
  )
}
