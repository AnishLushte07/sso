import angular from 'angular';
import uiRouter from 'angular-ui-router';
import SignIn from './sign-in';
import Auth from './auth';
import PasswordReset from './password-reset';
import Success from './success';
import FourOFour from './four-o-four';
import routing from './oauth.routes';

export default angular
  .module('accountsApp.oauth', [
    uiRouter, SignIn, Success, PasswordReset, FourOFour, Auth,
  ])
  .config(routing)
  .name;
