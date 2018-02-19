/* @ngInject */
export default function routes($stateProvider) {
  $stateProvider
    .state('oauth.client-signup', {
      url: '/client-signup/{type:int}/:userId&&{src:int}',
      template: '<client-signup></client-signup>',
      data: { pageTitle: 'Client Signup' },
    });
}
