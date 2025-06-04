'use strict';

/**
 * golf-news service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::golf-news.golf-news');
