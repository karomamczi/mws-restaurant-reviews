import idb from 'idb';

export class RestaurantsDB {

  constructor(version) {
    this.version = version;
    this.dbName = 'restaurant-reviews';
    this.restaurantsTable = 'restaurants';
    this.reviewsTable = 'reviews';
    this.pendingReviewsTable = 'pending-reviews';
    this.readWriteMode = 'readwrite';
    this.dbPromise = idb.open(this.dbName, this.version, upgradeDb => {
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore(this.restaurantsTable, { keyPath: 'id' });
        case 1:
          upgradeDb.createObjectStore(this.reviewsTable, {keyPath: 'id'}).createIndex('restaurant_id', 'restaurant_id');
          upgradeDb.createObjectStore(this.pendingReviewsTable, {autoIncrement: true, keyPath: 'id'}).createIndex('restaurant_id', 'restaurant_id');
      }
    });
  }

  selectObjects(table) {
    return this.dbPromise.then(db => {
      if (!db) return;
      return db
        .transaction(table)
        .objectStore(table)
        .getAll();
    }).catch(error => {
      console.error('Could not select data from database with: ', error);
    });
  }

  insertObjects(table, objects) {
    return this.dbPromise.then(db => {
      objects.forEach(object => {
        return db
          .transaction(table, this.readWriteMode)
          .objectStore(table)
          .put(object)
      });
    }).catch(error => {
      console.error('Could not insert data into database with: ', error);
    });
  }

  selectRestaurantById(id) {
    return this.dbPromise.then(db => {
      if (!db) return;
      return db
        .transaction(this.restaurantsTable)
        .objectStore(this.restaurantsTable)
        .get(id);
    }).catch(error => {
      console.error('Could not select data by id from database with: ', error);
    });
  }

  selectReviewsByRestaurantId(table, id) {
    return this.dbPromise.then(db => {
      if (!db) return;
      return db
        .transaction(table)
        .objectStore(table)
        .index('restaurant_id')
        .getAll(id)
    }).catch(error => {
      console.error('Could not select data from database with: ', error);
    });
  }

  updateIsFavoriteProperty(id, isFavorite) {
    return this.dbPromise.then(db => {
      if (!db) return;
      const restaurantsStore = db
        .transaction(this.restaurantsTable, this.readWriteMode)
        .objectStore(this.restaurantsTable);
      restaurantsStore.get(id)
        .then(restaurant => {
          restaurant.is_favorite = isFavorite;
          restaurantsStore.put(restaurant);
        });
    });
  }

  clearTable(table) {
    this.dbPromise.then(db => {
      if (!db) return;
      return db
        .transaction(table, this.readWriteMode)
        .objectStore(table)
        .clear();
    }).catch(error => {
      console.error(`Could not clear elements from ${table} table with: `, error)
    });
  }

}


