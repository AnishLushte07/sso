angular.module('qui')
  .controller('SigninFormController', [
    '$rootScope',
    '$state',
    '$window',
    '$q',
    'Auth',
    'AUTH_EVENTS',
    'Page',
    function SigninFormCtrl($rootScope, $state, $window, $q, Auth, AUTH_EVENTS, Page) {
      const vm = this;
      Page.setTitle('Sign In');
      vm.user = {};
      vm.authError = null;
      vm.signin = function signin() {
        vm.authError = null;

        // Try to login
        Auth.login({ username: vm.user.username, password: vm.user.password })
          .then(
            function handleLogin() {
              $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            },

            function handleError(error) {
              $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
              vm.authError = error.message;
              const err = new Error(error.message);
              return $q.reject(err.message);
            }
          )
          .then(function setSession() {
            return Auth.setSessionData()
              .then(function openApp() {
                $window.location.href = $state.href('app.applicants', { bucket: 'All' }, { absolute: true });
                return;
              });
          });
      };
    },
  ]);
