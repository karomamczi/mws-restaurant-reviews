import idb from 'idb';

class RestaurantDb {

  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.database;
    this.dbPromise = idb.open('restaurant-reviews', 1, upgradeDb => {
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('restaurant-reviews', {keyPath: 'id'});
      }
    });
  }


}


