export const messages = {
  app: {
    name: "Matchday",
    description: "Trouvez un créneau commun entre amis, sans compte.",
  },
  theme: {
    toggle: "Changer de thème",
  },
  home: {
    title: "Quand êtes-vous tous libres ?",
    intro:
      "Créez un événement et partagez le lien dans votre groupe. Chacun coche ses créneaux libres, le meilleur horaire apparaît tout seul.",
  },
  form: {
    title: "Titre",
    titlePlaceholder: "Padel jeudi soir",
    location: "Lieu (facultatif)",
    locationPlaceholder: "Club de Ramat Gan",
    startDate: "Du",
    endDate: "Au",
    startTime: "De",
    endTime: "À",
    dates: "Période possible",
    hours: "Plage horaire",
    duration: "Durée de l'activité",
    submit: "Créer l'événement",
    submitting: "Création en cours…",
    genericError:
      "L'événement n'a pas pu être créé. Vérifiez votre connexion et réessayez.",
  },
  created: {
    loading: "Chargement de l'événement…",
    heading: "Votre événement est prêt",
    shareLabel: "Lien à envoyer à vos amis",
    adminLabel: "Votre lien d'organisateur",
    adminHint:
      "Gardez-le pour vous, il sert à valider le créneau. Il ne sera pas affiché ailleurs : enregistrez-le maintenant.",
    copy: "Copier",
    copied: "Copié",
    copyFailed: "Copie impossible, sélectionnez le lien à la main.",
    whatsapp: "Envoyer sur WhatsApp",
    whatsappIntro: "Quand êtes-vous libres pour",
  },
  errors: {
    notFoundTitle: "Page introuvable",
    notFoundText: "Ce lien est incorrect ou l'événement n'existe plus.",
    backHome: "Créer un événement",
    genericTitle: "Quelque chose s'est mal passé",
    genericText: "La page n'a pas pu s'afficher. Réessayez dans un instant.",
    retry: "Réessayer",
  },
  validation: {
    titleRequired: "Donnez un titre à l'événement.",
    titleTooLong: "Le titre ne peut pas dépasser 80 caractères.",
    locationTooLong: "Le lieu ne peut pas dépasser 120 caractères.",
    dateRequired: "Choisissez une date.",
    dateInvalid: "Cette date n'est pas valide.",
    dateRangeOrder: "La date de fin doit être le même jour ou après le début.",
    dateRangeTooLong: "La période ne peut pas dépasser 31 jours.",
    timeInvalid: "Choisissez une heure pile ou et demie.",
    timeRangeOrder: "L'heure de fin doit être après l'heure de début.",
    durationInvalid:
      "La durée doit être de 30 minutes à 8 heures, par pas de 30 minutes.",
    durationTooLong: "La durée ne tient pas dans la plage horaire choisie.",
    timezoneInvalid: "Ce fuseau horaire n'existe pas.",
    nameRequired: "Entrez votre prénom.",
    nameTooLong: "Le prénom ne peut pas dépasser 40 caractères.",
  },
} as const;
