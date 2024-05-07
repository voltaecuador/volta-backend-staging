'use strict';

/**
 * bicycle service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bicycle.bicycle');
