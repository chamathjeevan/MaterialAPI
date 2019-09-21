var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');


router.get('/:Client_ID/incoterm/', function (req, res, next) {

    dbConnection.query('SELECT * FROM Incoterms WHERE Client_ID = ?', [req.params.Client_ID], function (error, results, fields) {
        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send();

        return res.send(results);
    })
})


router.get('/:Client_ID/incoterm/:id', function (req, res, next) {

    dbConnection.query('SELECT * FROM Incoterms where Client_ID = ? AND ID = ?', [req.params.Client_ID, req.params.id], function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

        return res.send(results[0]);

    });
});

router.put('/:Client_ID/incoterm/', function (req, res, next) {
    const schema = Joi.object().keys({
        Client_ID: Joi.string().min(3).max(37).required(),
        ID: Joi.string().min(3).max(37).required(),
        Incoterm: Joi.string().required(),
        Description:  Joi.string().required(),
        Freight:  Joi.string().required(),
        Insurance:  Joi.string().required(),
        Status:  Joi.string().required(),
        Created_By:  Joi.string().allow(null)
    })

    let userID = req.header('InitiatedBy')
        let ClientID = req.header('Client_ID')

        var intercom = {
            ID: req.body.ID,
            Incoterm: req.body.Incorterm,
            Description: req.body.Description,
            Freight: req.body.Freight,
            Insurance: req.body.Insurance,
            Status: req.body.Status,
            Client_ID: ClientID,
            Created_By: userID
        }

    Joi.validate(intercom, schema, (err, results) => {
        if (err) {
            return res.status(400).send;
        }

        
        dbConnection.querry("UPDATE Incoterms SET ?", intercom, function (error, results, fields) {

            if (error) return next(error);
            if (!results || results.affetedRows == 0) res.status(404).send();
            return res.status(200).status(results);

        })
    })
})

router.post('/:Client_ID/incoterm/', function (req, res) {
console.error('-----> 1');
    const schema = Joi.object().keys({
        Client_ID: Joi.string().min(3).max(37).required(),
        ID: Joi.string().min(3).max(37).allow(null),
        Incoterm: Joi.string().required(),
        Description:  Joi.string().required(),
        Freight:  Joi.string().required(),
        Insurance:  Joi.string().required(),
        Status:  Joi.string().required(),
        Created_By:  Joi.string().allow(null)
    })

    const uuidv4 = require('uuid/v4')
    let userID = req.header('InitiatedBy')
    let ClientID = req.header('Client_ID')
    let incoterm_ID = uuidv4();

    var intercom = {
        ID: incoterm_ID,
        Incoterm: req.body.Incorterm,
        Description: req.body.Description,
        Freight: req.body.Freight,
        Insurance: req.body.Insurance,
        Status: req.body.Status,
        Client_ID: ClientID,
        Created_By: userID
    }
    console.error('-----> 2');
    Joi.validate(intercom, schema, (err, result) => {
        console.error('-----> 3');
        if (err) {
            console.error(err);
            return res.status(400).send();
        }

        dbConnection.query("INSERT INTO Incoterms SET ?",intercom, function (error, results, fields) {
            console.error('-----> 4');
            if (error) return next(error);
            if (!results || results.affetedRows == 0) res.status(404).send();

            console.error('-----> 5');
             return res.status(201).send({
                    error: false,
                    data: results,
                    message: 'New Incoterms types has been created successfully.'
                });
        })
    })
})

router.delete('/incoterm/:id', function (req, res, next) {

    dbConnection.query("UPDATE Incoterms SET Status = 0  WHERE ID = ?", req.params.id, function (error, results, fields) {

        if (error) return next(error);

        if (!results || results.affectedRows == 0) return res.status(404).send();

        return res.send(results);
    });
});

module.exports = router;