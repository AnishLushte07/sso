import angular from 'angular';
import moment from 'moment';

// eslint-disable-next-line angular/window-service
const { host, protocol } = window.location;
const PREFIX = `${protocol}//${host.substr(0, host.indexOf('-') + 1)}`;
let DOMAIN = `${host.substr(host.indexOf('.') + 1)}`;
const IS_DEV = DOMAIN.includes(':');
DOMAIN = IS_DEV ? 'quezx.test' : DOMAIN;

const SSO_APP = IS_DEV ? 'http://localhost:3000' : `${PREFIX}sso.${DOMAIN}`;
const ACCOUNTS_APP = `${PREFIX}accounts.${DOMAIN}`;
const ANALYTICS_APP = `${PREFIX}analytics.${DOMAIN}`;
const BILLING_APP = `${PREFIX}billing.${DOMAIN}`;

const constants = angular
  .module('accountsApp.constants', [])
  .constant('moment', moment)
  .constant('urls', {
    ACCOUNTS_APP,
    ANALYTICS_APP,
    BILLING_APP,
    SSO_APP
  });

export default constants.name;
