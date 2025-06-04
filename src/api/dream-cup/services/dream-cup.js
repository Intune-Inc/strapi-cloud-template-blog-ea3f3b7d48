'use strict';

/**
 * dream-cup service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::dream-cup.dream-cup');
