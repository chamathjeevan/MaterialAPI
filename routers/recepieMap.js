var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');

router.get('/:Client_ID/recepiemap', function (req, res, next) {


    dbConnection.query('SELECT * FROM BRIDGE.RecepieMap WHERE Client_ID = ?',req.params.ClientID, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results)
    });

});

router.get('/recepiemap/:id', function (req, res, next) {

    dbConnection.query('SELECT * FROM BRIDGE.RecepieMap where ID = ?', req.params.id, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results);

    });
});

router.post('/:Client_ID/recepiemap', function (req, res, next) {

    const schema = Joi.object().keys({
        Materials_ID: Joi.string().trim().required(),
        HsCodeOfRawItem : Joi.string().trim().required(),
        Client_ID: Joi.string().alphanum().min(3).max(36).required()
    })

    Joi.validate(req.body, schema, (err, result) => {
        if (err) {
            return res.status(400).send();
        }

        dbConnection.query("INSERT INTO BRIDGE.RecepieMap  SET ID = uuid(), ? ", req.body, function (error, results, fields) {

            if (error) return next(error);

            return res.status(201).send();
        });
    });
});

router.put('/:Client_ID/recepiemap', function (req, res,next) {

    const schema = Joi.object().keys({
        ID: Joi.number().integer().positive().min(0).required(),
        Materials_ID: Joi.string().trim().required(),
        HsCodeOfRawItem : Joi.string().trim().required(),
        Client_ID: Joi.string().alphanum().min(3).max(36).required()
    })

    Joi.validate(req.body, schema, (err, result) => {
        if (err) {
            return res.status(400).send();
        }
        let RecepieMap = req.body;
        dbConnection.query("UPDATE BRIDGE.RecepieMap SET Materials_ID = ?, HsCodeOfRawItem = ?, Client_ID = ? WHERE ID = ? ", [RecepieMap.Materials_ID, RecepieMap.HsCodeOfRawItem ,RecepieMap.Client_ID, RecepieMap.ID], function (error, results, fields) {

            if (error) return next(error);

            if (!results || results.affectedRows == 0) res.status(404).send();

            return res.send(results);
        });
    });
});

router.delete('/recepiemap/:id', function (req, res, next) {

    dbConnection.query("DELETE FROM BRIDGE.RecepieMap WHERE ID =  ? ", req.params.id, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);

    });
});

module.exports = router;