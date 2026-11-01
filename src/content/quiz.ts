import type { Question } from '../types'

/**
 * ÉDITE CE FICHIER pour modifier le quiz.
 *
 * - `kind`          : `'choice'` (par défaut) = choix multiple ; `'football'` et `'planets'` = mini-jeux.
 * - `options`       : exactement 4 réponses (A, B, C, D). Inutilisées pour `'planets'`.
 * - `correctIndex`  : 0 = A, 1 = B, 2 = C, 3 = D.
 * - `correctIndexes`: plusieurs bonnes réponses à trouver (elles doivent toutes être trouvées).
 * - `explanation`, `successMessage`, `retryMessage` sont optionnels.
 * - Garde des `id` uniques et stables (ils servent à la sauvegarde de progression).
 */
export const questions: Question[] = [
  {
    id: 'q1',
    text: 'Depuis quelle date sommes-nous officiellement ensemble ?',
    options: ['14 février 2023', '21 mars 2023', '1er avril 2023', '21 juin 2023'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    text: 'Chez qui nous sommes-nous vus pour la première fois ?',
    options: ['Chez toi', 'Chez moi'],
    correctIndex: 0,
    explanation:
      'D’ailleurs, je me souviens, j’étais très stressé. C’est ma mère qui m’avait emmené et on avait pris un chemin un peu plus long parce qu’on ne connaissait pas forcément le trajet, ce qui me faisait stresser encore plus. Mais au final, dès que je t’ai vue, je me suis senti super bien.',
  },
  {
    id: 'q3',
    text: 'Quelle spécialité est-ce que j’étudie cette année ?',
    // Intitulés provisoires : modifie-les librement (la bonne réponse est D).
    options: ['Architecture des ordinateurs.', 'Réseaux.', 'HPC / Big Data.', 'Télécommunications.'],
    correctIndex: 3,
    // Un motif discret en fond de chaque case, dans le même ordre que les options.
    optionArt: ['computer', 'network', 'servers', 'telecom'],
  },
  {
    id: 'q4',
    kind: 'football',
    text: 'Quels sont les deux rôles que je peux occuper sur un terrain de football ?',
    options: ['Milieu offensif / créateur de jeu.', 'Défenseur central.', 'Milieu défensif.', 'Buteur.'],
    correctIndex: 0,
    correctIndexes: [0, 3],
    successMessage: 'Créateur de jeu et buteur : tu as trouvé les deux. Tu me connais bien.',
    retryMessage: 'Raté pour cette fois… mais il te reste une dernière chance.',
  },
  {
    id: 'q5',
    kind: 'arcade',
    unlimited: true,
    text: 'Quel est mon jeu vidéo préféré de ces dernières années ?',
    options: ['Minecraft.', 'Rocket League.', 'Rainbow Six Siege.', 'FIFA.'],
    correctIndex: 3,
    successMessage: 'Bien joué ! Tu connais décidément mes petites habitudes.',
    retryMessage: 'Ce n’est pas cette borne. Essaie-en une autre !',
  },
  {
    id: 'q6',
    kind: 'planets',
    text: 'Replace les planètes du système solaire dans le bon ordre, en partant du Soleil.',
    options: ['Mercure', 'Vénus', 'Terre', 'Mars'],
    correctIndex: 0,
    successMessage: 'Les huit planètes sont à leur place. Et j’ai une petite astuce pour s’en souvenir.',
  },
  {
    id: 'q7',
    kind: 'lab',
    text: 'Lequel de ces métaux peut fondre dans la paume de ta main ?',
    options: ['Le fer.', 'Le cuivre.', 'Le tungstène.', 'Le gallium.'],
    correctIndex: 3,
    unlimited: true,
    explanation:
      'Le gallium fond à environ 29,8 °C. La chaleur de ta main peut donc suffire à le faire passer à l’état liquide !',
    retryMessage: 'Ce n’est pas la bonne réponse. Cet échantillon reste solide : essaie une autre fiole.',
  },
  {
    id: 'q8',
    kind: 'animals',
    unlimited: true,
    text: 'Quel animal peut somnoler debout ?',
    options: ['Le cheval.', 'Le chien.', 'Le chat.', 'Le lapin.'],
    correctIndex: 0,
    successMessage: 'Eh oui ! Le cheval peut même somnoler debout.',
    retryMessage: 'Ce n’est pas lui. Continue d’essayer !',
    explanation:
      'Grâce à un mécanisme de verrouillage de ses articulations, le cheval peut se reposer sans tomber. Il doit tout de même s’allonger pour certaines phases de sommeil paradoxal.',
  },
  {
    id: 'q9',
    kind: 'venus',
    text: 'Quelle planète possède une journée plus longue que son année ?',
    options: ['Mars.', 'Jupiter.', 'Vénus.', 'Mercure.'],
    correctIndex: 2,
    explanation:
      'Sur Vénus, une rotation complète sur elle-même dure environ 243 jours terrestres, alors que son année dure environ 225 jours terrestres. Sa journée est donc plus longue que son année !',
  },
  {
    id: 'q10',
    kind: 'meal',
    unlimited: true,
    text: 'Si je devais manger un seul type de plat pendant une semaine, lequel choisirais-je ?',
    options: ['Des pâtes au jambon.', 'Des pâtes à la sauce tomate.', 'Un steak haché avec des frites.', 'Des crêpes.'],
    correctIndex: 1,
    successMessage: 'Évidemment, les pâtes à la sauce tomate !',
    retryMessage: 'Ce n’est pas celui-là. Essaie un autre plat !',
  },
]

/** Textes génériques utilisés quand une question n'a pas de message dédié. */
export const defaultFeedback = {
  success: 'Exactement. Tu me connais bien.',
  retry: 'Pas tout à fait… mais tu as une deuxième chance.',
  reveal: 'Pas de panique, voici la bonne réponse.',
}

/** Mini-jeu du terrain de football (question 4). */
export const footballText = {
  hint: 'Touche un joueur du terrain pour choisir son poste.',
  zones: ['Attaquant', 'Milieu', 'Défenseur'],
  keeper: 'Gardien',
  /** Étiquette de chaque joueur sélectionnable, dans l'ordre des options. */
  labels: ['Milieu offensif', 'Défenseur central', 'Milieu défensif', 'Buteur'],
  /** Après une première bonne réponse : « {n} » = 1 ; la seconde reste à trouver. */
  partial: 'Bien joué ! Mais ce n’est pas le seul poste…',
  partialGoal: 'But ! Mais ce n’est pas le seul poste…',
  nudge: 'Il manque encore un poste à trouver.',
  goal: 'BUT !',
  done: 'Les deux postes sont trouvés.',
  wrong: ['Pas son poste !', 'Ce n’est pas lui !', 'Raté, mais on continue !'],
  reveal: 'Voici les deux postes.',
  replay: 'Revoir l’action',
}

/** Mini-jeu du système solaire (question 6). */
export const solarText = {
  hint: 'Glisse chaque planète sur son orbite, en partant du Soleil. Ou touche une planète, puis son orbite.',
  traySelected: 'Choisis maintenant son orbite.',
  nearer: 'Elle est plus proche du Soleil.',
  farther: 'Elle est plus loin du Soleil.',
  help: 'Un petit coup de pouce : regarde la planète qui brille.',
  done: 'Système solaire complet.',
  mnemonicTitle: 'Une petite astuce pour s’en souvenir',
  mnemonicLine: 'Mercredi, Vendredi, Terre, Mardi, Jeudi… puis SUN !',
  aide: {
    title: 'Aide',
    hint1: 'Mercredi, Vendredi, Terre, Mardi, Jeudi et SUN',
    hint2Button: 'Indice n°2',
    hint2Title: 'Indice n°2',
    hint2: 'Chaque mot rappelle une planète, dans l’ordre en partant du Soleil : Mercredi (Mercure), Vendredi (Vénus), Terre, Mardi (Mars), Jeudi (Jupiter), puis SUN : Saturne, Uranus, Neptune.',
    solutionButton: 'Voir la solution',
    solutionTitle: 'Solution',
  },
  /** Chaque ligne : le mot de la méthode, et les planètes correspondantes (indices dans l'ordre du Soleil). */
  mnemonic: [
    { word: 'Mercredi', planet: 'Mercure', index: 0 },
    { word: 'Vendredi', planet: 'Vénus', index: 1 },
    { word: '', planet: 'Terre', index: 2 },
    { word: 'Mardi', planet: 'Mars', index: 3 },
    { word: 'Jeudi', planet: 'Jupiter', index: 4 },
  ],
  sun: { word: 'SUN', planets: ['Saturne', 'Uranus', 'Neptune'], indexes: [5, 6, 7] },
}

/** Mini-jeu du champ (question 8). Les réactions sont indexées comme les options : A, B, C, D. */
export const fieldText = {
  hint: 'Touche l’animal que tu penses être le bon.',
  names: ['Le cheval', 'Le chien', 'Le chat', 'Le lapin'],
  /** Index 0 = cheval ; 1 = chien ; 2 = chat ; 3 = lapin. */
  reaction: ['', 'Le chien file courir ailleurs !', 'Le chat s’éloigne, l’air de rien.', 'Le lapin bondit se cacher derrière le buisson !'],
  settle: 'Chut… il se met au repos, bien debout.',
  lock: 'Ses articulations se verrouillent.',
  reveal: 'Voici l’animal qui dort debout.',
}

/** Mini-jeu de la table (question 10). */
export const tableText = {
  hint: 'Choisis ton assiette sur la table.',
  names: ['Pâtes au jambon', 'Pâtes à la sauce tomate', 'Steak haché et frites', 'Crêpes'],
  /** Index 0 = pâtes au jambon ; 1 = pâtes tomate ; 2 = steak ; 3 = crêpes. */
  reaction: ['Mmh, bon… mais pas celui-là !', '', 'Il est bien juteux… mais ce n’est pas le bon !', 'Délicieuses… mais pas pour toute la semaine !'],
  win: 'Mmh, ça sent bon !',
  reveal: 'Voici l’assiette qui fait la différence.',
}

/** Mini-jeu du laboratoire (question 7). */
export const labText = {
  hint: 'Touche un échantillon pour le tester.',
  names: ['Fer', 'Cuivre', 'Tungstène', 'Gallium'],
  symbols: ['Fe', 'Cu', 'W', 'Ga'],
  /** Phrase affichée sur l'écran de l'instrument pour chaque mauvais échantillon. */
  solid: 'SOLIDE',
  idle: 'PRÊT',
  analyse: 'ANALYSE…',
  melting: 'FUSION',
  liquid: 'LIQUIDE',
  /** Bulle pendant la mise en scène. */
  heat: 'Le gallium chauffe…',
  spread: 'Mise en scène : les autres métaux ne fondent pas.',
  reveal: 'Voici l’échantillon à tester.',
  scene: 'Un laboratoire avec quatre échantillons de métaux sur une paillasse',
  melts: 'Il fond peu à peu…',
  pours: 'Il devient liquide et s’écoule !',
  nope: 'Ce n’est pas la bonne réponse…',
  cardIdle: 'Résultat du test',
  win: 'Bonne réponse !',
}

/** Salle d'arcade (question 5). Index = option : 0 Minecraft, 1 Rocket League, 2 Rainbow Six Siege, 3 FIFA. */
export const arcadeText = {
  scene: 'Une salle d’arcade futuriste avec quatre bornes de jeu',
  hint: 'Touche une borne pour la lancer.',
  names: ['Minecraft', 'Rocket League', 'Rainbow Six Siege', 'FIFA'],
  reaction: [
    'Pas cette borne… tout s’est effondré !',
    'Pas cette borne… il a raté la balle !',
    'Pas cette borne… on n’y voit plus rien !',
    '',
  ],
  win: 'Coup d’envoi !',
  tried: 'déjà essayée',
}
