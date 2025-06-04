'use strict';

/**
 * sports-news service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::sports-news.sports-news');
