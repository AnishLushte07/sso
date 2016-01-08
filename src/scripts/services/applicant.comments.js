angular.module('qui')
  .factory('ApplicantComments', [
    '$http',
    '$q',
    'User',
    'APP',
    function ApplicantComments($http, $q, User, APP) {
      const applicantCommentService = {};

      applicantCommentService.get = function getApplicantComments(applicantId, params) {
        const url = `${APP.apiServer}/quarc/applicant/${applicantId}/comments`;
        return $http
          .get(url, { params: params })
          .then(
            function successGetApplicantComments(response) {
              return response.data;
            },

            function errorGetApplicantComments(response) {
              return $q.reject(response.data);
            }
          );
      };

      applicantCommentService.set = function setApplicantComments(applicantId, data) {
        const url = `${APP.apiServer}/quarc/applicant/${applicantId}/comments`;
        return $http
          .post(url, data)
          .then(
            function successSetApplicantComments(response) {
              return response.data;
            },

            function errorSetApplicantComments(response) {
              return $q.reject(response.data);
            }
          );
      };

      return applicantCommentService;
    },
  ]);
