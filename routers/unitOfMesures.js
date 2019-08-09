var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');

router.get('/:Client_ID/mesure/', function(req, res,next) {
    dbConnection.query('SELECT * FROM UnitOfMesures ' , function(error, results, fields){
        if (error) return next (error);
        if (!results|| results.length == 0 ) return res.status(404).send();
        return res.send(results)
    })
})

router.put ('/:Client_ID/mesure/', function(req, res, next){
    const schema = Joi.object().keys({
        Client_ID : Joi.string().alphanum().min(3).max(36).required()

    })

    Joi.validate(req.body, schema, (err, results) => {
        if (err){
            return res.status(400).send;
        }

        let mesure = req.body;
        dbConnection.querry("UPDATE BRIDGE.UnitOfMesures SET Client_ID = ?", [Materials.Client_ID] , function(error,results, fields) {
            if (error) return next.body;
            if (!results|| results.affetedRows ==0) res.status(404).send();
            return res.status(results);
        })
    })
})


router.get('/:Client_ID/mesure/:id', function (req, res, next) {

    dbConnection.query('SELECT * FROM UnitOfMesures where id=?', req.params.id, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results);

    });
});

router.post('/:Client_ID/mesure', function (req, res, next) {

    const schema = Joi.object().keys({
        Unit: Joi.string().trim().max(30).required(),
        Measure: Joi.string().trim().required()
    })

    Joi.validate(req.body, schema, (err, result) => {
        if (err) {
            return res.status(400).send();
        }
        dbConnection.query("INSERT INTO UnitOfMesures SET ? ", req.body, function (error, results, fields) {

            if (error) return next(error);

            return res.status(201).send();
        });
    });
});

router.delete('/:Client_ID/mesure/:id', function (req, res, next) {

    dbConnection.query("DELETE FROM UnitOfMesures WHERE ID =  ? ", [req.params.id], function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);

    });
});

module.exports = router;