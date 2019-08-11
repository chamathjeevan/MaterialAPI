var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');

router.get('/:Client_ID/hs/', function(req, res, next) {

    dbConnection.query('SELECT * FROM HsCodes WHERE Client_ID = ?',req.params.Client_ID , function(error, results, fields){
        if (error) return next (error);
        if (!results|| results.length==0) return res.status(404).send();
        return res.send(results)
    })
})

router.get('/:Client_ID/hs/:id', function(req, res, next) {

    dbConnection.query('SELECT * FROM HsCodes WHERE Client_ID = ? AND HsCode = ? ',[req.params.Client_ID,req.params.id], function(error, results, fields){
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
        dbConnection.querry("UPDATE HsCodes SET Client_ID = ?", [Hs.Client_ID] , function(error,results, fields) {

            if (error) return next.body;
            if (!results|| results.affetedRows ==0) res.status(404).send();
            return res.status(results);

        })
    })
})

router.post('/:Client_ID/hs/', function(req,res){
   const schema = Joi.object().keys({
            HsCode: Joi.string(),
            Description: Joi.string().required(),
            Unit:  Joi.string().required(),
            GenDuty: Joi.number(),
            VAT: Joi.number(),
            PAL: Joi.number(),
            NTB: Joi.number(),
            Cess: Joi.number(),
            Excise: Joi.number(),
            SCL: Joi.number(),
            MType:Joi.number()
    })

    Joi.validate(req.body, schema, (err, result)=> {
        if (err){
            console.error('ERROR ==> '  + err);
            return res.status(400).send();
        }
         
        let hs = req.body;
        let userID = req.header('InitiatedBy')
        let clientID = req.header('Client_ID')

        let hsCodeObj = {
            HsCode: hs.HsCode,
            Client_ID:clientID,
            Description: hs.Description,
            Unit: hs.Unit,
            GenDuty: hs.GenDuty,
            VAT: hs.VAT,
            PAL: hs.PAL,
            NTB: hs.NTB,
            Cess: hs.Cess,
            Excise: hs.Excise,
            SCL: hs.SCL,
            MType:hs.MType
        }
        dbConnection.query("INSERT INTO HsCodes SET ? ", hsCodeObj, function(error, results, fields) {
            if (error) {
                console.error(error);
                res.status(500).send(error);
            } else {
                if (!results || results.length == 0) {
                    res.status(404).send();
                } else {
                    res.status(201).send({
                        error: false,
                        data: results,
                        message: 'New regulatory approval has been created successfully.'
                    });
                }
            }
            res.end();
            return
        });
    })
})


const schema = Joi.object().keys({
    HsCode: Joi.string().alphanum().min(3).max(30).required()
   
})


router.delete('/:Client_ID/hs/:id', function (req, res, next) {

    dbConnection.query('DELETE FROM HsCodes WHERE Client_ID = ? AND HsCode = ? ',[req.params.Client_ID,req.params.Client_ID], function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);

    });
});

module.exports = router;