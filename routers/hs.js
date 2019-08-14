var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');

router.get('/:Client_ID/hs/', function (req, res, next) {

    dbConnection.query('SELECT * FROM HsCodes WHERE Client_ID = ?', req.params.Client_ID, function (error, results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0) return res.status(404).send();
        return res.send(results)
    })
})

router.get('/:Client_ID/hs/:id', function (req, res, next) {

    dbConnection.query('SELECT * FROM HsCodes WHERE Client_ID = ? AND HsCode = ? ', [req.params.Client_ID, req.params.id], function (error, results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0) return res.status(404).send();

        var hsCode = {
            HsCode: results[0].HsCode,
            Description: results[0].Description,
            Unit: results[0].Unit,
            GenDuty: results[0].GenDuty,
            VAT: results[0].VAT,
            PAL: results[0].PAL,
            NTB: results[0].NTB,
            Cess: results[0].Cess,
            Excise: results[0].Excise,
            SCL: results[0].SCL,
            MType: results[0].MType,
            Countries: []
        }

        dbConnection.query('SELECT HsCountries.Country FROM HsCountries INNER JOIN HsCodes ON HsCountries.HsCode = HsCodes.HsCode WHERE HsCodes.Client_ID = ? AND HsCodes.HsCode = ?', [req.params.Client_ID, req.params.id], function (error, countryResults, fields) {
            if (error) return next(error);
            if (!countryResults || countryResults.length == 0) return res.send(hsCode);
 
            countryResults.forEach(extract);

            function extract(item, index) {
                hsCode.Countries.push(item.Country);
            }

            return res.send(hsCode)
        })
    })
})

router.put('/:Client_ID/hs/', function (req, res, next) {

    const schema = Joi.object().keys({
        HsCode: Joi.string(),
        Description: Joi.string().required(),
        Unit: Joi.string().required(),
        GenDuty: Joi.number(),
        VAT: Joi.number(),
        PAL: Joi.number(),
        NTB: Joi.number(),
        Cess: Joi.number(),
        Excise: Joi.number(),
        SCL: Joi.number(),
        MType: Joi.number(),
        Countries: Joi.array().items(Joi.string())
    })

    Joi.validate(req.body, schema, (err, results) => {
        if (err) {
            return res.status(400).send;
        }
        let hs = req.body;
        let userID = req.header('InitiatedBy')
        let Client_ID = req.header('Client_ID')
        let Countries = req.body.Countries;

        dbConnection.query("UPDATE HsCodes SET Description = ? , Unit = ? , GenDuty = ? , VAT = ? , PAL = ? , NTB = ? , Cess = ? ,Excise = ? ,SCL = ? , MType = ? , CreatedBy = ? WHERE HsCode = ? AND Client_ID = ? ", [hs.Description, hs.Unit, hs.GenDuty, hs.VAT, hs.PAL, hs.NTB, hs.Cess, hs.Excise, hs.SCL, hs.MType, userID, hs.HsCode, Client_ID], function (error, results, fields) {

            if (error) return next(error);

            if (!results || results.affectedRows == 0) return res.status(404).send();

            dbConnection.query("UPDATE HsCountries SET IsActive = 0  WHERE HsCode = ? AND Client_ID = ?", [hs.HsCode, Client_ID], function (error, results, fields) {
                if (error) {
                    console.error(error);
                }
            });

            Countries.forEach(insert);
            function insert(item, index) {
                let country = {
                    HsCode: hs.HsCode,
                    Client_ID: Client_ID,
                    Country: item
                }

                dbConnection.query("INSERT INTO HsCountries SET ? ", country, function (error, results, fields) {
                    if (error) {
                        console.error(error);
                    }
                });
            }
            return res.send(results);
        });

        return res.status(400).send;
    });
})

router.post('/:Client_ID/hs/', function (req, res) {

    const schema = Joi.object().keys({
        HsCode: Joi.string(),
        Description: Joi.string().required(),
        Unit: Joi.string().required(),
        GenDuty: Joi.number(),
        VAT: Joi.number(),
        PAL: Joi.number(),
        NTB: Joi.number(),
        Cess: Joi.number(),
        Excise: Joi.number(),
        SCL: Joi.number(),
        MType: Joi.number(),
        Countries: Joi.array().items(Joi.string())
    })

    Joi.validate(req.body, schema, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(400).send();
        }

        let hs = req.body;
        let userID = req.header('InitiatedBy')
        let clientID = req.header('Client_ID')
        let Countries = req.body.Countries;
        let hsCodeObj = {
            HsCode: hs.HsCode,
            Client_ID: clientID,
            Description: hs.Description,
            Unit: hs.Unit,
            GenDuty: hs.GenDuty,
            VAT: hs.VAT,
            PAL: hs.PAL,
            NTB: hs.NTB,
            Cess: hs.Cess,
            Excise: hs.Excise,
            SCL: hs.SCL,
            MType: hs.MType,
            CreatedBy: userID
        }

        dbConnection.query("INSERT INTO HsCodes SET ? ", hsCodeObj, function (error, results, fields) {
            if (error) {
                console.error(error);
                res.status(500).send(error);
            } else {
                if (!results || results.length == 0) {
                    res.status(404).send();
                } else {

                    Countries.forEach(insert);

                    function insert(item, index) {
                        let country = {
                            HsCode: hsCodeObj.HsCode,
                            Client_ID: hsCodeObj.Client_ID,
                            Country: item
                        }

                        dbConnection.query("INSERT INTO HsCountries SET ? ", country, function (error, results, fields) {
                            if (error) {
                                console.error(error);
                            }
                        });
                    }

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
    dbConnection.query('DELETE FROM HsCodes WHERE Client_ID = ? AND HsCode = ? ', [req.params.Client_ID, req.params.Client_ID], function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);

    });
});

module.exports = router;