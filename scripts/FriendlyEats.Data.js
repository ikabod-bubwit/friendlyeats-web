/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';


FriendlyEats.prototype.addRestaurant = function(data) {
  var collection = firebase.firestore().collection('restaurants');
  return collection.add(data);
};

FriendlyEats.prototype.getAllRestaurants = function(renderer) {
  var query = firebase.firestore()
      .collection('restaurants')
      .orderBy('avgRating', 'desc')
      .limit(50);
     
   // Note: It's also possible to fetch documents from Cloud Firestore once, rather than listening for real time updates using the Query.get() method.
  this.getDocumentsInQuery(query, renderer);
};

FriendlyEats.prototype.getDocumentsInQuery = function(query, renderer) {
  query.onSnapshot(function(snapshot){
    console.log(snapshot.size);
    if (!snapshot.size) return renderer.empty();// No restaurants found

    snapshot.docChanges().forEach(function(change){
      if (change.type == 'removed'){
        renderer.remove(change.doc);
      }else{
        renderer.display(change.doc);
      }
    });
  });
};

FriendlyEats.prototype.getRestaurant = function(id) {
  // https://codelabs.developers.google.com/codelabs/firestore-web/#7
  return firebase.firestore().collection('restaurants').doc(id).get();
};

FriendlyEats.prototype.getFilteredRestaurants = function(filters, renderer) {
  // https://codelabs.developers.google.com/codelabs/firestore-web/#8
  // var filteredQuery = query.where('category', '==', 'Dim Sum')
  // As its name implies, the where() method will make our query download only members of the collection whose fields meet the restrictions we set. In this case, it'll only download restaurants where category is Dim Sum.
  var query = firebase.firestore().collection('restaurants');

  if (filters.category !== 'Any'){
    query = query.where('category', '==', filters.category);
  }

  if (filters.city !== 'Any'){
    query = query.where('city', '==', filters.city);
  }

  if (filters.price !== 'Any'){
    query = query.where('price', '==', filters.price.length);
  }

  if (filters.sort === 'Ratings'){
    query = query.orderBy('avgRatings', 'desc');
  } else if (filters.sort === 'Reviews'){
    query = query.orderBy('numRatings', 'desc');
  }

  this.getDocumentsInQuery(query, renderer);
};

FriendlyEats.prototype.addRating = function(restaurantID, rating) {
  // Write data in a transaction
  /*
     Retrieve add a rating to a restaurant
  */
  var collection = firebase.firestore().collection('restaurants');
  var document = collection.doc(restaurantID);

  var newRatingDocument = document.collection('rating').doc();

  return firebase.firestore().runTransaction(function(transaction){
    // In this block , we trigger a transaction to update the numeric values of averageRating and ratingCount in the restaurant document. At the same time, we add the new rating to the ratings subcollection.
    /*  
    Note: Adding ratings is a good example for using a transaction for this particular codelab. However, in a production app you should perform the average rating calculation on a trusted server to avoid manipulation by users. A good way to do this is to write the rating document directly from the client, then use Cloud Functions to update the new restaurant average rating.
    */
    return transaction.get(document).then(function(doc){
      var data = doc.data();

      var newAvgRating = (data.numRatings * data.avgRating + rating.rating) / (data.numRatings + 1);

      transaction.update(document, {
        numRatings: data.numRatings + 1,
        avgRating: newAvgRating
      });

      return transaction.set(newRatingDocument, rating);

    });
  });

};
