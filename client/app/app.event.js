/* @ngInject */
function events($rootScope, $location, $state, Auth, AUTH_EVENTS, Session) {
  const encodedContinue = encodeURIComponent($location.url().replace('/logout', '/home'));

  const user = Session.read('userinfo');
  const { whatBlocked = [] } = user || {};
  const [state] = whatBlocked.map((x) => x.state);

  if (state === 'password-change') $state.go('settings.password-change');

  // eslint-disable-next-line angular/on-watch
  $rootScope.$on(AUTH_EVENTS.loginRequired, () => Auth
    .refreshToken()
    .catch(() => { // handle failure to RenewToken
      Session.destroy();
      $location.url(`/signin?continue=${encodedContinue}`);
    }));

  // In Future: assign to variable to destroy during the $destroy event
  // eslint-disable-next-line angular/on-watch
  $rootScope.$on('$stateChangeStart', (event, next) => {
    if (!Session.isLoggedIn && !next.name.includes('oauth')) {
      $location.url(`/signin?continue=${encodedContinue}`);
      $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    }

    if (Session.isLoggedIn && (next.name === 'oauth.sign-in')) {
      event.preventDefault();
      $state.go('home', $location.search());
    }
  });
}

export default events;
