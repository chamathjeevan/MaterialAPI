var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');
const { HTTP_STATUS } = require('./constents');

const schema = Joi.object().keys({
    ID: Joi.number().integer().required(),
    Client_ID: Joi.string().max(36).required(),
    MaterialType: Joi.string().max(60).required(),
    MaterialTypeStatus: Joi.string().max(30).required()
})

router.get('/:Client_ID/materialtype/', function(req, res, next) {
    dbConnection.query('SELECT * FROM MaterialTypes WHERE Client_ID = ?',req.params.Client_ID, function(error,results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0) return res.status(HTTP_STATUS.NOT_FOUND).send();
        return res.send(results)
    })
});

router.get('/:Client_ID/materialtype/:id', function (req, res, next) {
    dbConnection.query('SELECT * FROM MaterialTypes WHERE id=? AND Client_ID = ?', [req.params.id,req.params.Client_ID], function (error, results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0) return res.status(HTTP_STATUS.NOT_FOUND).send()

        return res.send(results[0]);
    });
});

router.post('/:Client_ID/materialtype/', function (req, res,next) {

    if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();

    req.body.ID = 0;

    Joi.validate(req.body, schema, (err, result) => {
        
        if (err) return res.status(HTTP_STATUS.BAD_REQUEST).send(err);

        var materialType = {
            ID: null,
            MaterialType: req.body.MaterialType,
            MaterialTypeStatus: req.body.MaterialTypeStatus
        }

        dbConnection.query("INSERT INTO MaterialTypes SET ? ", materialType, function (error, results, fields) {

            if (error) return next(error);

            return res.status(HTTP_STATUS.CREATED).send({ error: false, data: result.insertId, message: result.insertId })
        });
    });

});

router.put('/:Client_ID/materialtype/', function (req, res,next) {

    if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();

    Joi.validate(req.body, schema, (err, result) => {
        
        if (err) return res.status(HTTP_STATUS.BAD_REQUEST).send(err);

        var materialType = {
            ID: req.body.ID,
            MaterialType: req.body.MaterialType,
            MaterialTypeStatus: req.body.MaterialTypeStatus
        }

        dbConnection.query("UPDATE MaterialTypes SET MaterialType = ?, MaterialTypeStatus = ? WHERE ID = ? AND Client_ID = ?", [materialType.MaterialType, materialType.MaterialTypeStatus, materialType.ID,materialType.Client_ID], function (error, results, fields) {
 
            if (error) return next(error);

            if (!results || results.affectedRows == 0) res.status(HTTP_STATUS.NOT_FOUND).send();

            return res.send(results);
        });
    });
});

router.delete('/materialtype/:id', function (req, res) {

    dbConnection.query("DELETE FROM MaterialTypes  WHERE ID = ? AND Client_ID = ? ", [req.params.id,req.params.Client_ID], function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) res.status(HTTP_STATUS.NOT_FOUND).send();

        return res.send(results);
    });
});

module.exports = router;