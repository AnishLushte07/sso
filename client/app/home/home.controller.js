class HomeController {
  /* @ngInject */
  constructor($window, $location, $stateParams, Session, urls) {
    this.$window = $window;
    this.$location = $location;
    this.Session = Session;
    this.urls = urls;
    this.$stateParams = $stateParams;
  }

  $onInit() {
    const user = this.Session.read('userinfo');
    const { location } = this.$window;
    const { client_id: clientId = 'analyticsquezx' } = this.$stateParams;
    if (!user) return {};

    const APP_NAME = clientId.replace('quezx', '_app').toUpperCase();
    return (location.href = this.href(clientId, this.urls[APP_NAME]));
  }

  href(clientId, baseUrl) {
    return this.$location
      .path('/authorise')
      .search({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: `${baseUrl}/${clientId === 'accountsquezx' ? 'signin' : 'access/oauth'}`,
      })
      .absUrl();
  }
}

export default HomeController;
