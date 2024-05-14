'use strict';

/**
 * purchase-ride service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::purchase-ride.purchase-ride');
