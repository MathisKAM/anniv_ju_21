export type TrophyId = 'memoire' | 'science' | 'beaute' | 'humour' | 'archi' | 'copine'

export interface Trophy {
  id: TrophyId
  title: string
  compliment: string
  /** Optional tender line under the headline (ultimate trophy). */
  tender?: string
}

export const trophyText = {
  eyebrow: 'Galerie des trophées',
  title: 'Ta salle des trophées',
  lead: 'Quelques récompenses, rien que pour toi.',
  hint: 'Touche un trophée pour découvrir ce que le jury en pense.',
  mainPrize: 'Le grand prix',
  cta: 'Découvrir mon résultat',
  close: 'Fermer',
  back: 'Revenir à la question',
}

export const trophies: Trophy[] = [
  {
    id: 'memoire',
    title: 'Trophée de la meilleure mémoire',
    compliment: 'Rien ne t’échappe… sauf quand je cache ton cadeau.',
  },
  {
    id: 'science',
    title: 'Trophée de la meilleure scientifique',
    compliment: 'Curieuse, brillante, toujours à vouloir comprendre : je pourrais t’écouter expliquer pendant des heures.',
  },
  {
    id: 'beaute',
    title: 'Trophée de la plus belle fille au monde',
    compliment: 'Pas besoin de jury : l’unanimité était acquise dès le premier regard.',
  },
  {
    id: 'humour',
    title: 'Trophée de la fille la plus drôle',
    compliment: 'Avec toi, impossible de rester sérieux plus de trois secondes. Et je ne voudrais pas que ça change.',
  },
  {
    id: 'archi',
    title: 'Trophée de la meilleure future ingénieure architecte',
    compliment: 'Tu construis ton avenir avec soin, et je suis fier de te voir faire.',
  },
  {
    id: 'copine',
    title: 'Trophée de la meilleure copine',
    compliment: 'Le trophée de la meilleure copine',
    tender: 'Le plus précieux de la galerie, décerné avec tout mon cœur.',
  },
]
