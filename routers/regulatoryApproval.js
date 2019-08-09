var express = require('express');
const router = express.Router();
var dbConnection = require('./database');
const Joi = require('@hapi/joi');

router.get ('/:Client_ID/regapproval', function(req,res,next) {
 
    dbConnection.query('SELECT * FROM BRIDGE.RegulatoryApproval ', function (error, results, fields) {

        if (error) return next(error);
        if (!results || results.length == 0) return res.status(404).send()
        return res.send(results)
    });
});

router.get('/regapproval', function(req, res) {

    dbConnection.query('SELECT * FROM BRIDGE.RegulatoryApproval WHERE IsActive = 1 ', function(error, results, fields) {
        if (error) {
            res.status(500).send(error);
        } else {

            if (!results || results.length == 0) {
                res.status(404).send({
                    error: false,
                    message: 'No records found'
                });
            } else {
                res.json(results);
            }
        }
        res.end();
        return
    });

});

router.get('/regapproval/:id', function(req, res) {

    let regapproval_id = req.params.id;

    if (!regapproval_id) {
        res.status(400).send({
            error: true,
            message: 'Please provide regulatory approval id'
        });
        res.end();
        return
    }

    dbConnection.query('SELECT * FROM BRIDGE.RegulatoryApproval where id=?', regapproval_id, function(error, results, fields) {

        if (error) {
            res.status(500).send(error);
        } else {

            if (!results || results.length == 0) {
                res.status(404).send({
                    error: false,
                    message: 'No records found'
                });
            } else {
                res.json(results);
            }
        }
        res.end();
        return
    });

});

router.post('/regapproval', function(req, res) {
    let regApproval = req.body;
   
    if (!regApproval) {
        res.status(400).send({
            error: true,
            message: 'Please provide regulatory approval'
        });
        res.end();
        return
    }

    let userID = req.header('InitiatedBy')
    regApproval.CreatedBy = userID; 
    dbConnection.query("INSERT INTO BRIDGE.RegulatoryApproval SET ID = uuid(), ? ", regApproval, function(error, results, fields) {
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
                    message: 'New regulatory approval has been created successfully.'
                });
            }
        }
        res.end();
        return
    });
});

router.put('/regapproval', function(req, res) {

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
    dbConnection.beginTransaction(function(err) {
        if (err) {
            throw err;
        }

        dbConnection.query("UPDATE BRIDGE.RegulatoryApproval SET  IsActive = 0 WHERE ID = ? ", ParentID, function(error, results, fields) {
            if (error) {
                dbConnection.rollback(function() {

                    res.status(500).send(error);
                    res.end();
                    return
                });
            }
            
            let userID = req.header('InitiatedBy')
     
            var copyRegApprovall = {
                ApprovalType: regApproval.ApprovalType,
                ApprovalObtainingStage: regApproval.ApprovalObtainingStage,
                Institute: regApproval.Institute,
                Reference: regApproval.Reference,
                SampleRequired: regApproval.SampleRequired,
                ReleaseTimeInDays: regApproval.ReleaseTimeInDays,
                IsActive: 1,
                Parent_ID: ParentID,
                CreatedBy: userID
            }

            dbConnection.query("INSERT INTO BRIDGE.RegulatoryApproval SET ID = uuid(), ? ", copyRegApprovall, function(error, results, fields) {

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

router.delete('/regapproval/:id', function(req, res) {

    let regapproval_id = req.params.id;

    if (!regapproval_id) {
        res.status(400).send({
            error: true,
            message: 'Please provide Regulatory Approval id'
        });
        res.end();
        return
    }

    dbConnection.query("UPDATE BRIDGE.RegulatoryApproval SET  IsDeleted = 1 WHERE ID = ?", [regapproval_id], function(error, results, fields) {

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

//clientID

router.put ('/:Client_ID/regapproval', function(req,res, next) {
    const schema = Joi.object().keys({
        Client_ID : Joi.string().alphanum().min(3).max(36).required()
    })

    Joi.validate(req.body, schema, (err, result) => {
        if (err) {
            return res.status(400).send();
        }
        let RegulatoryApproval = req.body;
        dbConnection.query("UPDATE BRIDGE.regapproval SET Client_ID = ?", [RegulatoryApproval.ClientID] , function(error,results, fields) {
            
            if (error) return next(error);
            if (!results || results.affectedRows == 0) res.status(404).send();
            return res.send(results);
        });
    });
});

router.post('/:Client_ID/regapproval', function(reg, res, next) {
    const schema = Joi.object().keys({
        Client_ID: Joi.string().alphanum().min(3).max(30).required()

    })

    Joi.validate(req.body, schema, (err, result) => {
        if (err) {
            return res.status(400).send();
        }
        let RegulatoryApproval = req.body;
        dbConnection.query("INSERT INTO BRIDGE.regapproval SET ID = Client_ID = ?", req.body, function(error, results, fields){
                if (error) return next(error);
                    return res.status(404).send();
    
        });
    });
});

//ClinetID

module.exports = router;