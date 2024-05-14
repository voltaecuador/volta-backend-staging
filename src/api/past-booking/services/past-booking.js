'use strict';

/**
 * past-booking service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::past-booking.past-booking');
