module.exports = {
  // moveBookingsIntoOldBookingsTable: {
  //   task: async ({ strapi }) => {
  //     const currentDate = new Date();

  //     const oldBookings = await strapi.entityService.findMany(
  //       "api::booking.booking",
  //       {
  //         filters: {
  //           $and: [
  //             {
  //               bookingStatus: {
  //                 $eq: "completed"
  //               }
  //             }
  //           ]
  //         },
  //         populate: ["class", "class.instructor", "bicycles", "user", "guest"],
  //       }
  //     );

  //     let movedCount = 0;
  //     for (const oldBooking of oldBookings) {
  //       try {
  //         // Combinar la fecha del booking con la hora de inicio de la clase
  //         const bookingDate = new Date(oldBooking.fechaHora);
  //         const [hours, minutes] = oldBooking.class.horaInicio.split(':');
  //         const classStartTime = new Date(bookingDate);
  //         classStartTime.setHours(parseInt(hours), parseInt(minutes), 0);

  //         const timeElapsedInMinutes = (currentDate - classStartTime) / (1000 * 60);

  //         // Solo procesar si han pasado al menos 90 minutos desde el inicio de la clase
  //         if (timeElapsedInMinutes < 90) {
  //           continue;
  //         }

  //         // Verificar si ya existe en past-booking
  //         const existingPastBooking = await strapi.entityService.findMany("api::past-booking.past-booking", {
  //           filters: {
  //             fechaHora: oldBooking.fechaHora,
  //             users_permissions_user: oldBooking.user.id
  //           },
  //           limit: 1
  //         });

  //         if (existingPastBooking.length > 0) {
  //           console.log(`Booking ${oldBooking.id} already exists in past-bookings. Skipping.`);
  //           continue;
  //         }

  //         // Crear copias de los datos
  //         const classData = {
  //           nombreClase: oldBooking.class.nombreClase || `Rueda con ${oldBooking.class.instructor.nombreCompleto}`,
  //           horaInicio: oldBooking.class.horaInicio,
  //           horaFin: oldBooking.class.horaFin,
  //           instructor: {
  //             nombreCompleto: oldBooking.class.instructor.nombreCompleto,
  //             email: oldBooking.class.instructor.email
  //           }
  //         };

  //         const bicyclesData = oldBooking.bicycles.map(bike => ({
  //           bicycleNumber: bike.bicycleNumber
  //         }));

  //         const pastBookingData = {
  //           bookingStatus: oldBooking.bookingStatus,
  //           classData,
  //           bicyclesData,
  //           users_permissions_user: oldBooking.user,
  //           fechaHora: oldBooking.fechaHora,
  //           guest: oldBooking.guest
  //         };

  //         await strapi.entityService.create("api::past-booking.past-booking", {
  //           data: { ...pastBookingData, publishedAt: new Date() },
  //         });

  //         await strapi.entityService.delete(
  //           "api::booking.booking",
  //           oldBooking.id
  //         );

  //         movedCount++;
  //       } catch (error) {
  //         console.error(`Error processing booking ${oldBooking.id}:`, error);
  //       }
  //     }
  //     console.log(`Moved ${movedCount} completed bookings to pastBookings table`);
  //   },
  //   options: {
  //     rule: "*/15 * * * *",
  //   },
  // },
  actualizarClasesPorExpiracion: {
    task: async ({ strapi }) => {
      try {
        const ahora = new Date();
        console.log('=== INICIO DE CRON DE EXPIRACIÓN ===');
        console.log(`Ejecutando verificación a las ${ahora.toISOString()}`);

        // Buscar TODOS los paquetes expirados y no contabilizados
        const paquetesExpirados = await strapi.entityService.findMany('api::purchased-ride-pack.purchased-ride-pack', {
          filters: {
            fechaExpiracion: { $lt: ahora }, // Todos los que ya expiraron (antes de ahora)
            contabilizado: false             // Y no han sido procesados
          },
          populate: ['user']
        });

        console.log(`Encontrados ${paquetesExpirados.length} paquetes expirados`);

        for (const paquete of paquetesExpirados) {
          try {
            // Verificar si el paquete tiene usuario
            if (!paquete.user) {
              console.log(`Paquete ${paquete.id} no tiene usuario asociado. Marcando como contabilizado.`);
              await strapi.entityService.update('api::purchased-ride-pack.purchased-ride-pack', paquete.id, {
                data: { contabilizado: true }
              });
              continue;
            }

            const clasesNoUtilizadas = paquete.clasesOriginales - paquete.clasesUtilizadas;
            const usuario = paquete.user;
            
            // Verificar que clasesDisponibles sea un número
            if (typeof usuario.clasesDisponibles !== 'number') {
              usuario.clasesDisponibles = 0;
            }

            const nuevasClasesDisponibles = Math.max(usuario.clasesDisponibles - clasesNoUtilizadas, 0);
            
            await strapi.entityService.update('plugin::users-permissions.user', usuario.id, {
              data: { clasesDisponibles: nuevasClasesDisponibles }
            });

            await strapi.entityService.update('api::purchased-ride-pack.purchased-ride-pack', paquete.id, {
              data: { contabilizado: true }
            });

            console.log(`Paquete ${paquete.id} expirado el ${paquete.fechaExpiracion}. Usuario ${usuario.id}: ${clasesNoUtilizadas} clases restadas. Nuevas clases disponibles: ${nuevasClasesDisponibles}`);
          } catch (error) {
            console.error(`Error procesando paquete ${paquete.id}:`, error);
          }
        }

        console.log('Actualización de clases por expiración completada');
      } catch (error) {
        console.error('ERROR EN CRON DE EXPIRACIÓN:', error);
      }
    },
    options: {
      rule: '1 0 * * *', // 12:01 AM hora Ecuador
    },
  }
};
