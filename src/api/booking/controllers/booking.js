// @ts-nocheck
"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::booking.booking", ({ strapi }) => ({
  async create(ctx) {
    // Extraer datos de la solicitud
    const { data } = ctx.request.body;
    const { bicycles, fechaHora, class: classId } = data;

    // Verificar si alguna de las bicicletas ya está reservada
    for (const bicycleId of bicycles) {
      const existingBookings = await strapi.entityService.findMany("api::booking.booking", {
        filters: {
          fechaHora: fechaHora,
          bicycles: {
            id: bicycleId
          },
          bookingStatus: {
            $ne: "cancelled"  // Ignorar reservas canceladas
          }
        },
      });

      if (existingBookings.length > 0) {
        return ctx.badRequest(
          'Bicycle already booked',
          { message: `La bicicleta ${bicycleId} ya está reservada para esta clase.` }
        );
      }
    }

    // Si no hay conflictos, proceder con la creación
    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    // Similar validación para actualizaciones
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const { bicycles, fechaHora } = data;

    if (bicycles) {
      for (const bicycleId of bicycles) {
        const existingBookings = await strapi.entityService.findMany("api::booking.booking", {
          filters: {
            id: {
              $ne: id  // Excluir la reserva actual
            },
            fechaHora: fechaHora,
            bicycles: {
              id: bicycleId
            },
            bookingStatus: {
              $ne: "cancelled"
            }
          },
        });

        if (existingBookings.length > 0) {
          return ctx.badRequest(
            'Bicycle already booked',
            { message: `La bicicleta ${bicycleId} ya está reservada para esta clase.` }
          );
        }
      }
    }

    const response = await super.update(ctx);
    return response;
  }
}));