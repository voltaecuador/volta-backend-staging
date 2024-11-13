'use strict';

/**
 * purchased-ride-pack controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::purchased-ride-pack.purchased-ride-pack', ({ strapi }) => ({
  async create(ctx) {
    const response = await super.create(ctx);
    
    const convertDate = (date) => {
      const options = {
        month: "short",
        day: "numeric",
      };
      return new Date(date).toLocaleDateString("en-US", options);
    };

    try {
      const purchaseId = response.data.id;
      const purchase = await strapi.entityService.findOne(
        "api::purchased-ride-pack.purchased-ride-pack",
        purchaseId,
        {
          populate: ["user"],
        }
      );

      await strapi
        .plugin("email-designer")
        .service("email")
        .sendTemplatedEmail(
          {
            to: purchase.user.email,
          },
          {
            templateReferenceId: 4,
          },
          {
            nombre: `${purchase.user.nombre}`,
            cantidadClases: purchase.clasesOriginales,
            fechaCompra: convertDate(purchase.fechaCompra),
            fechaExpiracion: convertDate(purchase.fechaExpiracion),
            transactionId: purchase.transactionId,
            authorizationCode: purchase.authorizationCode,
          }
        );
    } catch (err) {
      console.error("Error al enviar el correo electrónico:", err);
    }

    return response;
  }
}));
