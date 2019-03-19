class AuthService {
  /* @ngInject */
  constructor($q, $log, $http, urls, authService, Session) {
    this.refreshingToken = false;
    this.$q = $q;
    this.$log = $log;
    this.$http = $http;
    this.urls = urls;
    this.authService = authService;
    this.Session = Session;
  }

  login(credential) {
    const loginCredentials = credential;

    return this
      .$http
      .post(`${this.urls.SSO_APP}/oauth/token`, loginCredentials, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest(obj) {
          return Object
            .keys(obj)
            .map(p => `${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`)
            .join('&');
        },
        ignoreAuthModule: true,
      })
      .then(res => this.Session.create('oauth', res.data))
      .catch(res => {
        this.Session.destroy();
        return this.$q.reject(res);
      });
  }

  refreshToken() {
    // To Save Multiple Async RefreshToken Request
    if (this.refreshingToken) {
      this.$log.warn('Refresh token request already sent.');
      return this.$q.reject({ warning: 'Refresh token request already sent.' });
    }

    this.refreshingToken = true; // Set refresh_token reuqest tracker flag
    return this
      .$http
      .post(
        `${this.urls.SSO_APP}/oauth/token`,
        { grant_type: 'refresh_token', refresh_token: this.Session.read('oauth').refresh_token },
        { ignoreAuthModule: true }
      )
      .then(res => {
        this.Session.create('oauth', res.data);
        this.refreshingToken = false; // reset refresh_token reuqest tracker flag

        return this // confirm login and replace token in buffered requests
          .authService
          .loginConfirmed('success', config => {
            const conf = config;
            conf.headers.Authorization = `Bearer ${this.Session.accessToken}`;
            return conf;
          });
      })
      .catch(err => {
        this.refreshingToken = false; // reset refresh_token reuqest tracker flag
        this.$log.error('Refresh token failed', err);
        return this.$q.reject(err); // expired token or some other problem
      });
  }

  logout() {
    return this
      .$http
      .post(`${this.urls.SSO_APP}/oauth/revoke`, { access_token: this.Session.accessToken })
      .then(res => {
        // Destroy Session data
        this.Session.destroy();
        return res;
      })
      .catch(res => {
        this.Session.destroy();
        return this.$q.reject(res);
      });
  }

  setSessionData() {
    return this
      .$http
      .get(`${this.urls.SSO_APP}/api/users/me`)
      .then(res => this.Session.create('userinfo', res.data));
  }
}

export default AuthService;
