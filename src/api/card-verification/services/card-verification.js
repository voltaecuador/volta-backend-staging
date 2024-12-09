'use strict';

/**
 * card-verification service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::card-verification.card-verification');
