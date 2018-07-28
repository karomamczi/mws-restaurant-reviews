import { DBHelper } from './dbhelper.js';

/**
 * External property initialization
 */
let map;

/**
 * Init map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  const restaurantInfo = new RestaurantInfo();
  restaurantInfo.initMap();
});

document.getElementById('submit-btn').addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  const restaurantInfo = new RestaurantInfo();
  restaurantInfo.validateInputs();
});

class RestaurantInfo {
  constructor() {
    this.restaurant;
  }

  /**
   * Initialize Google map, called from HTML.
   */
  initMap() {
    window.initMap = () => {
      this.fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
          console.error(error);
        } else {
          map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: restaurant.latlng,
            scrollwheel: false
          });
          this.fillBreadcrumb();
          DBHelper.mapMarkerForRestaurant(this.restaurant, map);
        }
      });
    }
  }

  /**
   * Get current restaurant from page URL.
   */
  fetchRestaurantFromURL(callback) {
    if (this.restaurant) { // restaurant already fetched!
      callback(null, this.restaurant)
      return;
    }
    const id = this.getParameterByName('id');
    if (!id) { // no id found in URL
      error = 'No restaurant id in URL'
      callback(error, null);
    } else {
      DBHelper.fetchRestaurantById(id, (error, restaurant) => {
        this.restaurant = restaurant;
        if (!restaurant) {
          console.error(error);
          return;
        }
        this.fillRestaurantHTML();
        callback(null, restaurant)
      });
    }
  }

  /**
   * Create restaurant HTML and add it to the webpage
   */
  fillRestaurantHTML(restaurant = this.restaurant) {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img'
    image.alt = `${restaurant.name} Restaurant`;
    image.src = DBHelper.imageUrlForRestaurant(restaurant, 'src');
    image.srcset = DBHelper.imageUrlForRestaurant(restaurant, 'srcset');
    image.sizes = '(max-width: 684px) 100vw, 50vw';

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    document.getElementById('review-form').setAttribute('name', restaurant.id);

    // fill operating hours
    if (restaurant.operating_hours) {
      this.fillRestaurantHoursHTML();
    }
    // fill reviews
    this.fillReviewsHTML();
  }

  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  fillRestaurantHoursHTML(operatingHours = this.restaurant.operating_hours) {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
      const row = document.createElement('tr');

      const day = document.createElement('td');
      day.innerHTML = key;
      row.appendChild(day);

      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      row.appendChild(time);

      hours.appendChild(row);
    }
  }

  /**
   * Create all reviews HTML and add them to the webpage.
   */
  fillReviewsHTML() {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    DBHelper.fetchReviewsByRestaurantId(this.restaurant.id, (error, reviews) => {
      if (error) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
      } else {
        const ul = document.getElementById('reviews-list');
        reviews.forEach(review => {
          ul.appendChild(this.createReviewHTML(review));
        });
        container.appendChild(ul);
      }

    });

  }

  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML(review) {
    const li = document.createElement('li');
    const nameDateParagraph = document.createElement('p');
    const nameSpan = document.createElement('span');
    const dateSpan = document.createElement('span');
    nameSpan.innerHTML = review.name;
    nameSpan.classList.add('reviewer-name');
    dateSpan.innerHTML = new Date(review.createdAt).toLocaleDateString();
    dateSpan.classList.add('reviewer-date');
    nameDateParagraph.appendChild(nameSpan);
    nameDateParagraph.appendChild(dateSpan);
    nameDateParagraph.classList.add('reviewer-name-date')
    li.appendChild(nameDateParagraph);

    const rating = document.createElement('p');
    const ratingSpan = document.createElement('span');
    ratingSpan.innerHTML = `Rating: ${review.rating}`;
    ratingSpan.classList.add('reviewer-rating-badge');
    rating.appendChild(ratingSpan);
    rating.classList.add('reviewer-rating');
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    comments.classList.add('reviewer-comments');
    li.appendChild(comments);

    return li;
  }

  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb(restaurant = this.restaurant) {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
  }

  /**
   * Get a parameter by name from page URL.
   */
  getParameterByName(name, url) {
    if (!url)
      url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results)
      return null;
    if (!results[2])
      return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  /**
   * Remove dangerous input.
   */
  removeDangerousInput(value) {
    return value
      .toString()
      .replace('&','&amp;')
      .replace('<','&lt;')
      .replace('>','&gt;')
      .replace('"','&quot;')
      .replace("'",'&#x27')
      .replace('/','&#x2F');
  };

  /**
   * Validate inputs, remove dangerous content and conditionally trigger
   * addNewReview method or show warning for the badly filled form.
   */
  validateInputs() {
    const authorName = this.removeDangerousInput(document.getElementById('review-author').value);
    const rating = Array.from(document.getElementsByName('rating')).find(r => {
      r.checked ? r.setAttribute('aria-checked', true) : r.setAttribute('aria-checked', false)
      return r.checked
    });
    const comment = this.removeDangerousInput(document.getElementById('review-comment').value);
    const formError = document.getElementById('validation-error');
    if (authorName && rating && comment) {
      formError.hidden = true;
      document.getElementById('review-form').reset();
      this.addNewReview(authorName, rating.value, comment);
    } else {
      formError.hidden = false;
    }
  }

  /**
   * Send review to database.
   */
  addNewReview(authorName, ratingValue, comment) {
    const reviewObject = {
      restaurant_id: document.getElementById('review-form').getAttribute('name'),
      name: authorName,
      rating: ratingValue,
      comments: comment
    }
    DBHelper.addNewReview(reviewObject)
  }
}