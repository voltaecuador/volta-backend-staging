module.exports = (plugin) => {
    const sanitizeUser = (user) => {
      if (user.username) {
        user.username = user.username.trim();
      }
      return user;
    };

  
    // Interceptar la creación de usuarios
    const originalRegister = plugin.controllers.auth.register;
    plugin.controllers.auth.register = async (ctx) => {
      if (ctx.request.body) {
        ctx.request.body = sanitizeUser(ctx.request.body);
      }
      
      // Llamar al controlador original de registro
      const response = await originalRegister.call(plugin.controllers.auth, ctx);
      return response;
    };   
   return plugin;
  };