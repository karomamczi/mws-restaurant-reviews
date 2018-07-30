import L from 'leaflet';

export class RestaurantMap {

  /**
   * Initialize a Leaflet map instance.
   */
  static initMap(loc, zoom) {
    let map = L.map('map', {
      scrollWheelZoom: false
    }).setView([loc.lat, loc.lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    return map;
  }

  /**
   * Map marker for a restaurant.
   */
  static createMapMarkerForRestaurant(restaurant, map) {
    const marker = L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        riseOnHover: true
      }
    );
    marker.addTo(map);
    return marker
  }

}