var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');

router.get('/:Client_ID/supplier/', function(req, res, next) {
     dbConnection.query('SELECT * FROM Supplier WHERE Client_ID = ?',req.params.Client_ID, function(error,results, fields) {
        console.error('--------+>' + error);
        if (error) return next(error);
        console.error('--------+> results.length' + results.length);
        if (!results || results.length == 0 ) return res.status(404).send()
        return res.send(results)
    
    });
});

router.get('/:Client_ID/supplier/:id', function (req, res, next) {

    dbConnection.query('SELECT * FROM Supplier WHERE Client_ID = ? AND ID = ?',[req.params.Client_ID,req.params.id], function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results);

    });
});

router.post('/:Client_ID/supplier', function (req, res, next) {

    const schema = Joi.object().keys({
        NearestSeaPort: Joi.string().trim().max(60).required(),
        NearestAirport: Joi.string().trim().max(60).required(),
        SeaFreightTransitTime: Joi.number().integer().min(0),
        AirFreightTransitTime: Joi.number().integer().min(0),
        Website: Joi.string().trim().max(100).required(),
        LinkCatalouges: Joi.string().trim().max(100).required(),
        Client_ID : Joi.string().trim().min(3).max(30).required(),

    })

    Joi.validate(req.body, schema, (err, result) => {
       
        if (err) {
            return res.status(400).send();
        }

        dbConnection.query("INSERT INTO Supplier SET ? ", req.body, function (error, results, fields) {

            if (error) return next(error);

            return res.status(201).send();
        });
    });
});

router.put('/:Client_ID/supplier', function (req, res) {

    const schema = Joi.object().keys({
        ID: Joi.number().integer().positive().min(0).required(),
        NearestSeaPort: Joi.string().trim().max(60).required(),
        NearestAirport: Joi.string().trim().max(60).required(),
        SeaFreightTransitTime: Joi.number().integer().min(0),
        AirFreightTransitTime: Joi.number().integer().min(0),
        Website: Joi.string().trim().max(100).required(),
        LinkCatalouges: Joi.string().trim().max(100).required(),
        Clinet_ID : Joi.string().trim().min(3).max(30).required() 
    })
    let Supplier = req.body;
    Joi.validate(Supplier, schema, (err, result) => {
        console.error(err)
        if (err) {
            return res.status(400).send();
        }
        
        dbConnection.query("UPDATE Supplier SET NearestSeaPort = ?, NearestAirport = ?, SeaFreightTransitTime = ?, AirFreightTransitTime = ?, Website = ?, LinkCatalouges = ?, Clinet_ID = ? WHERE ID = ?", [Supplier.NearestSeaPort, Supplier.NearestAirport, Supplier.SeaFreightTransitTime, Supplier.AirFreightTransitTime, Supplier.Website, Supplier.LinkCatalouges, Supplier.ID, Supplier.Client_ID], function (error, results, fields) {

            if (error) return next(error);

            if (!results || results.affectedRows == 0) res.status(404).send();

            return res.send(results);
        });
    });
});

router.delete('/:Client_ID/supplier/:id', function (req, res, next) {

    dbConnection.query("DELETE FROM Supplier  WHERE ID = ?", [Supplier_ID], function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);
    });
});

module.exports = router;