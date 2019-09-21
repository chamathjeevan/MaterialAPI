var express = require('express');
const router = express.Router();
const dbConnection = require('./database')
const Joi = require('@hapi/joi');
const { HTTP_STATUS } = require('./constents');

const schema = Joi.object().keys({
            ID: Joi.string().min(2).max(36).required(),
            BlTypes : Joi.string().required(),
            Strategy : Joi.string().required(),
            Description : Joi.string().required(),
            Status : Joi.string().required(), 
            Client_ID : Joi.string().required(),     
            Created_By : Joi.string().allow(null),
            IsDeleted: Joi.boolean(),
            IsActive: Joi.boolean(),
            Parent_ID: Joi.string().max(36).allow(null).allow(''),
})

router.get('/:Client_ID/bType/', function (req, res, next) {
    dbConnection.query('SELECT * FROM BlTypes WHERE Client_ID = ?', req.params.Client_ID, function (error, results,fields){
        if(error) return next(error);
        if(!results || results.length == 0) return res.status(HTTP_STATUS.NOT_FOUND).send();
        return res.send(results)
    })
})

router.get('/:Client_ID/bType/:ID', function (req, res, next) {
    dbConnection.query('SELECT * FROM BlTypes WHERE ID = ? AND Client_ID = ?', [req.params.ID, req.params.Client_ID], function(error, results, fields) {
        if(error) return next(error);
        if (!results || results.length == 0) return res.status(HTTP_STAUS.NOT_FOUND).send()
        var result = results[0];
        
        var bType = {
            ID : results.ID,
            BlTypes : result.BlTypes,
            Strategy : result.Strategy,
            Description : result.Description,
            Status : result.Status,
            Client_ID : result.Client_ID,
            Created_By : result.Created_By,
            IsDeleted: result.IsDeleted,
            IsActive: result.IsActive,
            Parent_ID: result.Parent_ID,
            
        };

       // dbConnection.query('SELECT * FROM ')
    })

})

router.post('/:Client_ID/bType/', function(req, res, next) {
    if(!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();

    const uuidv4 = require('uuid/v4')
    let USER_ID = req.header('InitiatedBy')
    let Client_ID = req.header('Client_ID')
    let ID = uuidv4();

    req.body.Created_By = USER_ID;

    Joi.validate(req.body, schema, (err, results) => {
        if(err) {
            console.error(err);
            return res.status(HTTP_Status.BAD_REQUEST).send(err);
        }

        var bType = {
            ID : ID,
            BlTypes : req.body.BlTypes,
            Strategy : req.body.Strategy,
            Description : req.body.Description,
            Status : req.body.Status,
            Client_ID : Client_ID,
            Created_By : USER_ID,
            IsDeleted: req.body.IsDeleted,
            IsActive: req.body.IsActive,
            Parent_ID: null,

        }

        dbConnection.beginTransaction(function(err){

            if(err) return next(err);

            var post = dbConnection.query("INSERT INTO BlTypes SET ? ", bType, function(errBltypes, result) {
                if(errBltypes) {
                    dbConnection.rollback(function() {
                        console.error(errBltypes);
                        return next(errBltypes);
                    });
                }

                console.log(post.sql);
                console.error(result) 

                dbConnection.commit(function (commitError) {
                    if(commitError) {
                        dbConnection.rollback(function() {
                            console.error(commitError);
                            return next(commitError);
                        })
                    }

                    return res.status(HTTP_STATUS.SUCCESS).send({error: false, data: ID, message : ID}) 

                })
            
            })
        })
    })
})


router.put('/:Client_ID/bType/', function(req, res, next) {
    console.error( req.body)
    console.error('1');
    if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();
    console.error('2');
    const uuidv4 = require('uuid/v4')
    const USER_ID = req.header('InitiatedBy')
    const Client_ID = req.header('Client_ID')
    const ID = uuidv4();
    const PARENT_ID = req.body.ID;
    console.error('3');
    req.body.Created_By = USER_ID;

    Joi.validate(req.body, schema, (err, results) => {
        console.error('4');
        if(err) {
            console.error(err);
            return res.status(HTTP_STATUS.BAD_REQUEST).send(err);
        } 

        var bType = {
            ID : ID,
            BlTypes : req.body.BlTypes,
            Strategy : req.body.Strategy,
            Description : req.body.Description,
            Status : req.body.Status,
            Client_ID : Client_ID,
            Created_By : USER_ID,
            IsDeleted: req.body.IsDeleted,
            IsActive: req.body.IsActive,
            Parent_ID: PARENT_ID,
            
        }

        console.error('6');

        dbConnection.beginTransaction(function (err) {
            console.error('7');
            if (err) return next(err);
            dbConnection.query("UPDATE BlTypes SET IsActive = 0 WHERE ID = ? AND Client_ID = ?" , [PARENT_ID, req.params.Client_ID], function (errorUpdate , results, fields) {
                if(errorUpdate) {
                    dbConnection.rollback(function () {
                    console.error(errorUpdate);
                    return next(errorUpdate);
                    });
                };

                var query = dbConnection.query("INSERT INTO BlTypes SET ? ", bType, function(errBltypes, result) {
                    if (errBltypes) {
                        dbConnection.rollback(function() {
                            console.error(errBltypes);
                            return next(errBltypes);
                        })
                    }
                    console.log(query.sql);
                     //console.error(result.query);
                     console.error(result) 

                dbConnection.commit(function(commitError) {
                    if(commitError) {
                        dbConnection.rollback(function() {
                            console.error(commitError);
                            return next(commitError);
                        });
                    }


            return res.status(HTTP_STATUS.SUCCESS).send({error : false, data: ID, message : ID})

                })
                
                })

                console.error('8');

            })
        })
    })
})

router.delete('/:Client_ID/bType/:ID', function(req, res) {
    var deletequry = dbConnection.query("UPDATE BlTypes SET IsDeleted = 0, IsActive =  0 WHERE ID = ? AND Client_ID = ? ", [req.params.ID, req.params.Client_ID], function (error, results, fields) {
        if (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(error);
        } else {

            if (!results || results.length == 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).send();
            } else {
                return res.status(HTTP_STATUS.SUCCESS).send();
            }
        } 
    })

    console.log(deletequry.sql);
})
/*
router.delete('/:Client_ID/bType/:ID', function(req, res) {
    console.error('1');
    dbConnection.query("UPDATE BlTypes SET WHERE ID = ? AND Client_ID = ?", [req.params.Client_ID], function (errorUpdate, results, fields) {
      if (error) {
        console.error('2');
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(error);
      }
      
      else {
        console.error('3');
          if(!results||results.length == 0) {
              return res.status(HTP_STATUS.NOT_FOUND).send();
              
          }
          else
          {
            console.error('4');
              return res.status(HTTP_STATUS.SUCCESS).send();
          }
          
      }
      
      
    })
})

*/

module.exports = router;