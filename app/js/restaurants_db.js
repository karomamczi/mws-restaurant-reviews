import idb from 'idb';

export class RestaurantsDB {

  constructor(version) {
    this.version = version;
    this.dbName = 'restaurant-reviews';
    this.restaurantsTable = 'restaurants';
    this.readWriteMode = 'readwrite';
    this.dbPromise = idb.open(this.dbName, this.version, upgradeDb => {
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore(this.restaurantsTable, { keyPath: 'id' }).createIndex('is_favorite', 'is_favorite');
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

}


