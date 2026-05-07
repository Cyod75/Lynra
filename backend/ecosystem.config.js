module.exports = {
  apps: [
    {
      name: 'linra',
      script: './server.js',
      cwd: '/var/www/linra/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
