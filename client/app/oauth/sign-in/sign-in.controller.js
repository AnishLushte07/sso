
class SignInController {
  /* @ngInject */
  constructor(
    $window, $state, $location, $rootScope, Auth, AUTH_EVENTS, Session, urls
  ) {
    this.$window = $window;
    this.$state = $state;
    this.$location = $location;
    this.$rootScope = $rootScope;
    this.Auth = Auth;
    this.urls = urls;
    this.AUTH_EVENTS = AUTH_EVENTS;
    this.Session = Session;
  }

  $onInit() {
    this.error = null;
    this.user = {
      username: this.$state.params.username || '',
      password: this.$state.params.password || '',
    };

    if (this.$state.params.code || (this.$state.params.username && this.$state.params.username)) {
      return this.signin(this.$state.params.code);
    }

    this.show = true;
    return null;
  }

  signin(code, forceLogin = false) {
    this.error = null;
    const { username, password } = this.user;

    const options = { username, password, forceLogin };

    // Try to login
    this.Auth
      .login(code ? { grant_type: 'google', code } : options)
      .then(() => {
        this.$rootScope.$broadcast(this.AUTH_EVENTS.loginSuccess);
        this.Auth.setSessionData().then(() => {
          const { $location, $state } = this;
          const { whatBlocked = [] } = this.Session.read('userinfo') || {};
          const [state] = whatBlocked.map((x) => x.state);
          if (state === 'password-change') return $state.go(state);

          if ($location.search().continue) return $location.url($location.search().continue);
          return $location.path($state.href('home'));
        });
      }, ({ data, status }) => {
        this.show = true;
        this.$rootScope.$broadcast(this.AUTH_EVENTS.loginFailed);
        this.error = data.error_description;
      });
  }
}

export default SignInController;
