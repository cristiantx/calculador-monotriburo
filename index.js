const fs = require('fs');
const util = require('util');
const xml2js = require('xml2js');
const parse = util.promisify(new xml2js.Parser().parseString);
const read = util.promisify(fs.readFile);
const Table = require('cli-table');

let facturas = [];
let filePromises = []; 
let grandTotal = 0;

var table = new Table({
    head: ['Fecha', 'Monto', 'Cambio', 'Total']
  , colWidths: [20, 20, 20, 20]
});

fs.readdir('./facturas2', (err, files) => {
    files.filter(file => file.endsWith('xml')).forEach(file => {
        filePromises.push(
            read(__dirname + '/facturas2/' + file)
            .then((data) => {
                    return parse(data); 
                })
            .then((result) => {
// console.log(result);
                const f = result['cfdi:Comprobante']['$'];
                const data = [
                    f.Fecha,
                    f.Total,
1,
                    f.Moneda
//                    f.importetotal[0] * f.tipocambio[0]
                ];
//                grandTotal = grandTotal + f.importetotal[0] * f.tipocambio[0];
                table.push(data);
                return true;
            })
        );
    });
    Promise.all(filePromises).then(() => {
        console.log(table.toString());
        console.log("\nTotal Facturado: $"+grandTotal);
    });
})