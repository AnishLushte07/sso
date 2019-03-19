class AuthoriseController {
  /* @ngInject */
  constructor($window, $location, $http, Session, urls) {
    this.$window = $window;
    this.$location = $location;
    this.$http = $http;
    this.Session = Session;
    this.urls = urls;
  }

  $onInit() {
    const user = this.Session.read('userinfo') || {};
    const params = this.$location.search();
    const { location } = this.$window;
    const { client_id: clientId } = params;


    const url = `${this
      .urls.SSO_APP}/api/authorise`;
    return this
      .$http
      .post(url, Object.assign(params, { allow: 'true' }), { params })
      .then(({ data }) => (location.href = data))
      .catch(({ data }) => (this.error = data.error));


  }
}

export default AuthoriseController;
