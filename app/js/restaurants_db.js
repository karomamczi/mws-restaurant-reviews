import idb from 'idb';

export class RestaurantsDB {

  constructor(version) {
    this.version = version;
    this.dbName = 'restaurant-reviews';
    this.readWriteMode = 'readwrite';
    this.dbPromise = idb.open(this.dbName, this.version, upgradeDb => {
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore(this.dbName, { keyPath: 'id' });
      }
    });
  }

  selectRestaurants() {
    return this.dbPromise.then((db) => {
      if (!db) return;
      return db
        .transaction(this.dbName)
        .objectStore(this.dbName)
        .getAll();
    }).catch((error) => {
      console.log('Could not select data from database with: ', error);
    });
  }

  insertRestaurants(restaurants) {
    return this.dbPromise.then((db) => {
      restaurants.forEach((restaurant) => {
        return db
          .transaction(this.dbName, this.readWriteMode)
          .objectStore(this.dbName)
          .put(restaurant)
      });
    }).catch((error) => {
      console.log('Could not insert data into database with: ', error);
    });
  }

}


