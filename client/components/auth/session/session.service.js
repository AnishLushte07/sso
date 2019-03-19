import angular from 'angular';

class SessionService {
  /* @ngInject */
  constructor($window) {
    this.localStorage = $window.localStorage;
  }

  get isLoggedIn() {
    return !!(this.read('oauth') && this.read('oauth').access_token);
  }

  get accessToken() {
    if (!this.isLoggedIn) return new Error('AccessToken not found');
    return this.read('oauth').access_token;
  }

  create(key, value) {
    this.localStorage[key] = angular.toJson(value);
  }

  read(key) {
    return angular.fromJson(this.localStorage[key]);
  }

  remove(key) {
    return this.localStorage.removeItem(key);
  }

  destroy() {
    this.localStorage.clear();
  }
}

export default SessionService;
