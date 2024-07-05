module.exports = [
  "strapi::errors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  {
    name: "strapi::cors",
    config: {
      headers: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "Cache-Control",
        "Pragma",
      ],
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    },
  },
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "res.cloudinary.com",
            "cdn.jsdelivr.net",
            "strapi.io",
            "s3.amazonaws.com",
          ],
          "media-src": ["'self'", "data:", "blob:", "res.cloudinary.com"],
          "script-src": [
            "'self'",
            "editor.unlayer.com",
            "editor.unlayer.com/embed.js",
          ],
          "frame-src": ["'self'", "editor.unlayer.com"],
        },
      },
    },
  },
];
