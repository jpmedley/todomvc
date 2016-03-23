
( function () {
	'use strict';

	if ('serviceWorker' in navigator) {
		console.log('Will the service worker register?');
		navigator.serviceWorker.register('/service-worker.js').then(function(){
	  		console.log('Yes it did.');
		}).catch(function(err) {
	  		console.log('No it didn\'t. This happened: ', err);
		});
	}

}());