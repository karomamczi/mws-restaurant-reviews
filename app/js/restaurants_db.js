import idb from 'idb';

export class RestaurantsDB {

  constructor(version) {
    this.version = version;
    this.dbName = 'restaurant-reviews';
    this.restaurantsTable = 'restaurants';
    this.reviewsTable = 'reviews';
    this.readWriteMode = 'readwrite';
    this.dbPromise = idb.open(this.dbName, this.version, upgradeDb => {
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore(this.restaurantsTable, { keyPath: 'id' }).createIndex('is_favorite', 'is_favorite');
        case 1:
          upgradeDb.createObjectStore(this.reviewsTable, {keyPath: 'id'}).createIndex('restaurant_id', 'restaurant_id');
          upgradeDb.createObjectStore('pending-reviews', {autoIncrement: true, keyPath: 'id'}).createIndex('restaurant_id', 'restaurant_id');
      }
    });
  }

  selectRestaurants() {
    return this.dbPromise.then((db) => {
      if (!db) return;
      return db
        .transaction(this.restaurantsTable)
        .objectStore(this.restaurantsTable)
        .getAll();
    }).catch((error) => {
      console.log('Could not select data from database with: ', error);
    });
  }

  insertRestaurants(restaurants) {
    return this.dbPromise.then((db) => {
      restaurants.forEach((restaurant) => {
        return db
          .transaction(this.restaurantsTable, this.readWriteMode)
          .objectStore(this.restaurantsTable)
          .put(restaurant)
      });
    }).catch((error) => {
      console.log('Could not insert data into database with: ', error);
    });
  }

  selectRestaurantById(id) {
    return this.dbPromise.then((db) => {
      if (!db) return;
      return db
        .transaction(this.restaurantsTable)
        .objectStore(this.restaurantsTable)
        .get(id);
    }).catch((error) => {
      console.log('Could not select data by id from database with: ', error);
    });
  }

  selectReviews() {
    return this.dbPromise.then((db) => {
      if (!db) return;
      return db
        .transaction(this.reviewsTable)
        .objectStore(this.reviewsTable)
        .getAll();
    }).catch((error) => {
      console.log('Could not select data from database with: ', error);
    });
  }

  insertReviews(reviews) {
    return this.dbPromise.then((db) => {
      reviews.forEach((review) => {
        return db
          .transaction(this.reviewsTable, this.readWriteMode)
          .objectStore(this.reviewsTable)
          .put(review)
      });
    }).catch((error) => {
      console.log('Could not insert data into database with: ', error);
    });
  }

  selectReviewsByRestaurantId(id) {
    return this.dbPromise.then((db) => {
      if (!db) return;
      return db
        .transaction(this.reviewsTable)
        .objectStore(this.reviewsTable)
        .index('restaurant_id')
        .getAll(id)
    }).catch((error) => {
      console.log('Could not select data from database with: ', error);
    });
  }

}


