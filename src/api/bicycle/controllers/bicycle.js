'use strict';

/**
 * bicycle controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::bicycle.bicycle');
