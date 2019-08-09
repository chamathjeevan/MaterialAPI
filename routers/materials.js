var express = require('express');
const router = express.Router();
var dbConnection = require('./database')
const Joi = require('@hapi/joi');

router.get('/:Client_ID/material/', function (req, res, next) {
    dbConnection.query('SELECT * FROM Materials WHERE  IsActive = 1', function (error, results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0) return res.status(404).send();
        return res.send(results)
    })
})

router.get('/:Client_ID/material/:id', function (req, res, next) {
    dbConnection.query('SELECT * FROM Materials WHERE  IsActive = 1  AND ID = ?', req.params.id, function (error, results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0) return res.status(404).send();
        return res.send(results)
    })
})

router.post('/:Client_ID/material/', function (req, res) {
    const uuidv4 = require('uuid/v4')
    if (!req.body) {
        res.status(400).send({
            error: true,
            message: 'Please provide material'
        });
        res.end();
        return
    }

    var materialId = uuidv4();

    let material = {
        ID: materialId,
        ItemName: req.body.ItemName,
        ItemType: req.body.ItemType,
        ItemOrigin: req.body.ItemOrigin,
        UnitOfMeasure_ID: req.body.UnitOfMeasure_ID,
        HS_HsCode: req.body.HS_HsCode,
        RequiredApprovalTypes: req.body.RequiredApprovalTypes,
        CargoType: req.body.CargoType,
        Trade_Agreement_Type_ID: req.body.Trade_Agreement_Type_ID,
        IsDeleted: false,
        IsActive: true,
        IsBOI: req.body.IsBOI,
        Parent_ID: null,
        Supplier_ID: req.body.Supplier_ID,
        CreatedBy: req.body.CreatedBy
    }

    console.error(material)
    let materialClients = {
        Material_ID: materialId,
        Client_ID: req.body.Client_ID
    }

    let materialAgreements = {
        Material_ID: materialId,
        Agreement_ID: req.body.Trade_Agreement_Type_ID
    }

    let materialApprovals = {
        Material_ID: materialId,
        Approval_ID: req.body.RequiredApprovalTypes
    }

    let userID = req.header('InitiatedBy')
    //material.CreatedBy = userID;
    //---------------------

    /* Begin transaction */
    dbConnection.beginTransaction(function (err) {
        if (err) { throw err; }
        dbConnection.query("INSERT INTO Materials SET ? ", material, function (err, result) {
            if (err) {
                dbConnection.rollback(function () {
                    throw err;
                });
            }

            dbConnection.query('INSERT INTO MaterialClients SET ?', materialClients, function (err, result) {
                if (err) {
                    dbConnection.rollback(function () {
                        throw err;
                    });
                }

                dbConnection.query('INSERT INTO MaterialAgreements SET ?', materialAgreements, function (err, result) {
                    if (err) {
                        dbConnection.rollback(function () {
                            throw err;
                        });
                    }

                    dbConnection.query('INSERT INTO MaterialApprovals SET ?', materialApprovals, function (err, result) {
                        if (err) {
                            dbConnection.rollback(function () {
                                throw err;
                            });
                        }

                        dbConnection.commit(function (err) {
                            if (err) {
                                dbConnection.rollback(function () {
                                    throw err;
                                });
                            }
                            res.status(201).send({
                                error: false,
                                data: materialId,
                                message: materialId
                            })

                            res.end();
                            return
                        });
                    });
                });
            });
        });
    });
});

router.put('/:Client_ID/material/', function (req, res) {
    const uuidv4 = require('uuid/v4')
    let material = req.body;
    let ParentID = material.ID;

    if (!material) {
        res.status(400).send({
            error: true,
            message: 'Please provide material'
        });
        res.end();
        return
    }

    console.error('-------------------------');
    console.error(material);
    console.error('-------------------------');
    var materialId = uuidv4();
    /* Begin transaction */
    dbConnection.beginTransaction(function (err) {
        if (err) {
            console.error('1')
            res.status(500).send(error);
                    res.end();
                    return
            ;
        }
        console.error('2');
        dbConnection.query("UPDATE Materials SET  IsActive = 0 WHERE ID = ? ", ParentID, function (error, results, fields) {
            if (error) {
                console.error('3');
                dbConnection.rollback(function () {

                    res.status(500).send(error);
                    res.end();
                    return
                });
            }
            console.error('4');
            dbConnection.query("DELETE  FROM MaterialApprovals WHERE Material_ID = ? ", ParentID, function (error, results, fields) {
                if (error) {
                    dbConnection.rollback(function () {
                        console.error('5');
                        res.status(500).send(error);
                        res.end();
                        return
                    });
                }
                console.error('5');
                dbConnection.query("DELETE  FROM MaterialClients WHERE Material_ID = ? ", ParentID, function (error, results, fields) {
                    if (error) {
                        console.error('6');
                        dbConnection.rollback(function () {
                            console.error('7');
                            res.status(500).send(error);
                            res.end();
                            return
                        });
                    }
                    console.error('8');
                    dbConnection.query("DELETE  FROM MaterialAgreements WHERE Material_ID = ? ", ParentID, function (error, results, fields) {
                        console.error('9');
                        if (error) {
                            console.error('10');
                            dbConnection.rollback(function () {

                                res.status(500).send(error);
                                res.end();
                                return
                            });
                        }
                       
                        let copyMaterial = {
                            ID: materialId,
                            ItemName: material.ItemName,
                            ItemType: material.ItemType,
                            ItemOrigin: material.ItemOrigin,
                            UnitOfMeasure_ID: material.UnitOfMeasure_ID,
                            HS_HsCode: material.HS_HsCode,
                            RequiredApprovalTypes: material.RequiredApprovalTypes,
                            CargoType: material.CargoType,
                            Trade_Agreement_Type_ID: material.Trade_Agreement_Type_ID,
                            IsDeleted: false,
                            IsActive: true,
                            IsBOI: material.IsBOI,
                            Parent_ID: ParentID,
                            Supplier_ID: material.Supplier_ID,
                            CreatedBy: material.CreatedBy
                        }

                        let materialClients = {
                            Material_ID: materialId,
                            Client_ID: req.body.Client_ID
                        }

                        let materialAgreements = {
                            Material_ID: materialId,
                            Agreement_ID: req.body.Trade_Agreement_Type_ID
                        }

                        let materialApprovals = {
                            Material_ID: materialId,
                            Approval_ID: req.body.RequiredApprovalTypes
                        }
                        console.error('11');
                        dbConnection.query("INSERT INTO Materials SET ? ", copyMaterial, function (error, results, fields) {

                            if (error) {
                                dbConnection.rollback(function () {
                                    res.status(500).send(error);
                                    res.end();
                                    return
                                });
                            }

                            dbConnection.query('INSERT INTO MaterialClients SET ?', materialClients, function (error, result) {
                                if (error) {
                                    dbConnection.rollback(function () {
                                        res.status(500).send(error);
                                        res.end();
                                        return
                                    });
                                }

                                dbConnection.query('INSERT INTO MaterialAgreements SET ?', materialAgreements, function (error, result) {
                                    if (error) {
                                        dbConnection.rollback(function () {
                                            res.status(500).send(error);
                                            res.end();
                                            return
                                        });
                                    }

                                    dbConnection.query('INSERT INTO MaterialApprovals SET ?', materialApprovals, function (error, result) {
                                        if (error) {
                                            dbConnection.rollback(function () {
                                                res.status(500).send(error);
                                                res.end();
                                                return
                                            });
                                        }
                                        console.error('12');
                                        dbConnection.commit(function (error) {
                                            console.error(error);
                                            console.error('13');
                                            if (error) {
                                                console.error('14');
                                                dbConnection.rollback(function () {
                                                    console.error('15');
                                                    res.status(500).send(error);
                                                    res.end();
                                                    return
                                                });
                                            }
                                            console.error('16');
                                  
                                           /* res.status(200).send({
                                                error: false,
                                                data: null,
                                                message: 'Material has been updated successfully.'
                                            })
                                            */
                                            console.error('17');
                                            res.end();
                                            console.error('18');
                                            return
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    /* End transaction */


});

router.delete('/:Client_ID/material/:id', function (req, res) {

    let material_id = req.params.id;

    dbConnection.query("UPDATE Materials SET  IsDeleted = 1 WHERE ID = ?", [material_id], function (error, results, fields) {

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
                    message: 'Material has been deleted successfully.'
                });
            }
        }
        res.end();
        return
    });
});

module.exports = router;