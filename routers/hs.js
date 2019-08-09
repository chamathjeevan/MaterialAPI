var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');

router.get('/:Client_ID/hs/', function(req, res, next) {

    dbConnection.query('SELECT * FROM BRIDGE.Hs' , function(error, results, fields){
        if (error) return next (error);
        if (!results|| results.length==0) return res.status(404).send();
        return res.send(results)
    })
})

router.put ('/:Client_ID/hs/',function(req, res, next){
    const schema = Joi.object().keys({
        Client_ID : Joi.string().alphanum().min(3).max(36).required()

    })

    Joi.validate(req.body, schema, (err, results) => {
        if (err){
            return res.status(400).send;

        }

        let hs = req.body;
        dbConnection.querry("UPDATE BRIDGE.Hs SET Client_ID = ?", [Hs.Client_ID] , function(error,results, fields) {

            if (error) return next.body;
            if (!results|| results.affetedRows ==0) res.status(404).send();
            return res.status(results);

        })
    })
})

router.post('/Client_ID/hs/', function(req,res){
    const schema = Joi.object().keys({
        Client_ID: Joi.string().alphanum().min(3).max(30).required(),
        Description:  Joi.string().alphanum().min(3).max(30).required()
    })

    Joi.validate(req.body, schema, (err, result)=> {
        if (err){
            return res.status(400).send();

        }
         
        let hs = req.body;
        dbConnection.query("INSERT INTO BRIDGE.Hs SET ID = Client_ID = ?". req.body, function(error, results, fields){
            if (error) return next(error);
            return res.status(404).send();
        })
    })
})



const schema = Joi.object().keys({
    HsCode: Joi.string().alphanum().min(3).max(30).required(),
    ClientName: Joi.string().trim().required(),
    Priority: Joi.string().trim().required()
})

router.get('/hs', function (req, res, next) {

    dbConnection.query('SELECT * FROM BRIDGE.Hs', function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results)
    });

});

router.get('/hs/:id', function (req, res, next) {

    let Hs_ID = req.params.id;

    dbConnection.query('SELECT * FROM BRIDGE.Hs where HsCode = ?', Hs_ID, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results);

    });
});

router.post('/hs', function (req, res, next) {

    Joi.validate(req.body, schema, (err, result) => {
        if (err) {
            return res.status(400).send();
        }

        dbConnection.query("INSERT INTO BRIDGE.Hs SET ? ", req.body, function (error, results, fields) {

            if (error) return next(error);

            return res.status(201).send();
        });
    });
});

router.put('/hs', function (req, res) {

    Joi.validate(req.body, schema, (err, result) => {
        if (err) {
            return res.status(400).send();
        }
        let hs = req.body;
        dbConnection.query("UPDATE BRIDGE.Hs SET ClientName = ?, Priority = ? WHERE HsCode = ? ", [hs.ClientName, hs.Priority, hs.HsCode], function (error, results, fields) {

            if (error) return next(error);

            if (!results || results.affectedRows == 0) res.status(404).send();

            return res.send(results);
        });
    });
});

router.delete('/hs/:HsCode', function (req, res, next) {

    dbConnection.query("DELETE FROM BRIDGE.Hs WHERE HsCode =  ? ", req.params.HsCode, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);

    });
});

module.exports = router;