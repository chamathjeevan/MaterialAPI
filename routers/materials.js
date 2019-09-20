var express = require('express');
const router = express.Router();
const dbConnection = require('./database')
const Joi = require('@hapi/joi');
const { HTTP_STATUS } = require('./constents');

const schema = Joi.object().keys({
    ID: Joi.string().min(2).max(36).required(),
    Client_ID: Joi.string().max(36).required(),
    Name: Joi.string().max(60).required(),
    MaterialType_ID: Joi.number().integer().required(),
    Origin: Joi.string().max(3).required(),
    Measures_ID: Joi.string().max(4).required(),
    HsCodes_ID: Joi.string().max(20).required(),
    IsApprovalRequired: Joi.boolean(),
    CargoType: Joi.string().valid('General', 'Dangerous Good'),
    IsDeleted: Joi.boolean(),
    IsActive: Joi.boolean(),
    IsBOI: Joi.boolean(),
    Parent_ID: Joi.string().max(36).allow(null).allow(''),
    Supplier_ID: Joi.string().max(36).required(),
    CreatedBy: Joi.string().max(36).required(),
    Priority: Joi.string().valid('High', 'Medium', 'Low'),
    Agreements: Joi.array().items(Joi.number().integer()),
    Approvals: Joi.array().items(Joi.string())

   // is deleted navatha use wena 1 navattanna. full delete wenne na
})

router.get('/:Client_ID/material/', function (req, res, next) {
    dbConnection.query('SELECT * FROM Materials WHERE  Client_ID = ?', req.params.Client_ID, function (error, results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0) return res.status(HTTP_STATUS.NOT_FOUND).send();
        return res.send(results)
    })
})

router.get('/:Client_ID/material/:id', function (req, res, next) {
    dbConnection.query('SELECT * FROM Materials WHERE ID = ? AND Client_ID = ?', [req.params.id, req.params.Client_ID], function (error, results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0) return res.status(HTTP_STATUS.NOT_FOUND).send()
        var result = results[0];
        var isApprovalsDone = false;
        var isAgreementsDone = false;

        var material = {
            ID: result.ID,
            Client_ID: result.Client_ID,
            Name: result.Name,
            MaterialType_ID: result.MaterialType_ID,
            Origin: result.Origin,
            Measures_ID: result.Measures_ID,
            HsCodes_ID: result.HsCodes_ID,
            IsApprovalRequired: result.IsApprovalRequired,
            CargoType: result.CargoType,
            IsDeleted: result.IsDeleted,
            IsActive: result.IsActive,
            IsBOI: result.IsBOI,
            Parent_ID: result.Parent_ID,
            Supplier_ID: result.Supplier_ID,
            CreatedBy: result.CreatedBy,
            Priority: result.Priority,
            Approvals: [],
            Agreements: []
        };

        dbConnection.query('SELECT RegulatoryApproval_ID FROM MaterialApprovals WHERE Material_ID =  ?', [req.params.id], function (error, approvals, fields) {
            if (approvals && approvals.length > 0) {

                approvals.forEach(extract);

                function extract(item, index) {
                    material.Approvals.push(item.RegulatoryApproval_ID);
                }
            }
            isApprovalsDone = true;

            if (isApprovalsDone && isAgreementsDone) return res.send(material)
        })
        var arrAgreements = new Array();
        dbConnection.query('SELECT Agreement_ID FROM MaterialAgreements WHERE Material_ID =  ?', [req.params.id], function (error, agreements, fields) {
            if (agreements && agreements.length !== 0) {

                agreements.forEach(extract);

                function extract(item, index) {
                    material.Agreements.push(item.Agreement_ID);
                }
            }
            isAgreementsDone = true;

            if (isApprovalsDone && isAgreementsDone) return res.send(material)
        })
    })
})

router.post('/:Client_ID/material/', function (req, res, next) {

    if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();

    const uuidv4 = require('uuid/v4')
    let USER_ID = req.header('InitiatedBy')
    let Client_ID = req.header('Client_ID')
    let MATERIAL_ID = uuidv4();

    req.body.CreatedBy = USER_ID;

    Joi.validate(req.body, schema, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(HTTP_STATUS.BAD_REQUEST).send(err);
        }

        var material = {
            ID: MATERIAL_ID,
            Client_ID: Client_ID,
            Name: req.body.Name,
            MaterialType_ID: req.body.MaterialType_ID,
            Origin: req.body.Origin,
            Measures_ID: req.body.Measures_ID,
            HsCodes_ID: req.body.HsCodes_ID,
            IsApprovalRequired: req.body.IsApprovalRequired,
            CargoType: req.body.CargoType,
            IsDeleted: req.body.IsDeleted,
            IsActive: req.body.IsActive,
            IsBOI: req.body.IsBOI,
            Parent_ID: null,
            Supplier_ID: req.body.Supplier_ID,
            CreatedBy: USER_ID,
            Priority: req.body.Priority
        }

        dbConnection.beginTransaction(function (err) {

            if (err) return next(err);

            dbConnection.query("INSERT INTO Materials SET ? ", material, function (errMaterials, result) {
                if (errMaterials) {
                    dbConnection.rollback(function () {
                        console.error(errMaterials);
                        return next(errMaterials);
                    });
                }
                // ------------- INSERT AGREEMENTS ---------
                if (req.body.Agreements && req.body.Agreements.length > 0) {
                    var sqlAgreements = "";
                    var agreementsData = []
                    const agreementsTemplate = 'INSERT INTO MaterialAgreements SET ? '
                    for (i = 0; i < req.body.Agreements.length; i++) {
                        sqlAgreements += agreementsTemplate;
                        if (i !== (req.body.Agreements.length - 1)) {
                            sqlAgreements += '; ';
                        }
                        agreementsData.push({ Material_ID: MATERIAL_ID, Agreement_ID: req.body.Agreements[i] });
                    }

                    dbConnection.query(sqlAgreements, agreementsData, function (errAgreement, result) {
                        if (errAgreement) {
                            dbConnection.rollback(function () {
                                console.error(errAgreement);
                                return next(errAgreement);
                            });
                        }
                    });
                }
                // ------------- INSERT APPROVAL ---------
                if (req.body.Approvals && req.body.Approvals.length > 0) {
                    var dataApprovals = []
                    const TemplateApproval = 'INSERT INTO MaterialApprovals SET ? '
                    var sqlApprovals = "";
                    for (i = 0; i < req.body.Approvals.length; i++) {
                        sqlApprovals += TemplateApproval;
                        if (i !== (req.body.Approvals.length - 1)) {
                            sqlApprovals += '; ';
                        }
                        dataApprovals.push({ Material_ID: MATERIAL_ID, RegulatoryApproval_ID: req.body.Approvals[i] });;
                    }
                    dbConnection.query(sqlApprovals, dataApprovals, function (errApprovals, result) {
                        if (errApprovals) {
                            dbConnection.rollback(function () {
                                console.error(errApprovals);
                                return next(errApprovals);
                            });
                        }
                    });
                }
                dbConnection.commit(function (commitError) {
                    if (commitError) {
                        dbConnection.rollback(function () {
                            console.error(commitError);
                            return next(commitError);
                        });
                    }
                    return res.status(HTTP_STATUS.CREATED).send({ error: false, data: MATERIAL_ID, message: MATERIAL_ID })
                });
            });
        });
    });
});


router.put('/:Client_ID/material/', function (req, res, next) {

    if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();

    const uuidv4 = require('uuid/v4')
    const USER_ID = req.header('InitiatedBy')
    const Client_ID = req.header('Client_ID')
    const MATERIAL_ID = uuidv4();
    const PARENT_ID = req.body.ID;

    req.body.CreatedBy = USER_ID;

    Joi.validate(req.body, schema, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(HTTP_STATUS.BAD_REQUEST).send(err);
        }


        var material = {
            ID: MATERIAL_ID,
            Client_ID: Client_ID,
            Name: req.body.Name,
            MaterialType_ID: req.body.MaterialType_ID,
            Origin: req.body.Origin,
            Measures_ID: req.body.Measures_ID,
            HsCodes_ID: req.body.HsCodes_ID,
            IsApprovalRequired: req.body.IsApprovalRequired,
            CargoType: req.body.CargoType,
            IsDeleted: req.body.IsDeleted,
            IsActive: req.body.IsActive,
            IsBOI: req.body.IsBOI,
            Parent_ID: PARENT_ID,
            Supplier_ID: req.body.Supplier_ID,
            CreatedBy: USER_ID,
            Priority: req.body.Priority
        }

        dbConnection.beginTransaction(function (err) {

            if (err) return next(err);
            dbConnection.query("UPDATE Materials SET  IsActive = 0 WHERE ID = ? AND Client_ID = ? ", [PARENT_ID, req.params.Client_ID], function (errorUpdate, results, fields) {
                if (errorUpdate) {
                    dbConnection.rollback(function () {
                        console.error(errorUpdate);
                        return next(errorUpdate);
                    });
                }
                dbConnection.query("INSERT INTO Materials SET ? ", material, function (errMaterials, result) {
                    if (errMaterials) {
                        dbConnection.rollback(function () {
                            console.error(errMaterials);
                            return next(errMaterials);
                        });
                    }
                    // ------------- INSERT AGREEMENTS ---------
                    if (req.body.Agreements && req.body.Agreements.length > 0) {
                        var sqlAgreements = "";
                        var agreementsData = []
                        const agreementsTemplate = 'INSERT INTO MaterialAgreements SET ? '
                        for (i = 0; i < req.body.Agreements.length; i++) {
                            sqlAgreements += agreementsTemplate;
                            if (i !== (req.body.Agreements.length - 1)) {
                                sqlAgreements += '; ';
                            }
                            agreementsData.push({ Material_ID: MATERIAL_ID, Agreement_ID: req.body.Agreements[i] });
                        }

                        dbConnection.query(sqlAgreements, agreementsData, function (errAgreement, result) {
                            if (errAgreement) {
                                dbConnection.rollback(function () {
                                    console.error(errAgreement);
                                    return next(errAgreement);
                                });
                            }
                        });
                    }
                    // ------------- INSERT APPROVAL ---------
                    if (req.body.Approvals && req.body.Approvals.length > 0) {
                        var dataApprovals = []
                        const TemplateApproval = 'INSERT INTO MaterialApprovals SET ? '
                        var sqlApprovals = "";
                        for (i = 0; i < req.body.Approvals.length; i++) {
                            sqlApprovals += TemplateApproval;
                            if (i !== (req.body.Approvals.length - 1)) {
                                sqlApprovals += '; ';
                            }
                            dataApprovals.push({ Material_ID: MATERIAL_ID, RegulatoryApproval_ID: req.body.Approvals[i] });;
                        }
                        dbConnection.query(sqlApprovals, dataApprovals, function (errApprovals, result) {
                            if (errApprovals) {
                                dbConnection.rollback(function () {
                                    console.error(errApprovals);
                                    return next(errApprovals);
                                });
                            }
                        });
                    }
                    dbConnection.commit(function (commitError) {
                        if (commitError) {
                            dbConnection.rollback(function () {
                                console.error(commitError);
                                return next(commitError);
                            });
                        }
                        return res.status(HTTP_STATUS.SUCCESS).send({ error: false, data: MATERIAL_ID, message: MATERIAL_ID })
                    });
                });
            });
        });
    });
});

router.delete('/:Client_ID/material/:id', function (req, res) {

    dbConnection.query("UPDATE Materials SET IsDeleted = 0, IsActive = 0 WHERE ID = ? AND Client_ID = ? ", [req.params.id, req.params.Client_ID], function (error, results, fields) {

        if (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(error);
        } else {

            if (!results || results.length == 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).send();
            } else {
                return res.status(HTTP_STATUS.SUCCESS).send();
            }
        }
    });
});

module.exports = router;