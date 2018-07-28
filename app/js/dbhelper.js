import { RestaurantsDB } from './restaurants_db.js';
/**
 * Common database helper functions.
 */
export class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/`;
  }

  /**
   * Reference to RestaurantsDB.
   */
  static get restaurantsDb() {
    return new RestaurantsDB(2);
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let cached = false;

    this.restaurantsDb.selectObjects(this.restaurantsDb.restaurantsTable)
      .then(restaurants => {
        if (restaurants.length && !cached) {
          cached = true
          return callback(null, restaurants)
        } else {
          fetch(`${this.DATABASE_URL}restaurants`)
          .then(response => {
            if (response.status === 200) {
              return response.json();
            } else { // Oops!. Got an error from server.
              const error = (`Request failed. Returned status of ${response.status}`);
              callback(error, null);
            }
          })
          .then(response => {
            const restaurants = response;
            this.restaurantsDb.insertObjects(this.restaurantsDb.restaurantsTable, restaurants);
            callback(null, restaurants);
          });
        }
      });

    this.fetchReviews();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    let cached = false;

    this.restaurantsDb.selectRestaurantById(id)
      .then(restaurant => {
        if (restaurant && !cached) {
          cached = true
          return callback(null, restaurant)
        } else {
          fetch(`${this.DATABASE_URL}restaurants/${id}`)
          .then(response => {
            if (response.status === 200) {
              return response.json();
            } else { // Oops!. Got an error from server.
              const error = 'Restaurant does not exist';
              callback(error, null);
            }
          })
          .then(response => {
            const restaurant = response;
            callback(null, restaurant);
          });
        }
      });
  }

  /**
   * Fetch reviews.
   */
  static fetchReviews() {
    let cached = false;

    this.restaurantsDb.selectObjects(this.restaurantsDb.reviewsTable)
      .then(reviews => {
        if (reviews.length && !cached) {
          cached = true
          return;
        } else {
          fetch(`${this.DATABASE_URL}reviews`)
          .then(response => {
            if (response.status === 200) {
              return response.json();
            } else { // Oops!. Got an error from server.
              console.error = (`Request failed. Returned status of ${response.status}`);
            }
          })
          .then(response => {
            const reviews = response;
            this.restaurantsDb.insertObjects(this.restaurantsDb.reviewsTable, reviews);
          });
        }
      });
  }

  /**
   * Fetch reviews based on restaurant's ID.
   */
  static fetchReviewsByRestaurantId(id, callback) {
    let cached = false;

    this.restaurantsDb.selectReviewsByRestaurantId(id)
      .then(reviews => {
        if (reviews.length && !cached) {
          cached = true
          return callback(null, reviews)
        } else {
          fetch(`${this.DATABASE_URL}reviews/?restaurant_id=${id}`)
          .then(response => {
            if (response.status === 200) {
              return response.json();
            } else { // Oops!. Got an error from server.
              const error = (`Request failed. Returned status of ${response.status}`);
              callback(error, null);
            }
          })
          .then(response => {
            const reviews = response;
            callback(null, reviews);
          });
        }
      });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    this.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, attribute) {
    return restaurant.photograph ? this.getResponsiveImageUrl(restaurant.photograph, attribute) : this.getResponsiveImageUrl(restaurant.id, attribute);
  }

  static getResponsiveImageUrl(id, attribute) {
    switch (attribute) {
      case 'src':
        return `/img/${id}_400.jpg`;
      case 'srcset':
        return `/img/${id}_400.jpg 400w, /img/${id}_600.jpg 600w`;
      default:
        return `/img/${id}_400.jpg`;
    }
  }

  /**
   * Update favorite restaurants on the server side and in IndexedDB.
   */
  static updateFavoriteStatus(id, isFavorite) {
    fetch(`${this.DATABASE_URL}restaurants/${id}/?is_favorite=${isFavorite}`, {
      method: 'PUT'
    }).then(() => {
      this.restaurantsDb.updateIsFavoriteProperty(id, isFavorite)
    });
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: this.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /**
   * Add new review to database
   */
  static addNewReview(reviewObject, callback) {
    if ('onLine' in navigator && !navigator.onLine) {
      reviewObject.createdAt = new Date().getTime();
      this.restaurantsDb.insertObjects(this.restaurantsDb.pendingReviews, [reviewObject]);
      callback(null, reviewObject);
      return;
    }
    this.fetchAddNewReview(reviewObject)
      .then(response => {
        this.restaurantsDb.insertObjects(this.restaurantsDb.reviewsTable, [response]);
        callback(null, response);
      })
      .catch(error => {
        console.error(error);
        callback(error, null);
      });
  }

  /**
   * Fetch POST request to add new review to backend
   */
  static fetchAddNewReview(reviewObject) {
    const requestParams = {
      method: 'POST',
      body: JSON.stringify(reviewObject),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    };
    return fetch(`${DBHelper.DATABASE_URL}reviews`, requestParams)
      .then(response => {
        if (response.status === 201) {
          return response.json();
        } else { // Oops!. Got an error from server.
          console.error(`Request failed. Review was not created.`);
        }
      })
  }

  /**
   * Add new review to IndexedDB pending-reviews table
   */
  static addNewReviewsWhenOnline() {
    this.restaurantsDb.selectObjects(this.restaurantsDb.pendingReviews)
      .then(pendingReviews => {
        if (pendingReviews.length) {
          const cleanPendingReviews = this.deleteTempProperties(pendingReviews)
          cleanPendingReviews.forEach(pendingReview => {
            this.fetchAddNewReview(pendingReview).then(response => {
              this.restaurantsDb.insertObjects(this.restaurantsDb.reviewsTable, [response]);
            })
          });
        }
      }).then(() => {
        this.restaurantsDb.clearTable(this.restaurantsDb.pendingReviews);
      });
  }

  /**
   * Delete temporary peroperties created for data management.
   */
  static deleteTempProperties(reviews) {
    return reviews.map(review => {
      return {
        restaurant_id: review.restaurant_id,
        name: review.name,
        rating: review.rating,
        comments: review.comments
      };
    })
  }

}
