var express = require('express');
const router = express.Router();
var dbConnection = require('./database');
const Joi = require('@hapi/joi');

router.get('/:Client_ID/tradeagreement/', function (req, res, next) {

    dbConnection.query('SELECT * FROM TradeAgreements Where Client_ID = ?', req.params.Client_ID, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send();

        return res.send(results)
    })
})

router.get('/:Client_ID/tradeagreement/:id', function (req, res, next) {

    dbConnection.query('SELECT * FROM TradeAgreements Where Client_ID = ? AND ID = ? ', [req.params.Client_ID, req.params.id], function (error, results, fields) {

        if (error) return next(error);
        if (!results || results.length == 0) return res.status(404).send();
        var tradeAgreement = { ID: results[0].ID,
                                Agreement: results[0].Agreement,
                                Description: results[0].Description,
                                Attachment: results[0].Attachment,
                                Countries: []
                                }
        dbConnection.query('SELECT TradeAgreementCountries.* FROM TradeAgreementCountries INNER JOIN TradeAgreements ON TradeAgreementCountries.TradeAgreement_ID = TradeAgreements.ID WHERE TradeAgreements.Client_ID = ? AND TradeAgreements.ID = ?', [req.params.Client_ID, req.params.id], function (error, countryResults, fields) {

            if (error) return next(error);
            if (!countryResults || countryResults.length == 0) return res.send(tradeAgreement);

            countryResults.forEach(extract);

            function extract(item, index) {
                tradeAgreement.Countries.push(item.Country_ID);
            }
            return res.send(tradeAgreement)
        })
    });

});

router.post('/:Client_ID/tradeagreement/', function (req, res, next) {

    var agreement = {
        Client_ID: Client_ID,
        Agreement: req.body.Agreement,
        Description: req.body.Description,
        IsActive: req.body.IsActive,
        Parent_ID: req.body.Parent_ID,
        CreatedBy: req.body.CreatedBy,
        CreatedTime: req.body.CreatedTime
    }


    if (!agreement) {
        return res.status(400).send({
            error: true,
            message: 'Please provide hs'
        });


    }
    let userID = req.header('InitiatedBy')
    let Client_ID = req.header('Client_ID')
    agreementType.CreatedBy = userID;

    let Client_ID = req.header('Client_ID')
    dbConnection.query("INSERT INTO TradeAgreements SET ? ", agreement, function (error, results, fields) {
        if (error) {
            res.status(500).send(error);
        } else {

            if (!results || results.length == 0) {
                res.status(404).send({
                    error: false,
                    message: 'No records found'
                });
            } else {

                var Agreement_ID = result.insertId

                for (var k = 0; k < req.body.Countries.length; k++) {

                    let country = {
                        TradeAgreement_ID: Agreement_ID,
                        Country_ID: req.body.Countries[k].Name
                    }

                    dbConnection.query("INSERT INTO TradeAgreementCountries SET ? ", country, function (error1, results, fields) {
                        if (error) {
                            console.error(error1);
                        }
                    });
                }
                return res.status(201).send({
                    error: false,
                    data: results,
                    message: 'New Trade Agreement Types has been created successfully.'
                });
            }
        }

    });
});

router.put('/:Client_ID/tradeagreement/', function (req, res, next) {

    let agreementType = req.body;
    let ParentID = req.body.ID;

    let hs = req.body;
    let Client_ID = req.header('Client_ID')
    let Countries = req.body.Countries;

    if (!agreementType) {
        res.status(400).send({
            error: true,
            message: 'Please provide HS'
        });
        res.end();
        return
    }

    /* Begin transaction */
    dbConnection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }

        dbConnection.query("UPDATE TradeAgreements SET  IsActive = 0 WHERE ID = ? ", ParentID, function (error, results, fields) {
            if (error) {
                dbConnection.rollback(function () {

                    return res.status(500).send(error);


                });
            }
            let userID = req.header('InitiatedBy')

            var copyAgreement = {
                Client_ID: Client_ID,
                Agreement: req.body.Agreement,
                Description: req.body.Description,
                IsActive: req.body.IsActive,
                Parent_ID: ParentID,
                CreatedBy: userID
            }

            dbConnection.query("INSERT INTO TradeAgreements SET ? ", copyAgreement, function (error, results, fields) {


                if (error) {
                    dbConnection.rollback(function () {
                        return res.status(500).send(error);
                    });
                }
                var Agreement_ID = results.insertId

                for (var k = 0; k < req.body.Countries.length; k++) {

                    let country = {
                        TradeAgreement_ID: Agreement_ID,
                        Country_ID: req.body.Countries[k].Name
                    }

                    dbConnection.query("INSERT INTO TradeAgreementCountries SET ? ", country, function (error1, results, fields) {
                        if (error) {
                            console.error(error1);
                        }
                    });
                }

                dbConnection.commit(function (err) {
                    if (error) {
                        dbConnection.rollback(function () {
                            return res.status(500).send(error);
                        });
                    }

                    return res.status(201).send({
                        error: false,
                        data: results,
                        message: 'New Trade Agreement Types has been created successfully.'
                    });

                });
            });
        });
    });
    /* End transaction */
    //-----------------------------------------------------------------
});

router.delete('//:Client_ID/tradeagreement/:id', function (req, res, next) {

    let agreementType_ID = req.params.id;

    if (!agreementType_ID) {
        res.status(400).send({
            error: true,
            message: 'Please provide HS id'
        });
        res.end();
        return
    }

    dbConnection.query("DELETE FROM TradeAgreements  WHERE ID = ?", [agreementType_ID], function (error, results, fields) {

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