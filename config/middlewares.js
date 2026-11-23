module.exports = [
  'strapi::logger',
  // strapi::errors 보다 앞에 두어야 오류 처리 후의 최종 응답 코드가 기록됨
  'global::request-audit',
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
  'global::relation-sort',
];
