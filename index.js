const fs = require('fs');
const path = require('path');
const util = require('util');
const xml2js = require('xml2js');
const parse = util.promisify(new xml2js.Parser().parseString);
const read = util.promisify(fs.readFile);
const Table = require('cli-table');

let filePromises = []; 
let grandTotal = 0;

var table = new Table({
    head: ['Fecha', 'F.Pago', 'L.Expedicion', 'MetodoPago', 'Moneda',
            'Subtotal', 'Descuento','Total']
  , colWidths: [22, 8, 10, 10, 10, 10, 12, 12]
});

// const CWD = process.cwd();
const opendirstr = (function (args){
    if(args.length == 0)
        return false;

    if(fs.existsSync(args[0]))
        return args[0] + "/";

    return path.dirname(process.argv[1]) + "/" + args[0] + "/";
})(process.argv.slice(2));

if(opendirstr === false){
    console.log("Usage:  " + process.argv.join(" ") + " directorio");
    process.exit(0);
}

fs.readdir(opendirstr, (err, files) => {
    files.filter(file => file.endsWith('xml')).forEach(file => {
        filePromises.push(
            read(opendirstr + "/" + file)
            .then((data) => {
                    return parse(data); 
                })
            .then((result) => {
                const f = result['cfdi:Comprobante']['$'];
                const data = [
                    f.Fecha,
                    f.FormaPago,
                    f.LugarExpedicion,
                    f.MetodoPago,
                    f.Moneda,
                    f.SubTotal,
                    f.Descuento,
                    f.Total
                ];
                grandTotal += parseFloat(f.Total);
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