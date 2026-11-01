/**
 * ÉDITE CE FICHIER pour personnaliser l'accueil, les surprises et l'écran final.
 * Aucun nom, souvenir ou réservation n'est inventé : tout est à remplir.
 */

import { nousPhoto } from './photos'

export const names = {
  her: 'Juliette',
  him: 'Mathis',
}

export const welcome = {
  label: 'Une petite surprise pour toi',
  title: "J'ai quelque chose pour toi.",
  text: 'Une petite mission t’attend avant de découvrir tes surprises.',
  button: 'Découvrir ma surprise',
  duration: 'Environ cinq minutes',
}

/** Chaque entrée = un paragraphe de la lettre. */
export const letter = {
  intro: 'Prends ton temps. Ces mots sont pour toi.',
  greeting: 'Mon amour,',
  paragraphs: [
    'Je pense fort à toi pour ton anniversaire (et je pense à toi tout le temps en réalité, dans n’importe quelle activité, à n’importe quel moment).',
    'Je t’écris ce message pour te donner tout mon amour, parce que c’est TA journée.',
    'Je t’aime.',
  ],
  closing: 'Joyeux anniversaire,',
  signature: `${names.him}, ton futur mari.`,
}

export const restaurant = {
  message:
    'Je t’invite au restaurant, pour notre prochaine fois ensemble. Tu choisis ce qui te ferait plaisir, et je m’occupe du reste.',
  /** Petit titre en capitales espacées, en haut du recto. */
  cardLabel: 'Invitation',
  cardTitle: 'Une soirée rien qu’à nous',
  note: 'Cette fois, c’est moi qui régale',
  flipHint: 'Touche la carte pour la retourner',
  /** Texte du cachet imprimé au verso (court, en majuscules à l'écran). */
  stamp: 'Une soirée à deux',
  /** Première page du menu (verso de la carte). */
  whenLabel: 'Quand ?',
  whenText: 'La date, on la choisira ensemble.',
  /** Laisse `null` tant que rien n'est décidé. Sert uniquement au fichier du calendrier. */
  restaurantName: null as string | null,
  /**
   * Date et heure locales, ex. '2026-12-05T20:00'. Laisse `null` tant que rien n'est décidé.
   * Une fois renseignée, elle remplace la phrase de la première page et un bouton « Ajouter au calendrier » apparaît.
   */
  dateISO: null as string | null,
}

/** Une idée de restaurant. Seul `name` est obligatoire ; le reste ne s'affiche que s'il est renseigné. */
export type RestaurantIdea = {
  id: string
  name: string
  /** Courte description libre (ex. une phrase sur l'ambiance). Rien n'est inventé ici. */
  description?: string
  /** Indication de budget libre (ex. '€€'). */
  budget?: string
  /** Information complémentaire libre, affichée sous la description (ex. un quartier, un type de cuisine). */
  info?: string
  /** Chemin d'une image dans /public (ex. '/restos/labrigade.jpg'). Sans image, une illustration est affichée. */
  image?: string
  /** Lettre de l'illustration si l'image est absente (par défaut : première lettre du nom). */
  monogram?: string
}

/**
 * Idées proposées, affichées dans cet ordre.
 * Pour ajouter ou retirer un restaurant, ajoute ou supprime simplement une ligne.
 */
export const restaurantIdeas: RestaurantIdea[] = [
  { id: 'osteria', name: 'L’Osteria', info: 'Lyon', description: 'Une idée pour notre prochain rendez-vous.', monogram: 'O' },
  { id: 'angeluzzo', name: 'Angelùzzo', info: 'Nancy', description: 'Une idée pour notre prochain rendez-vous.', monogram: 'A' },
  { id: 'la-brigade', name: 'La Brigade', info: 'Lyon / Toulouse', description: 'Une idée pour notre prochain rendez-vous.', monogram: 'B' },
  { id: 'l-alpa', name: 'L’Alpa', info: 'Nancy', description: 'Une idée pour notre prochain rendez-vous.', monogram: 'A' },
]

/** Textes du petit menu à feuilleter (verso de la carte). `{n}`, `{i}` : nombre d'idées, rang de l'idée. */
export const restaurantMenu = {
  ariaLabel: 'Menu des idées de restaurants, à feuilleter',
  prev: 'Page précédente',
  next: 'Page suivante',
  turnBack: 'Retourner la carte',
  hint: 'Feuillette pour découvrir mes idées',
  countFirst: '{n} idées à découvrir',
  count: 'Idée {i} sur {n}',
  countLeft: 'encore {r}',
  closingTitle: 'Alors, lequel te ferait plaisir ?',
  closingNote: 'On choisira ensemble.',
  /** Libellé de l'image quand aucune photo n'est renseignée (vide : rien n'est affiché). */
  mediaSlot: '',
}

export const gift = {
  title: 'Un petit mot de ma part',
  /** Première partie : le message, un paragraphe à la fois. */
  paragraphs: [
    'J’ai pris le temps de construire ce petit site pour toi, d’une façon un peu différente de fêter ton anniversaire, puisqu’on ne peut pas le célébrer ensemble le jour même.',
    'Je voulais te préparer quelque chose d’un peu personnel, qui ne ressemble pas simplement à un message d’anniversaire classique.',
    'Alors j’espère que ça t’aura fait sourire.',
  ],
  /** Mots légèrement mis en valeur par une animation discrète (sans accent de casse ni ponctuation). */
  emphasis: ['différente', 'personnel', 'sourire'],
  /** Seconde partie : une seule phrase, sans aucune illustration de cadeau. */
  extra:
    'Et bien sûr, ce petit site ne sera pas ton seul cadeau : un petit quelque chose t’attendra aussi lors de nos prochaines retrouvailles, parmi les idées que tu m’avais données.',
  button: 'Terminer',
}

export const finale = {
  thanks: 'Merci d’avoir joué jusqu’au bout.',
  title: 'Joyeux anniversaire.',
  love: 'Je t’aime ma Juliette.',
  /** Chemin d'une photo placée dans /public (ex. '/photo.jpg'). `null` : un cadre vide est affiché. */
  photo: nousPhoto(1) ?? null,
  photoAlt: 'Une photo de nous',
  /** Légende facultative sous la photo (`null` : aucune). */
  photoCaption: null as string | null,
}
