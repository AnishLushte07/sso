class PasswordResetController {
  /* @ngInject */
  constructor($http, $stateParams, $timeout, $state, urls, Auth) {
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$timeout = $timeout;
    this.$state = $state;
    this.urls = urls;
    this.Auth = Auth;
  }

  $onInit() {
    this.data = { email: '' };
    this.error = null;
    this.success = null;
    this.sentTo = null;
    this.resetPwd = false;
    this.ERROR_MSG = 'Something went wrong';

    if (this.$stateParams.token && this.$stateParams.id) {
      this.data.id = this.$stateParams.id;
      this.data.token = this.$stateParams.token;
      this.$http.get(`/password_reset/${this.data.id}`, {
        ignoreAuthModule: true,
        params: { token: this.data.token },
      })
        .then(({ data }) => {
          this.$stateParams.token = this.$stateParams.id = null;
          this.resetPwd = true;
          this.data.email = data.email;
        })
        .catch(({ data }) => (this.error = data.error_description || this.ERROR_MSG));
    }
  }

  match(confirmPassword) {
    confirmPassword.$setValidity('match', this.data.password === this.data.confirm_password);
  }

  sendResetMail() {
    this.sentTo = this.error = '';
    this.$http.post('/password_reset', this.data, { ignoreAuthModule: true })
      .then(() => { this.sentTo = this.data.email; })
      .catch(({ data }) => (this.error = data.error_description || this.ERROR_MSG));
  }

  pwdReset() {
    this.success = this.error = '';

    this.$http
      .put(`/password_reset/${this.data.id}`, this.data, { ignoreAuthModule: true })
      .then(() => {
        this.success = 'Password update was successful.';
        this.$timeout(() => (this.$state.go('oauth.sign-in', {
          username: this.data.email,
          password: this.data.password,
        })), 10);
      })
      .catch((data) => (this.error = data.error_description || this.ERROR_MSG));
  }
}

export default PasswordResetController;
