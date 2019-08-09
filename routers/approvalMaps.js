var express = require('express');
const router = express.Router();
var dbConnection = require('./database');
const Joi = require('@hapi/joi')

router.get('/:Client_ID/approvalmaps/', function(req, res, next){

    dbConnection.query('SELECT * FROM BRIDGE.ApprovalMap WHERE Client_ID = ?' , req.params.ClientID, function(error, results, fields){
        if (error) return next (error);
        if (!results || results.length == 0) return res.status(404).send()
        return res.send(results)
    });
});


router.put('/:Client_ID/approvalmaps/', function(req, res, next) {
    const schema = Joi.object().keys ({
        Client_ID : Joi.string().alphanum().min(3).max(30).required()
    })

    Joi.validate(req.body, schema, (err,results) => {
        if (err)
            {
                return res.status(400).send;
            }
        
        let approvalmaps = req.body;
        dbConnection.query("UPDATE BRIDGE.ApprovalMap SET Client_ID = ?", [ApprovalMap.ClientID], function(error,results, fields) {
            if (error) return next.body;
            if(!results||results.affectedRows == 0) res.status(404).send();
            return res.status(results);
        })
    })
})

router.post('/Client_ID/approvalmap/', function(req, res, next) {
    const schema = Joi.object().keys({
        Client_ID : Joi.string().alphanum().min(3).max(30).required()

    })

    Joi.validate(req.body, schema, (err, result)=> {
        if (err){
            return res.status(400).send();
        }
        let approvalmap = req.body;
        dbConnection.query('INSERT INTO BRIDGE.approvalmap SET ID = Client_ID = ?'. req.body, function(error, results, fields) {
            if (error) return next(error);
            return res.status(404).send();
        })
    })
})


router.get('/:Client_ID/approvalmaps', function(req, res) {

    dbConnection.query('SELECT * FROM BRIDGE.ApprovalMap', function(error, results, fields) {
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

router.post('/:Client_ID//approvalmaps',function(req,res,next) {
    let approvalMap = req.body;

    if (!approvalMap) {
        res.status(400).send ({error:true , message :''})
    }
})



router.post('/:Client_ID/approvalmaps', function(req, res) {
    let approvalMap = req.body;

    if (!approvalMap) {
        res.status(400).send({
            error: true,
            message: 'Please provide Approval Map'
        });
        res.end();
        return
    }

    dbConnection.query("INSERT INTO BRIDGE.ApprovalMap SET ? ", approvalMap, function(error, results, fields) {
        if (error) {
            res.status(500).send(error);
        } else {

            if (!results || results.length == 0) {
                res.status(404).send({
                    error: false,
                    message: 'No records found'
                });
            } else {
                res.status(200).send({
                    error: false,
                    data: results,
                    message: 'New Approval Map has been created successfully.'
                });
            }
        }
        res.end();
        return
    });
});



module.exports = router;