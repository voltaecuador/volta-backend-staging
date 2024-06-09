module.exports = {
  moveBookingsIntoOldBookingsTable: {
    task: async ({ strapi }) => {
      const currentDate = new Date();
      const cutoffDate = new Date(currentDate.getTime() - 90 * 60000); // 1 hora y 30 minutos antes

      const oldBookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          fechaHora: {
            $lt: cutoffDate,
          },
        },
        populate: ['class', 'bicycle', 'user'],
      });

      for (const oldBooking of oldBookings) {
        const pastBookingData = {
          bookingStatus: oldBooking.bookingStatus,
          class: oldBooking.class,
          bicycle: oldBooking.bicycle,
          users_permissions_user: oldBooking.user,
          fechaHora: oldBooking.fechaHora,
        };

        await strapi.entityService.create('api::past-booking.past-booking', {
          data: pastBookingData,
        });

        await strapi.entityService.delete('api::booking.booking', oldBooking.id);
      }

      console.log(`Moved ${oldBookings.length} bookings to pastBookings table`);
    },
    options: {
      rule: '0 * * * *', // Run every hour
    },
  },
};