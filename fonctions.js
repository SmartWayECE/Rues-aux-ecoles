/* 
  Fonction pour trouver les coordonnées les plus proches de celles visées 
*/
function getNearestCoordinates(coordinates, targetLat, targetLon) 
{
    let nearestCoordinates;
    let nearestDistance = Number.MAX_SAFE_INTEGER;

    coordinates.forEach(coordinate => { 
      const distance = haversineDistance(targetLat, targetLon, coordinate.lat, coordinate.lon);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestCoordinates = coordinate;
      }
    });

    return nearestCoordinates;
}

/* 
  Fonction pour calculer la distance entre deux jeux de coordonnées
*/
function haversineDistance(lat1, lon1, lat2, lon2) 
{
  const toRadians = (degree) => degree * (Math.PI / 180);
  const R = 6371; // rayon de la terre
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/*
  Fonction pour trouver le nom d'une rue avec des coordonnées
*/
function getStreetName(latitude, longitude) 
{
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    //xhr.open('GET', `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
    xhr.open('GET', `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`);
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        var streetName = "";

        if(response.features[0].properties.street==null) {
          streetName = "La route n'a pas été trouvé.";
        }
        else {
          streetName = response.features[0].properties.street;
        }
        resolve(streetName);
      } 
      else {
        reject(Error(xhr.statusText));
      }
    };
    xhr.onerror = () => {
      reject(Error('An error occured while trying to reach OpenStreetMap API'));
    };
    xhr.send();
  });
}