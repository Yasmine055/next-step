// URLs d'images en ligne pour les équipements
const equipmentIcons = {
  server: 'https://cdn-icons-png.flaticon.com/512/3208/3208726.png',
  switch: 'https://cdn-icons-png.flaticon.com/512/2818/2818197.png',
  firewall: 'https://cdn-icons-png.flaticon.com/512/2910/2910791.png'
};

export const getDefaultIcon = (typeName) => {
  // Convertir le nom en minuscules et supprimer les accents
  const normalizedName = typeName.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Chercher une correspondance basée sur des mots-clés
  if (normalizedName.includes('serveur') || normalizedName.includes('server')) {
    return equipmentIcons.server;
  }
  if (normalizedName.includes('switch') || normalizedName.includes('commutateur')) {
    return equipmentIcons.switch;
  }
  if (normalizedName.includes('firewall') || normalizedName.includes('pare-feu')) {
    return equipmentIcons.firewall;
  }

  // Par défaut, retourner l'icône serveur
  return equipmentIcons.server;
};

export { equipmentIcons }; 