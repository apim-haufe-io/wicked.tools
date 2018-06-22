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
        NODE_ENV: 'portal_local',
        DEBUG: '',
        LOG_LEVEL: 'debug',
        PORTAL_CONFIG_BASE: '../wicked-sample-config'
      }
    },
    {
      name      : 'portal',
      script    : 'bin/www',
      cwd       : '../../wicked.portal',
      env: {
        DEBUG: 'wicked-sdk:*',
        LOG_LEVEL: 'debug'
      }
    },
    {
      name      : 'portal-kong-adapter',
      script    : 'bin/kong-adapter',
      cwd       : '../../wicked.portal-kong-adapter',
      env: {
        DEBUG: 'wicked-sdk:*',
        LOG_LEVEL: 'debug'
      }
    },
    {
      name      : 'portal-auth',
      script    : 'npm',
      args      : 'run build',
      cwd       : '../../wicked.portal-auth',
      env: {
        DEBUG: 'wicked-sdk:*',
        LOG_LEVEL: 'debug'
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
