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

    const VALID_APP = {
      2: [
        'partnerquezx', 'partnerwordpress', 'chatquezx', 'qdesktop',
        'searchquezx', 'teamquezx', 'accessquezx', 'qdesklive', 'huntquezx',
      ],
      4: ['managequezx', 'chatquezx', 'searchquezx', 'teamquezx', 'qdesklive'],
      5: ['hirequezx', 'chatquezx', 'searchquezx', 'teamquezx', 'qdesklive'],
      8: ['managequezx', 'chatquezx', 'searchquezx', 'teamquezx', 'qdesklive'],
      9: ['managequezx', 'chatquezx', 'searchquezx', 'teamquezx', 'qdesklive'],
    }[user.group_id];

    switch (true) {
      case !VALID_APP:
        return (this.error = 'Invalid user group');

      case !VALID_APP.includes(clientId): {
        const APP_NAME = VALID_APP[0].replace('quezx', '_app').toUpperCase();
        const FALLBACK_APP = `${this.urls[APP_NAME]}`;
        if (!FALLBACK_APP) return (this.error = 'FALLBACK_APP not found');

        return (location.href = `${FALLBACK_APP}${params.state}`);
      }

      default: {
        const url = `${this.urls.API_SERVER}/authorise`;
        return this
          .$http
          .post(url, Object.assign(params, { allow: 'true' }), { params })
          .then(({ data }) => (location.href = data))
          .catch(({ data }) => (this.error = data.error));
      }
    }
  }
}

export default AuthoriseController;
