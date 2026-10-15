import { APP_NAME } from '../config/app-config'
import './LegalPage.css'

type LegalPageProps = {
  variant: 'mentions' | 'confidentialite'
}

export function LegalPage({ variant }: LegalPageProps) {
  const isMentions = variant === 'mentions'

  return (
    <main className="page-main">
      <article className="ui-container legal-page">
        <p className="ui-eyebrow">Informations</p>
        <h1>{isMentions ? 'Mentions légales' : 'Politique de confidentialité'}</h1>
        {isMentions ? (
          <>
            <p>
              {APP_NAME} est une plateforme frontend de création musicale assistée par intelligence artificielle.
              Ce site ne commercialise aucun abonnement et n’affiche pas d’offre Premium.
            </p>
            <p>
              L’éditeur du site est responsable des contenus d’interface. Les fichiers audio ne sont stockés ou
              diffusés que lorsqu’un moteur de génération réellement connecté les produit.
            </p>
            <p>
              Pour toute question : utilisez Mon espace si un compte est actif, ou l’accueil du site.
            </p>
          </>
        ) : (
          <>
            <p>
              {APP_NAME} conserve localement, dans votre navigateur, les chansons réellement générées afin de
              remplir votre bibliothèque. Aucune clé secrète de moteur musical n’est embarquée dans le frontend.
            </p>
            <p>
              Le prénom, le numéro de téléphone ou l’adresse e-mail du destinataire servent uniquement à lui
              envoyer le lien de la chanson. Toute personne disposant de ce lien peut écouter et télécharger le
              morceau.
            </p>
            <p>
              Si vous créez un compte, l’authentification existante du projet peut transmettre email et profil
              à l’API configurée via les variables d’environnement. Vous pouvez vous déconnecter à tout moment.
            </p>
            <p>
              Aucune donnée de paiement n’est collectée : la plateforme n’inclut pas de tunnel d’abonnement.
            </p>
          </>
        )}
      </article>
    </main>
  )
}
