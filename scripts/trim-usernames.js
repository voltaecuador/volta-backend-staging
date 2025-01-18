module.exports = async () => {
    console.log('Iniciando limpieza de usernames...');
    
    // Encuentra todos los usuarios
    const users = await strapi.query('plugin::users-permissions.user').findMany();
  
    for (const user of users) {
      const trimmedUsername = user.username?.trim(); // Ajusta esto al campo problemático
      if (trimmedUsername !== user.username) {
        console.log(`Corrigiendo usuario: ${user.username} -> ${trimmedUsername}`);
        
        // Actualiza solo si hay un cambio
        await strapi.query('plugin::users-permissions.user').update({
          where: { id: user.id },
          data: { username: trimmedUsername },
        });
      }
    }
    
    console.log('Limpieza de usernames completada.');
  };
  