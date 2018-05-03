module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'portal-api',
      script    : 'bin/api',
      cwd       : '../../wicked.portal-api',
      env: {
        NODE_ENV: 'localhost',
        DEBUG: 'portal-env:*,portal-api:*,wicked-sdk:*',
        PORTAL_CONFIG_BASE: '../wicked-sample-config'
      }
    },
    {
      name      : 'portal',
      script    : 'bin/www',
      cwd       : '../../wicked.portal',
      env: {
        DEBUG: 'portal:*,wicked-sdk:*'
      }
    },
    {
      name      : 'portal-kong-adapter',
      script    : 'bin/kong-adapter',
      cwd       : '../../wicked.portal-kong-adapter',
      env: {
        DEBUG: 'kong-adapter:*,wicked-sdk:*'
      }
    },
    {
      name      : 'portal-auth',
      script    : 'bin/authz',
      cwd       : '../../wicked.portal-auth',
      env: {
        DEBUG: 'portal-auth:*,wicked-sdk:*'
      }
    },
  ],

  /**
   * Deployment section - not needed/makes no sense for wicked here.
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
  }
};
