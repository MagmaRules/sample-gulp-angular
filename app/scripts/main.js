var searchApp = angular.module('searchApp', []);
searchApp.controller('SearchCtrl', ['$scope', '$http','$timeout',
function($scope, $http, $timeout) {
  var lastQuery = '';
  $scope.query = '';
  $scope.results = [];

  function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join('0') + num;
  }

  function processResults(results) {
    $scope.results = [];
    for (var i in results) {
      var entry = results[i];
      entry.name = entry.name.toUpperCase();
      // jscs:disable
      var date = new Date(entry.end_of_an_era);
      // jscs:enable
      entry.endOfAnEra = zeroPad(date.getDate(),2) + '/' +
      zeroPad(date.getMonth() + 1, 2) +
      '/' + zeroPad(date.getFullYear().toString(), 4);
      $scope.results.push(entry);
    }
    endLoading();
  }

  function loadResults(data) {
    if (data && data.ancients) {
      processResults(data.ancients);
    } else {
      processResults(data);
    }
  }

  function showLoading() {
    $scope.loading = true;
  }

  function endLoading() {
    $scope.loading = false;
  }

  showLoading();
  $http.get('https://athena-7.herokuapp.com/ancients.json')
  .success(function(data) {
    processResults(data);
  });

  var tmpQuery = '';
  var queryTimeout = null;

  $scope.$watch('query', function(query) {
    if (queryTimeout) {
      $timeout.cancel(queryTimeout);
    }
    tmpQuery = query;
    queryTimeout = $timeout(function() {
      $scope.search(tmpQuery);
    }, 250);
  });

  $scope.showError = function() {
    showLoading();
    $http.get('https://athena-7.herokuapp.com/ancients.json?error=true')
    .error(function(data) {
      $scope.specialError = data.error;
      endLoading();
    });
  };

  $scope.search = function(query) {
    $scope.specialError = null;
    if (query == lastQuery) {
      return;
    }
    showLoading();
    $http.get('https://athena-7.herokuapp.com/ancients.json?search=' + query)
    .success(function(data) {
      loadResults(data);
    });
    lastQuery = query;
  };
}]);
