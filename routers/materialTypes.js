var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');

router.get('/:Client_ID/materialtype/', function(req, res, next) {
    dbConnection.query('SELECT * FROM MaterialTypes ', function(error,results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0 ) return res.status(404).send()
        return res.send(results)
    
    });
});

router.get('/:Client_ID/materialtype/:id', function (req, res, next) {
    dbConnection.query('SELECT * FROM MaterialTypes where id=?', req.params.id, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results);

    });
});

router.post('/:Client_ID/materialtype/', function (req, res) {
    console.error('IN 1');
    const schema = Joi.object().keys({
        MaterialType: Joi.string().trim().required(),
        MaterialTypeStatus: Joi.string().trim().required()
    })
    console.error('IN 2');
    Joi.validate(req.body, schema, (err, result) => {
        console.error('IN 3');
        if (err) {
            console.error(err);
            return res.status(400).send();
        }
        console.error('IN 4');
        dbConnection.query("INSERT INTO MaterialTypes SET ? ", req.body, function (error, results, fields) {
            console.error('IN 5');
            if (error) return next(error);
            console.error('IN 6');
            return res.status(201).send();
        });
    });

});

router.put('/:Client_ID/materialtype/', function (req, res) {
    let materialType = req.body;
  
    const schema = Joi.object().keys({
        ID: Joi.number().integer().positive().min(0).required(),
        MaterialType: Joi.string().trim().required(),
        MaterialTypeStatus: Joi.string().trim().required()
    })

    Joi.validate(materialType, schema, (err, result) => {

        if (err) {
            return res.status(400).send();
        }

        dbConnection.query("UPDATE MaterialTypes SET MaterialType = ?, MaterialTypeStatus = ?, Client_ID = ? WHERE ID = ?", [materialType.MaterialType, materialType.MaterialTypeStatus, materialType.Client_ID, materialType.ID], function (error, results, fields) {
            console.error('IN 6');
            if (error) return next(error);

            if (!results || results.affectedRows == 0) res.status(404).send();

            return res.send(results);
        });
    });
});

router.delete('/materialtype/:id', function (req, res) {

    dbConnection.query("DELETE FROM MaterialTypes  WHERE ID = ?", [req.params.id], function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);

    });
});

module.exports = router;