module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
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

    // Second application
    // {
    //   name      : 'WEB',
    //   script    : 'web.js'
    // }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    // production : {
    //   user : 'node',
    //   host : '212.83.163.1',
    //   ref  : 'origin/master',
    //   repo : 'git@github.com:repo.git',
    //   path : '/var/www/production',
    //   'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    // },
    // dev : {
    //   user : 'node',
    //   host : '212.83.163.1',
    //   ref  : 'origin/master',
    //   repo : 'git@github.com:repo.git',
    //   path : '/var/www/development',
    //   'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
    //   env  : {
    //     NODE_ENV: 'dev'
    //   }
    // }
  }
};
