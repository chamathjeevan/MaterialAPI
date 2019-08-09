var express = require('express');
const router = express.Router();
var dbConnection = require('./database');
const Joi = require('@hapi/joi');

router.get('/:Client_ID/tradeagreement/', function(req, res,next) {
    
    dbConnection.query('SELECT * FROM TradeAgreements ' , function(error, results, fields){
        if (error) return next (error);
        if (!results|| results.length == 0) return res.status(404).send();
        return res.send(results)
    })
})

router.get('/:Client_ID/tradeagreement/:id', function(req, res,next) {

    dbConnection.query('SELECT * FROM TradeAgreements WHERE id=?', agreementType_ID, function(error, results, fields) {

        if (error) return next (error);
        if (!results|| results.length == 0) return res.status(404).send();
        return res.send(results)
    });

});

router.post('/:Client_ID/tradeagreement/', function(req, res,next) {
    let agreementType = req.body;

    if (!agreementType) {
        res.status(400).send({
            error: true,
            message: 'Please provide hs'
        });
        res.end();
        return
    }
    let userID = req.header('InitiatedBy')
    agreementType.CreatedBy = userID; 


    dbConnection.query("INSERT INTO TradeAgreements SET ? ", agreementType, function(error, results, fields) {
        if (error) {
            res.status(500).send(error);
        } else {

            if (!results || results.length == 0) {
                res.status(404).send({
                    error: false,
                    message: 'No records found'
                });
            } else {
                res.status(201).send({
                    error: false,
                    data: results,
                    message: 'New Trade Agreement Types has been created successfully.'
                });
            }
        }
        res.end();
        return
    });
});

router.put('/:Client_ID/tradeagreement/', function(req, res,next) {

    let agreementType = req.body;
    let ParentID = agreementType.ID;

    if (!agreementType) {
        res.status(400).send({
            error: true,
            message: 'Please provide HS'
        });
        res.end();
        return
    }

/* Begin transaction */
dbConnection.beginTransaction(function(err) {
    if (err) {
        throw err;
    }

    dbConnection.query("UPDATE TradeAgreements SET  IsActive = 0 WHERE ID = ? ", ParentID, function(error, results, fields) {
        if (error) {
            dbConnection.rollback(function() {

                res.status(500).send(error);
                res.end();
                return
            });
        }
        let userID = req.header('InitiatedBy')
       
        var copyAgreementType = {
            AgreementType: agreementType.AgreementType,
            ApplicableTariff: agreementType.ApplicableTariff,
            DocumentRef: agreementType.DocumentRef,
            IsActive: 1,
            Parent_ID: ParentID,
            CreatedBy:  userID
        }

        dbConnection.query("INSERT INTO TradeAgreements SET ? ", copyAgreementType, function(error, results, fields) {

            console.log(error);

            if (error) {
                dbConnection.rollback(function() {
                    res.status(500).send(error);
                    res.end();
                    return
                });
            }
            dbConnection.commit(function(err) {
                if (error) {
                    dbConnection.rollback(function() {
                        res.status(500).send(error);
                        res.end();
                        return
                    });
                }

                res.send({
                    error: false,
                    data: results,
                    message: 'Trade Agreement Types has been updated successfully.'
                });

                res.end();
                return
            });
        });
    });
});
/* End transaction */
    //-----------------------------------------------------------------
});

router.delete('//:Client_ID/tradeagreement/:id', function(req, res,next) {

    let agreementType_ID = req.params.id;

    if (!agreementType_ID) {
        res.status(400).send({
            error: true,
            message: 'Please provide HS id'
        });
        res.end();
        return
    }

    dbConnection.query("DELETE FROM TradeAgreements  WHERE ID = ?", [agreementType_ID], function(error, results, fields) {

        if (error) {
            res.status(500).send(error);
        } else {

            if (!results || results.length == 0) {
                res.status(404).send({
                    error: false,
                    message: 'No records found'
                });
            } else {
                res.send({
                    error: false,
                    data: results,
                    message: 'Material type has been deleted successfully.'
                });
            }
        }
        res.end();
        return
    });
});

module.exports = router;