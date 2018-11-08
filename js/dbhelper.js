/**
 * Common database helper functions.
 */
 /*
 var dbPromise = idb.open('restdb', 1, function(upgradeDb){
 	var store = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
 });*/

 var dbPromise = idb.open('restdb', 2, function(upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
      // a placeholder case so that the switch block will
      // execute when the database is first created
      // (oldVersion is 0)
    case 1:
      console.log('Creating the restaurants object store');
      upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
    case 2:
      console.log('Creating a name index');
      var store = upgradeDb.transaction.objectStore('restaurants');
      store.createIndex('restaurant', 'restaurant', {unique: true});
    case 3:
    upgradeDb.createObjectStore('reviews', {keyPath: 'id'})
    case 4:
      var store = upgradeDb.transaction.objectStore('reviews');
      store.createIndex('review', 'review', {unique:true});
      //upgradeDb.createObjectStore('reviews', {keyPath: 'id'})

  }
});//end dbPromise

//adding to database
/*
dbPromise.then(db => {
  const tx = db.transaction('reviews', 'readwrite');
  tx.objectStore('reviews').put({
    id: 123456,
    data: {foo: "bar"}
  });
  return tx.complete;
})
*/





class DBHelper {
	/**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
	static get DATABASE_URL() {
		const port = 1337; // Change this to your server port
		return `http://localhost:${port}/restaurants/`;
	}
  static get API_URL() {
		 const port = 1337; // Change this to your server port
		return `http://localhost:${port}/reviews/`;
	}
	/**
   * Fetch all restaurants.
   */
	static fetchRestaurants(callback) {
		fetch(DBHelper.DATABASE_URL)
			.then(function(response){
				return response.json();
			})
			.then(restaurants => {
				dbPromise.then(db => {
					var tx = db.transaction('restaurants', 'readwrite');
					var store = tx.objectStore('restaurants');
					restaurants.forEach(restaurant => {
						store.put(restaurant);
					})
					callback(null, restaurants);
				});
			}).catch(err => {
				dbPromise.then(function(db) {
					var store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
					return store.getAll();
				}).then(function(data) {
					callback(null, data);
				});

			});


	}

	/**
   * Fetch a restaurant by its ID.
   */
	static fetchRestaurantById(id, callback) {
		// fetch all restaurants with proper error handling.
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				const restaurant = restaurants.find(r => r.id == id);
				if (restaurant) { // Got the restaurant
					callback(null, restaurant);
				} else { // Restaurant does not exist in the database
					callback('Restaurant does not exist', null);
				}
			}
		});
	}

	/**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
	static fetchRestaurantByCuisine(cuisine, callback) {
		// Fetch all restaurants  with proper error handling
		DBHelper.fetchRestaurants((error, restaurants) => {
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
		DBHelper.fetchRestaurants((error, restaurants) => {
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
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				let results = restaurants;
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


	// Fetch all neighborhoods with proper error handling.

	static fetchNeighborhoods(callback) {
	  // Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
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
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all cuisines from all restaurants
				const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
				// Remove duplicates from cuisines
				const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
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
	static imageUrlForRestaurant(restaurant) {
		return (`/img/${restaurant.photograph}.jpg`);
	}
static altTag(restaurant){
		return (`${restaurant.name}`);
	}
	/**
   * Map marker for a restaurant.
   */
	static mapMarkerForRestaurant(restaurant, map) {
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: DBHelper.urlForRestaurant(restaurant),
			map: map,
			animation: google.maps.Animation.DROP}
		);
		return marker;
	}
  /**
  * REVIEWS
  */
static fetchReviewsByRestaurantId(restaurant_id){
  return fetch(`${DBHelper.API_URL}?restaurant_id=${restaurant_id}`)
  .then(function(response){
    //returns results as json for storing
    //extra
    if (!response.ok) return Promise.reject("reviews could not be fetched from network");

    return response.json();
  })
  .then(reviews => {
    dbPromise.then(db => {
      //stores results
      var tx = db.transaction('reviews', 'readwrite');
      var store = tx.objectStore('reviews');
      reviews.forEach(review => {
        store.put(review);
      })
    //return response;
    });
    //callback(null, reviews);
    return reviews;
  }).catch(networkError => {
    dbPromise.then(db => {
      return db.transaction('reviews')
      .objectStore('reviews').getAll();
    }).then (allReviews => console.log (allReviews));
      console.log(`${networkError}`);
      return null; //return null to handle error ,as though there are no reviews.
  });
}

/*
static fetchReviewsByRestaurantId(restaurant_id){
    return fetch(`${DBHelper.API_URL}?restaurant_id=${restaurant_id}`).
    then(response => {
      if (!response.ok) return Promise.reject("reviews could not be fetched from network");
      return response.json();
    }).then(fetchedReviews =>{
      //if reviews could not be fetched from network:
      //TODO: store reviews on idb.

      return fetchedReviews;
    }).catch(networkError => {
      //if reviews couldn't be fetched from network:
      //TO DO: try to get reviews from idb.
      //getting all
      dbPromise.then(db => {
        return db.transaction('reviews')
        .objectStore('reviews').getAll();
      }).then (allReviews => console.log (allReviews));

      console.log(`${networkError}`);
      return null; //return null to handle error, as though there are no reviews.
    });
  }*/


  /*
static fetchReviewsByRestaurantId(restaurant_id){
    return fetch(`${DBHelper.API_URL}?restaurant_id=${restaurant_id}`).
    then(response => {
      if (!response.ok) return Promise.reject("reviews could not be fetched from network");
      return response.json();
    }).then(fetchedReviews =>{
      //if reviews could not be fetched from network:
      //TODO: store reviews on idb.

      return fetchedReviews;
    }).catch(networkError => {
      //if reviews couldn't be fetched from network:
      //TO DO: try to get reviews from idb.
      //getting all
      dbPromise.then(db => {
        return db.transaction('reviews')
        .objectStore('reviews').getAll();
      }).then (allReviews => console.log (allReviews));

      console.log(`${networkError}`);
      return null; //return null to handle error, as though there are no reviews.
    });
  }*/



}
