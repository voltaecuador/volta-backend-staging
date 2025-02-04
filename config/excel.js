module.exports = {
  config: {
    "api::purchased-ride-pack.purchased-ride-pack": {
      columns: [
        "fechaCompra",
        "valor",
        "tipo",
        "clasesOriginales",
        "transactionId"
      ],
      relation: {
        user: {
          column: ["nombre", "apellido", "email", "cedula", "direccion", "telefono"]
        },
      },
      locale: "false"
    }
  }
}; 