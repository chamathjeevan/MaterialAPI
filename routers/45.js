var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
    ID: Joi.string().trim().required(),
    //  Client_ID: Joi.string().trim().required(),
    Name: Joi.string().trim().required(),
    Address: Joi.string().trim().required(),
    NearestSeaPort: Joi.string().allow(null),
    NearestAirPort: Joi.string().allow(null),
    SeaTransitTime: Joi.number().precision(2),
    AirTransitTime: Joi.number().precision(2),
    SuppliersWebSite: Joi.string().allow(null),
    LinkToCatalogues: Joi.string().allow(null),
    Parent_ID: Joi.string().allow(null),
    IsDeleted: Joi.boolean(),
    IsActive: Joi.boolean(),
    Incoterm_ID: Joi.string().trim().required(),
    BanksName: Joi.string().trim().required(),
    PaymentTerm_ID: Joi.string().trim().required(),
    TransportMode: Joi.string().allow(null),
    ContactPersons: Joi.array()
})

router.get('/:Client_ID/supplier', function (req, res) {

    dbConnection.query('SELECT * FROM Suppliers Where Client_ID = ? AND IsActive = true', req.params.Client_ID, function (error, results, fields) {
        if (error) {
            console.error(error)
            res.status(500).send(error);
        } else {
            console.error(results)
            if (!results || results.length == 0) {
                res.status(404).send();
            } else {
                res.json(results);
            }
        }
        res.end();
        return
    });

});

router.get('/:Client_ID/supplier/:id', function (req, res) {

    let supplier_id = req.params.id;

    if (!supplier_id) {
        res.status(400).send();
        res.end();
        return
    }

    dbConnection.query('SELECT * FROM Suppliers Where IsActive = true and id= ?', supplier_id, function (error, results, fields) {

        if (error) {
            return res.status(500).send(error);
        } else {

            if (!results || results.length == 0) {
                return res.status(404).send();
            } else {

                var supplier = {
                    ID: results[0].ID,
                    Client_ID: results[0].Client_ID,
                    Name: results[0].Name,
                    Address: results[0].Address,
                    NearestSeaPort: results[0].NearestSeaPort,
                    NearestAirPort: results[0].NearestAirPort,
                    SeaTransitTime: results[0].SeaTransitTime,
                    AirTransitTime: results[0].AirTransitTime,
                    SuppliersWebSite: results[0].SuppliersWebSite,
                    LinkToCatalogues: results[0].LinkToCatalogues,
                    IsDeleted: results[0].false,
                    IsActive: results[0].true,
                    Incoterm_ID: results[0].Incoterm_ID,
                    BanksName: results[0].BanksName,
                    PaymentTerm_ID: results[0].PaymentTerm_ID,
                    ContactPersons: []
                }

                dbConnection.query('SELECT SupplierContacts.* FROM SupplierContacts INNER JOIN Suppliers ON SupplierContacts.Supplier_ID = Suppliers.ID WHERE Suppliers.Client_ID = ? AND Suppliers.ID = ?', [req.params.Client_ID, req.params.id], function (error, contactResults, fields) {

                    if (error) return next(error);
                    if (!contactResults || contactResults.length == 0) return res.send(supplier);

                    contactResults.forEach(extract);

                    function extract(item, index) {
                        supplier.ContactPersons.push({ Name: item.name, Telephone: item.Telephone, Mobile: item.Mobile, Email: item.Email });
                    }

                    return res.send(supplier)
                })

            }
        }

    });

});

router.post('/:Client_ID/supplier', function (req, res) {
    if (!req.body) {
        res.status(400).send();
        res.end();
        return
    }

    const uuidv4 = require('uuid/v4')
    let userID = req.header('InitiatedBy')
    let ClientID = req.header('Client_ID')
    let Supplier_ID = uuidv4();

    Joi.validate(req.body, schema, (err, result) => {

        if (err) {
            console.error(err)
            return res.status(400).send();
        }

        var supplier = {
            ID: Supplier_ID,
            Client_ID: ClientID,
            Name: req.body.Name,
            Address: req.body.Address,
            NearestSeaPort: req.body.NearestSeaPort,
            NearestAirPort: req.body.NearestAirPort,
            SeaTransitTime: req.body.SeaTransitTime,
            AirTransitTime: req.body.AirTransitTime,
            SuppliersWebSite: req.body.SuppliersWebSite,
            LinkToCatalogues: req.body.LinkToCatalogues,
            IsDeleted: req.body.false,
            IsActive: req.body.true,
            //1st attachment table 
            Incoterm_ID: req.body.Incoterm_ID,
            BanksName: req.body.BanksName,
            PaymentTerm_ID: req.body.PaymentTerm_ID,
            TransportMode: req.body.PaymentTerms
        }
        dbConnection.query("INSERT INTO Suppliers SET  ? ", supplier, function (error, results, fields) {
            if (error) {
                res.status(500).send(error);
            } else {

                if (!results || results.length == 0) {
                    res.status(404).send({
                        error: false,
                        message: 'No records found'
                    });
                } else {

                    for (var k = 0; k < req.body.ContactPersons.length; k++) {

                        let contact = {
                            Supplier_ID: Supplier_ID,
                            Name: req.body.ContactPersons[k].Name,
                            Telephone: req.body.ContactPersons[k].Telephone,
                            Mobile: req.body.ContactPersons[k].Mobile,
                            Email: req.body.ContactPersons[k].Email
                        }

                        dbConnection.query("INSERT INTO SupplierContacts SET ? ", contact, function (error1, results, fields) {
                            if (error) {
                                console.error(error1);
                            }
                        });
                    }
                    res.status(201).send({
                        error: false,
                        data: results,
                        message: supplier.ID
                    });
                }
            }
            res.end();
            return
        });
    });
});

router.put('/:Client_ID/supplier', function (req, res) {

    let supplier = req.body;
    let ParentID = supplier.ID;

    if (!supplier) {
        res.status(400).send();
        res.end();
        return
    }

    /* Begin transaction */
    dbConnection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }

        dbConnection.query("UPDATE Suppliers SET  IsActive = 0 WHERE ID = ? ", ParentID, function (error, results, fields) {
            if (error) {
                dbConnection.rollback(function () {

                    res.status(500).send(error);
                    res.end();
                    return
                });
            }
            const uuidv4 = require('uuid/v4')
            let userID = req.header('InitiatedBy')
            let ClientID = req.header('Client_ID')
            let Supplier_ID = uuidv4();

            var copySupplier = {
                ID: Supplier_ID,
                Client_ID: ClientID,
                Name: req.body.Name,
                Address: req.body.Address,
                NearestSeaPort: req.body.NearestSeaPort,
                NearestAirPort: req.body.NearestAirPort,
                SeaTransitTime: req.body.SeaTransitTime,
                AirTransitTime: req.body.AirTransitTime,
                SuppliersWebSite: req.body.SuppliersWebSite,
                LinkToCatalogues: req.body.LinkToCatalogues,
                IsDeleted: req.body.false,
                IsActive: req.body.true,
                
                Incoterm_ID: req.body.Incoterm_ID,
                BanksName: req.body.BanksName,
                PaymentTerm_ID: req.body.PaymentTerm_ID,
                TransportMode: req.body.PaymentTerms,
                Parent_ID: req.body.ID
            }

            dbConnection.query("INSERT INTO Suppliers SET  ? ", copySupplier, function (error, results, fields) {

                console.log(error);

                if (error) {
                    dbConnection.rollback(function () {
                        res.status(500).send(error);
                        res.end();
                        return
                    });
                }

                dbConnection.query("UPDATE SupplierContacts SET IsActive = 0  WHERE  Supplier_ID = ?",  ClientID, function (error, results, fields) {
                    if (error) {
                        console.error(error);
                    }
                });

                for (var k = 0; k < req.body.ContactPersons.length; k++) {

                    let contact = {
                        Supplier_ID: Supplier_ID,
                        Name: req.body.ContactPersons[k].Name,
                        Telephone: req.body.ContactPersons[k].Telephone,
                        Mobile: req.body.ContactPersons[k].Mobile,
                        Email: req.body.ContactPersons[k].Email
                    }

                    dbConnection.query("INSERT INTO SupplierContacts SET ? ", contact, function (error1, results, fields) {
                        if (error) {
                            console.error(error1);
                        }
                    });
                }

                //--------------------------------------------------------

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
                        message: copySupplier.ID
                    });

                    res.end();
                    return
                });
            });
        });
    });
    /* End transaction */
});

router.delete('/:Client_ID/supplier/:id', function (req, res) {

    let supplier_id = req.params.id;

    if (!supplier_id) {
        res.status(400).send();
        res.end();
        return
    }

    dbConnection.query("UPDATE Suppliers SET  IsDeleted = 1 WHERE ID = ?", [supplier_id], function (error, results, fields) {

        if (error) {
            res.status(500).send(error);
        } else {

            if (!results || results.length == 0) {
                res.status(404).send();
            } else {
                res.send({
                    error: false,
                    data: results,
                    message: 'Suppliers has been deleted successfully.'
                });
            }
        }
        res.end();
        return
    });
});

module.exports = router;