module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'api',
      script    : 'bin/api',
      cwd       : '../../wicked.api',
      env: {
        NODE_ENV: 'portal_local',
        DEBUG: '',
        LOG_LEVEL: 'debug',
        PORTAL_CONFIG_BASE: '../wicked-sample-config'
      }
    },
    {
      name      : 'ui',
      script    : 'bin/www',
      cwd       : '../../wicked.ui',
      env: {
        DEBUG: 'wicked-sdk:*',
        LOG_LEVEL: 'debug'
      }
    },
    {
      name      : 'kong-adapter',
      script    : 'npm',
      args      : 'run build-and-start',
      cwd       : '../../wicked.kong-adapter',
      env: {
        DEBUG: 'wicked-sdk:*',
        LOG_LEVEL: 'debug'
      }
    },
    {
      name      : 'auth',
      script    : 'npm',
      args      : 'run build-and-start',
      cwd       : '../../wicked.auth',
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
