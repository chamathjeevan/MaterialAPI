var express = require('express');
const router = express.Router();
var dbConnection = require('./database');
const Joi = require('@hapi/joi');

router.get('/:Client_ID/regapproval', function (req, res, next) {

    dbConnection.query('SELECT * FROM RegulatoryApproval WHERE Client_ID = ? AND IsActive = 1', req.params.Client_ID, function (error, results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0) return res.status(404).send()
        return res.send(results)
    });
});

router.get('/:Client_ID/regapproval/:id', function (req, res) {

    dbConnection.query('SELECT * FROM RegulatoryApproval WHERE Client_ID = ? AND IsActive = 1 AND ID = ? ', [req.params.Client_ID, req.params.id], function (error, results, fields) {
        if (error) return next(error);

        if (!results || results.length == 0) return res.status(404).send()

                            var regApproval = {
                                ID: results[0].ID,
                                Client_ID: results[0].Client_ID,
                                Institute: results[0].Institute,
                                TestName: results[0].TestName,
                                ReleaseTimeInDays: results[0].ReleaseTimeInDays,
                                SampleRequired: results[0].SampleRequired,
                                AverageReleaseTime: results[0].AverageReleaseTime,
                                ObtainingStage: results[0].ObtainingStage,
                                IsActive: results[0].IsActive,
                                Parent_ID: results[0].Parent_ID,
                                CreatedBy: results[0].CreatedBy,
                                CreatedTime: results[0].CreatedTime,
                                Attachments: []}
  

        dbConnection.query('SELECT RegulatoryAttachments.* FROM RegulatoryAttachments INNER JOIN RegulatoryApproval ON RegulatoryAttachments.RegulatoryApproval_ID = RegulatoryApproval.ID WHERE RegulatoryApproval.Client_ID = ? AND RegulatoryApproval.ID = ?', [req.params.Client_ID, req.params.id], function (error, attachmentResults, fields) {

            if (error) return next(error);
            if (!attachmentResults || attachmentResults.length == 0) return res.send(regApproval);

            attachmentResults.forEach(extract);

            function extract(item, index) {
                regApproval.Attachments.push({ ID: item.ID, document: item.DocumentName, Description: item.Description, mandatory: item.Mandatory });
            }
            return res.send(regApproval)
        })
    });
});


router.post('/:Client_ID/regapproval', function (req, res) {
    let regApproval = req.body;

    if (!regApproval) {
        res.status(400).send({
            error: true,
            message: 'Please provide regulatory approval'
        });
        res.end();
        return
    }

    const uuidv4 = require('uuid/v4')
    let userID = req.header('InitiatedBy')
    let clientID = req.header('Client_ID')
    let APPROVAL_ID = uuidv4();

    var attachments = regApproval.Attachments
    var approvall = {
        ID: APPROVAL_ID,
        Client_ID: clientID,
        Institute: regApproval.Institute,
        TestName: regApproval.TestName,
        ReleaseTimeInDays: regApproval.ReleaseTimeInDays,
        SampleRequired: regApproval.SampleRequired,
        AverageReleaseTime: regApproval.AverageReleaseTime,
        ObtainingStage: regApproval.ObtainingStage,
        IsActive: 1,
        CreatedBy: userID
    }

    dbConnection.query("INSERT INTO RegulatoryApproval SET ? ", approvall, function (error, results, fields) {

        if (error) {
            res.status(500).send(error);
        } else {
            if (!results || results.length == 0) {
                res.status(404).send();
            } else {
                if (attachments && attachments.length > 0) {

                    for (var k = 0; k < attachments.length; k++) {

                        let attachment = {
                            RegulatoryApproval_ID: APPROVAL_ID,
                            DocumentName: attachments[k].DocumentName,
                            Description: attachments[k].Description,
                            Mandatory: attachments[k].Mandatory
                        }

                        dbConnection.query("INSERT INTO RegulatoryAttachments SET ? ", attachment, function (error1, results, fields) {
                            if (error) {
                                console.error(error1);
                            }
                        });
                    }
                  return res.status(201).send({
                        error: false,
                        data: results,
                        message: 'New regulatory approval has been created successfully.'
                    });
                } else {

                    return res.status(201).send({
                        error: false,
                        data: results,
                        message: 'New regulatory approval has been created successfully.'
                    });
                }
            }
        }
    });
});

router.put('/regapproval', function (req, res) {

    let regApproval = req.body;
    let ParentID = regApproval.ID;

    if (!regApproval) {
        res.status(400).send({
            error: true,
            message: 'Please provide regulatory approval'
        });
        res.end();
        return
    }

    /* Begin transaction */
    dbConnection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }

        dbConnection.query("UPDATE BRIDGE.RegulatoryApproval SET  IsActive = 0 WHERE ID = ? ", ParentID, function (error, results, fields) {
            if (error) {
                dbConnection.rollback(function () {

                    res.status(500).send(error);
                    res.end();
                    return
                });
            }

            const uuidv4 = require('uuid/v4')
            let userID = req.header('InitiatedBy')
            let clientID = req.header('Client_ID')
            let APPROVAL_ID = uuidv4();
       

            var copyRegApprovall = {
                ID: APPROVAL_ID,
                Client_ID: clientID,
                Institute: regApproval.Institute,
                TestName: regApproval.TestName,
                ReleaseTimeInDays: regApproval.ReleaseTimeInDays,
                SampleRequired: regApproval.SampleRequired,
                AverageReleaseTime: regApproval.AverageReleaseTime,
                ObtainingStage: regApproval.ObtainingStage,
                IsActive: 1,
                CreatedBy: userID
            }

            dbConnection.query("INSERT INTO BRIDGE.RegulatoryApproval SET ID = uuid(), ? ", copyRegApprovall, function (error, results, fields) {

                console.log(error);

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
                        message: 'Regulatory approval has been updated successfully.'
                    });

                    res.end();
                    return
                });
            });
        });
    });
    /* End transaction */


});

router.delete('/regapproval/:id', function (req, res) {

    let regapproval_id = req.params.id;

    if (!regapproval_id) {
        res.status(400).send({
            error: true,
            message: 'Please provide Regulatory Approval id'
        });
        res.end();
        return
    }

    dbConnection.query("UPDATE BRIDGE.RegulatoryApproval SET  IsDeleted = 1 WHERE ID = ?", [regapproval_id], function (error, results, fields) {

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
                    message: 'Regulatory approval has been deleted successfully.'
                });
            }
        }
        res.end();
        return
    });
});



//ClinetID

module.exports = router;