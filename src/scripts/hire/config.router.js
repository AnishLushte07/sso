angular.module('qui.hire')
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function quiStateConfig($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.when('/', '/app/dashboard');
      $urlRouterProvider.otherwise('/access/404');
      $stateProvider
        .state('access', {
          url: '/access',
          template: '<div ui-view class="fade-in-right-big smooth"></div>',
        })
        .state('access.oauth', {
          url: '/oauth',
          templateUrl: 'html/oauth.quezx.html',
        })
        .state('access.404', {
          url: '/404',
          templateUrl: 'html/404.html',
        })
        .state('app', {
          abstract: true,
          url: '',
          templateUrl: 'html/hire.app.html',
        })
        .state('app.dashboard', {
          url: '/dashboard',
          templateUrl: 'html/dashboard.html',
        })
        .state('app.jobs', {
          abstract: true,
          url: '/jobs',
          template: '<div ui-view></div>',
        })
        .state('app.jobs.new', {
          url: '/new',
          controller: 'NewJobController as Job',
          templateUrl: 'html/jobs.new.html',
        })
        .state('app.jobs.list', {
          url: '/',
          templateUrl: 'html/jobs.list.html',
        })
        .state('app.jobs.applicants', {
          url: '/applicants/{bucket}',
          templateUrl: 'html/applicants.html',
        })
        .state('app.jobs.view', {
          url: '/{jobId}',
          templateUrl: 'html/job.view.html',
        })
        .state('app.jobs.edit', {
          url: '/{jobId}/edit',
          controller: 'NewJobController as Job',
          templateUrl: 'html/jobs.new.html',
        })
        .state('app.jobs.manage', {
          url: '/{jobId}/{bucket}',
          templateUrl: 'html/jobs.manage.html',
        })
        .state('app.applicant', {
          abstract: true,
          url: '/applicants',
          template: '<div ui-view class="fade-in-right-big smooth"></div>',
        })
        .state('app.applicant.view', {
          url: '/{applicantId}',
          templateUrl: 'html/applicant.view.html',
        })
        .state('app.calendar', {
          url: '/calendar',
          templateUrl: 'html/calendar.html',
        })
        .state('app.stats', {
          url: '/stats',
          abstract: true,
          templateUrl: 'html/stats.html',
        })
        .state('app.stats.candidate', {
          url: '/candidate/{nav}',
          templateUrl: 'html/stats.candidate.html',
        })
        .state('app.stats.conversion', {
          url: '/conversion/{nav}',
          templateUrl: 'html/stats.conversion.html',
        })
        .state('app.stats.pipespeed', {
          url: '/pipespeed/{nav}',
          templateUrl: 'html/stats.pipespeed.html',
        })
        .state('app.stats.pipeline', {
          url: '/pipeline/{nav}',
          templateUrl: 'html/stats.pipeline.html',
        });
    },
  ]);
