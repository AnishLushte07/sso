angular.module('qui')
  .factory('Degrees', [
    '$http',
    '$q',
    'APP',
    function Jobs($http, $q, APP) {
      const degreeService = {};

      degreeService.get = function getDegrees(params) {
        const url = `${APP.apiServer}/quarc/degree`;
        return $http
          .get(url, { params: params })
          .then(
            function successDegrees(response) {
              return response.data;
            },

            function errorDegrees(response) {
              return $q.reject(response.data);
            }
          );
      };

      return degreeService;
    },
  ]);
