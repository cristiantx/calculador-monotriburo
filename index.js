const fs = require("fs");
const util = require("util");
const xml2js = require("xml2js");
const parse = util.promisify(new xml2js.Parser().parseString);
const read = util.promisify(fs.readFile);
const Table = require("cli-table");
const createCSVFile = require("csv-file-creator");

let facturas = [];
let filePromises = [];
let grandTotal = 0;
let dataCsv = [];

var table = new Table({
  head: ["Fecha", "Monto", "Cambio", "Total"],
  colWidths: [20, 20, 20, 20],
});

fs.readdir("./facturas", (err, files) => {
  files
    .filter((file) => file.endsWith("xml"))
    .forEach((file) => {
      filePromises.push(
        read(__dirname + "/facturas/" + file)
          .then((data) => {
            return parse(data);
          })
          .then((result) => {
            const f = result.comprobante;
            console.log("[debug]", f);

            const tipoCambio =
              f.tipocambio && f.tipocambio[0] ? f.tipocambio[0] : 1;
            const data = [
              f.fechaemision[0],
              f.importetotal[0],
              tipoCambio,
              f.importetotal[0] * tipoCambio,
            ];
            dataCsv.push(data);
            grandTotal = grandTotal + f.importetotal[0] * tipoCambio;
            table.push(data);
            return true;
          })
      );
    });
  Promise.all(filePromises).then(() => {
    createCSVFile("facturacion-monotributo.csv", dataCsv);

    console.log(
      table
        .sort((a, b) => {
          if (new Date(a[0]) > new Date(b[0])) {
            return 1;
          } else {
            return -1;
          }
        })
        .toString()
    );
    console.log("\nTotal Facturado: $" + grandTotal);
  });
});
