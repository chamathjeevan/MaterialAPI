var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');

router.get('/:Client_ID/taxmap/', function(req, res, next) {
    
    dbConnection.query('SELECT * FROM BRIDGE.TaxMap WHERE Client_ID = ?', req.params.ClientID, function(error,results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0 ) return res.status(404).send()
        return res.send(results)
    
    });
});

const schema = Joi.object().keys({
    HsCode: Joi.string().alphanum().min(3).max(30).required(),
    ClientName: Joi.string().trim().required(),
    Priority: Joi.string().trim().required(),
    Client_ID: Joi.string().trim().min(3).max(30).required(),
})

router.get('/taxmap', function (req, res, next) {

    dbConnection.query('SELECT * FROM BRIDGE.TaxMap', function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results)
    });

});

router.get('/taxmap/:id', function (req, res, next) {

    dbConnection.query('SELECT * FROM BRIDGE.TaxMap where ID = ?', req.params.id, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results);

    });
});

router.post('/taxmap', function (req, res, next) {
    const schema = Joi.object().keys({
        HS_HsCode: Joi.string().trim().required(),
        UnitOfMeasure_ID: Joi.number().integer().positive().min(0).required(),
        AP: Joi.number().default(0),
        AD: Joi.number().default(0),
        BN: Joi.number().default(0),
        GT: Joi.number().default(0),
        IN: Joi.number().default(0),
        PK: Joi.number().default(0),
        SA: Joi.number().default(0),
        SF: Joi.number().default(0),
        SD: Joi.number().default(0),
        SG: Joi.number().default(0),
        GenDuty: Joi.number().default(0),
        GenDutyPerUnit: Joi.number().default(0),
        VAT: Joi.number().default(0),
        PAL: Joi.number().default(0),
        NBT: Joi.number().default(0),
        Cess: Joi.number().default(0),
        CessPerUnit: Joi.number().default(0),
        excise: Joi.number().default(0),
        scl: Joi.number().default(0),
        IsDeleted: Joi.boolean(),
        IsActive: Joi.boolean(),
        IsDeleted: Joi.boolean(),
        Parent_ID: Joi.string().allow(null),
        Client_ID: Joi.string().trim().required(),
        CreatedBy: Joi.string().trim().required(),
        CreatedTime: Joi.date()
        
    
    })

    Joi.validate(req.body, schema, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(400).send();
        }
        let TaxMap = req.body;
        dbConnection.query("INSERT INTO BRIDGE.TaxMap  SET ID = uuid(), ? ", req.body, function (error, results, fields) {

            if (error) return next(error);

            return res.status(201).send();
        });
});

router.put('/taxmap', function (req, res) {
    const schema = Joi.object().keys({
        ID: Joi.string().trim().required(),
        HS_HsCode: Joi.string().trim().required(),
        UnitOfMeasure_ID: Joi.number().integer().positive().min(0).required(),
        AP: Joi.number().default(0),
        AD: Joi.number().default(0),
        BN: Joi.number().default(0),
        GT: Joi.number().default(0),
        IN: Joi.number().default(0),
        PK: Joi.number().default(0),
        SA: Joi.number().default(0),
        SF: Joi.number().default(0),
        SD: Joi.number().default(0),
        SG: Joi.number().default(0),
        GenDuty: Joi.number().default(0),
        GenDutyPerUnit: Joi.number().default(0),
        VAT: Joi.number().default(0),
        PAL: Joi.number().default(0),
        NBT: Joi.number().default(0),
        Cess: Joi.number().default(0),
        CessPerUnit: Joi.number().default(0),
        excise: Joi.number().default(0),
        scl: Joi.number().default(0),
        IsDeleted: Joi.boolean(),
        IsActive: Joi.boolean(),
        IsDeleted: Joi.boolean(),
        Parent_ID: Joi.string().allow(null),
        Client_ID: Joi.string().trim().required(),
        CreatedBy: Joi.string().trim().required(),
        CreatedTime: Joi.date(),
        
    })
    })

    Joi.validate(req.body, schema, (err, result) => {

        if (err) {
            return res.status(400).send();
        }

        let taxMap = req.body;
        let ParentID = taxMap.ID;

        let copyTaxMap = {
            HS_HsCode: taxMap.HS_HsCode,
            UnitOfMeasure_ID: taxMap.UnitOfMeasure_ID,
            AP: taxMap.AP,
            AD: taxMap.AD,
            BN: taxMap.BN,
            GT: taxMap.GT,
            IN: taxMap.IN,
            PK: taxMap.PK,
            SA: taxMap.SA,
            SF: taxMap.SF,
            SD: taxMap.SD,
            SG: taxMap.SG,
            GenDuty: taxMap.GenDuty,
            GenDutyPerUnit: taxMap.GenDutyPerUnit,
            VAT: taxMap.VAT,
            PAL: taxMap.PAL,
            NBT: taxMap.NBT,
            Cess: taxMap.Cess,
            CessPerUnit: taxMap.CessPerUnit,
            excise: taxMap.excise,
            scl: taxMap.scl,
            IsDeleted: taxMap.IsDeleted,
            IsActive: taxMap.IsActive,
            Parent_ID: ParentID,
            Client_ID: taxMap.Client_ID,
            CreatedBy: taxMap.CreatedBy
        }

        /* Begin transaction */
        dbConnection.beginTransaction(function (err) {
            if (err) {
                throw err;
            }

            dbConnection.query("UPDATE BRIDGE.TaxMap  SET  IsActive = 0 WHERE ID = ? ", ParentID, function (error, results, fields) {
                if (error) {
                    dbConnection.rollback(function () {
                        res.status(500).send(error);
                        res.end();
                        return
                    });
                }

                let userID = req.header('InitiatedBy')

                dbConnection.query("INSERT INTO BRIDGE.TaxMap  SET ID = uuid(), ? ", copyTaxMap, function (error, results, fields) {

                    if (error) {
                        dbConnection.rollback(function () {
                            res.status(500).send(error);
                            res.end();
                            return
                        });
                    }
                    dbConnection.commit(function (err) {

                        if (error) {
                            dbConnection.rollback(function () {
                                res.status(500).send(error);
                                res.end();
                                return
                            });
                        }

                        res.send({
                            error: false,
                            data: results,
                            message: 'Tax map has been updated successfully.'
                        });

                        res.end();
                        return
                    });
                });
            });
        });
       
        /* End transaction */
    });
});

router.delete('/taxmap/:id', function (req, res, next) {

    dbConnection.query("DELETE FROM BRIDGE.TaxMap WHERE ID =  ? ", req.params.id, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);

    });
});

module.exports = router;