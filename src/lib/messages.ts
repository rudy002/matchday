export const messages = {
  app: {
    name: "Matchday",
    description: "Trouvez un créneau commun entre amis, sans compte.",
  },
  theme: {
    toggle: "Changer de thème",
  },
  validation: {
    titleRequired: "Donnez un titre à l'événement.",
    titleTooLong: "Le titre ne peut pas dépasser 80 caractères.",
    locationTooLong: "Le lieu ne peut pas dépasser 120 caractères.",
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
