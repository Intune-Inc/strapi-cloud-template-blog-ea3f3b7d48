module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '500mb',
      jsonLimit: '500mb',
      textLimit: '500mb',
      formidable: {
        maxFileSize: 500 * 1024 * 1024, // 500MB
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
