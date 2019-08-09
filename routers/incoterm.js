var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');


router.get('/:Client_ID/incoterm/', function(req, res) {
    
    dbConnection.query('SELECT * FROM BRIDGE.Incoterms WHERE Client_ID = ?' .req.params.Client_ID, function(error, results, fields){
        if (error) return next (error);
        if (!results|| results.length) return res.status(404).send();
        return res.send(results)
    })
})

router.put ('/:Client_ID/incoterm/', function(req, res, next){
    const schema = Joi.object().keys({
        Client_ID : Joi.string().alphanum().min(3).max(36).required()

    })

    Joi.validate(req.body, schema, (err, results) => {
        if (err){
            return res.status(400).send;

        }

        let incoterm = req.body;
        dbConnection.querry("UPDATE BRIDGE.Incoterms SET Client_ID = ?", [Incoterms.Client_ID] , function(error,results, fields) {

            if (error) return next.body;
            if (!results|| results.affetedRows ==0) res.status(404).send();
            return res.status(results);

        })
    })
})

router.post('/:Client_ID/incoterm/', function(req,res){
    const schema = Joi.object().keys({
        Client_ID: Joi.string().alphanum().min(3).max(30).required() 
    })

    Joi.validate(req.body, schema, (err, result)=> {
        if (err){
            return res.status(400).send();

        }
         
        let incoterm = req.body;
        dbConnection.query("INSERT INTO BRIDGE.Incoterms SET ID = Client_ID = ?". req.body, function(error, results, fields){
            if (error) return next(error);
            return res.status(404).send();
        })
    })
})

router.get('/incoterm', function(req, res, next) {

    dbConnection.query('SELECT * FROM BRIDGE.Incoterms WHERE Status = 1 ', function(error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results)
    });
});

router.get('/incoterm/:id', function(req, res, next) {

    let incoterm_id = req.params.id;

    dbConnection.query('SELECT * FROM BRIDGE.Incoterms where Status = 1 and ID = ?', incoterm_id, function(error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results);

    });
});

router.post('/incoterm', function(req, res, next) {

    const schema = Joi.object().keys({
        Incorterm: Joi.string().min(3).max(30).required(),
        Description: Joi.string().trim().max(60),
        Status: Joi.number().integer().min(0).max(9).required()
    })

    Joi.validate(req.body, schema, (err, result) => {

        console.error(err);

        if (err) {
            return res.status(400).send();
        }
        dbConnection.query("INSERT INTO BRIDGE.Incoterms SET ID = uuid(), ? ", req.body, function(error, results, fields) {

            if (error) return next(error);

            return res.status(201).send();
        });
    });
});

router.put('/incoterm', function(req, res) {

    let incoterm = req.body;

    const schema = Joi.object().keys({
        ID: Joi.string().trim().required(),
        Incorterm: Joi.string().min(3).max(30).required(),
        Description: Joi.string().trim().max(60),
        Status: Joi.number().integer().min(0).max(9)
    })

    Joi.validate(incoterm, schema, (err, result) => {

        if (err) {
            return res.status(400).send();
        }

        dbConnection.query("UPDATE BRIDGE.Incoterms SET Incorterm = ?, Description = ?, Status = ? WHERE ID = ?", [incoterm.Incorterm, incoterm.Description, incoterm.Status, incoterm.ID], function(error, results, fields) {

            if (error) return next(error);

            if (!results || results.affectedRows == 0) return res.status(404).send();

            return res.send(results);
        });
    });
});

router.delete('/incoterm/:id', function(req, res, next) {

    dbConnection.query("UPDATE BRIDGE.Incoterms SET Status = 0  WHERE ID = ?", req.params.id, function(error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);
    });
});

module.exports = router;