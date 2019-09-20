var express = require('express');
const router = express.Router();
const dbConnection = require('./database')
const Joi = require('@hapi/joi');
const { HTTP_STATUS } = require('./constents');

const schema = Joi.object().keys({
    ID: Joi.string().min(3).max(37).required(),
    StakeholderName : Joi.string().required(),
    StakeholderType : Joi.string().required(),
    Address : Joi.string().required(),
    ClientName : Joi.string().required(),
    BuisnessRegistration : Joi.string().required(),
    TIN : Joi.string().required(),
    SwiftAddress : Joi.string().required(),
    PaymentDue : Joi.date().required(),
   /* Name : Joi.string().required(),
    Designation : Joi.string().required(),
    ContactNo : Joi.string().required(),
    EmailAddress : Joi.string().required(),
    OtherContactDetails : Joi.string().required(),
    CompanyName : Joi.string().required(),
    */
   
    Client_ID: Joi.string().min(3).max(37).required(),
    Created_By:  Joi.string().allow(null),
    IsDeleted: Joi.boolean(),
    IsActive: Joi.boolean(),
    //Parent_ID: Joi.string().max(36).allow(null).allow(''),
    //ContactDetails_ID : Joi.string().max(36).allow(null).allow(''),
    //ContactDetails : Joi.array().items(Joi.string())

    ContactDetails : Joi.array()

})

router.get('/:Client_ID/stakeholder', function(req, res, next) {
    dbConnection.query('SELECT * FROM Stakeholder WHERE Client_ID = ? AND IsActive = true', req.params.Client_ID, function(error, results, fields) {
        if (error) return next(error);
        if (!results || results.length == 0) return res.status(HTTP_STATUS.NOT_FOUND).send();
        return res.send(results)
    })
})

router.get('/:Client_ID/stakeholder/:ID', function(req, res, next) {
    
    dbConnection.query('SELECT * FROM Stakeholder WHERE ID = ? AND Client_ID = ?', [req.params.ID, req.params.Client_ID], function(error, results, fields) {
        if(error) return next (error);
        if(!results || results.length ==0) return res.status(Http_STATUS.NOT_FOUND).send()
        var result = results[0];
        var isContactDetailsDone = false;

        var stakeholder = {
            ID: result.ID,
            StakeholderName : result.StakeholderName,
            StakeholderType : result.StakeholderType,
            Address : result.Address,
            ClientName : result.ClientName,
            BuisnessRegistration : result.BuisnessRegistration,
            TIN : result.TIN,
            SwiftAddress : result.SwiftAddress,
            PaymentDue : result.PaymentDue,
           /* Name :result.Name,
            Designation : result.Designation,
            ContactNo : result.ContactNo,
            EmailAddress : result.EmailAddress,
            OtherContactDetails : result.OtherContactDetails,
            CompanyName : result.CompanyName,
            */
            Client_ID: result.Client_ID,
            Created_By:  result.Created_By,
            IsDeleted: result.IsDeleted,
            IsActive:result.IsActive,
            Parent_ID: result.Parent_ID,
            ContactDetails_ID : result.ContactDetails_ID ,
            ContactDetails : []
            
        };
    })
})

router.post('/:Client_ID/stakeholder', function (req, res) {
    if(!req.body) {
        res.status(400).send();
        res.end();
        return
    }

    const uuidv4 = require('uuid/v4')
    let userID = req.header('InitiatedBy')
    let ClientID = req.header('Client_ID')
    let ID = uuidv4();

    Joi.validate (req.body, schema, (err, result) => {

        if(err) {
            console.error(err)
            return res.status(400).send();
        }

        var stakeholder = {
            ID : ID,
            StakeholderName : req.body.StakeholderName,
            StakeholderType : req.body.StakeholderType,
            Address : req.body.Address,
            ClientName : req.body.ClientName,
            BuisnessRegistration : req.body.BuisnessRegistration,
            TIN :req.body.TIN,
            SwiftAddress : req.body.SwiftAddress,
            PaymentDue : req.body.PaymentDue,
            IsDeleted: req.body.false,
            IsActive: req.body.true,
            
            Name : req.body.Name,
            Designation : req.body.Designation,
            ContactNo : req.body.ContactNo,
            EmailAddress : req.body.EmailAddress,
            OtherContactDetails : req.body.OtherContactDetails,
            CompanyName : req.body.CompanyName,
        }

        dbConnection.query ("INSERT INTO Stakeholder SET ? ", stakeholder, function (error, results, fields) {
            if (error) {
                res.status(500).send(error);
            }
            else {
                if(!results || results.length == 0) {
                    res.status(500).send(error);

                }
                else  {
                    if (!results || results.length == 0) {
                        res.status(404).send({
                            error : false ,
                            message : 'No records found'
                        });
                    }
                    else {

                        for (var k = 0; k < req.body.ContactDetaill.length ; k++) {
                            let ContactDetails = {
                                ID : ID,
                                CDName : req.body.ContactDetaill[k].CDName,
                                CDDesignation : req.body.ContactDetaill[k].CDDesignation,
                                CDContactNo : req.body.ContactDetaill[k].CDContactNo,
                                CDEmail : req.body.ContactDetaill[k].CDEmail,
                                CDOtherContactDetails : req.body.ContactDetaill[k].CDOtherContactDetails,
                                CDCompanyName : req.body.ContactDetaill[k].CDCompanyName,

                            }

                            dbConnection.query("INERT INTO Stakeholder SET ?" , ContactDetails, function (error1, results, fields) {
                                if (error) {
                                    console.error(error1);
                                }
                            })
                        }

                        res.status(201).send({
                            error : false,
                            data : results,
                            message : ContactDetails_ID
                        });
                    }
                }

                res.end();
                return
            }
        })
    })
})



//put-------

router.put('/:Client_ID/stakeholder', function (req, res) {
    let stakeholder = req.body;
    //let Parent_ID = stakeholder.ID

    console.error('1')
    if(!stakeholder) {
        res.status(400).send();
        res.end();
        return
        
    }
    console.error('2')
    //transaction begin

    dbConnection.beginTransaction(function(err) {
        if(err) {
            throw err;
        }
        console.error('3')

       var stakeput =  dbConnection.query("UPDATE Stakeholder SET IsActive = 0 WHERE ID = ? ", function (error, results, fields) {
            if(error) {
                dbConnection.rollback(function() {

                    console.error('4')

                    res.status(500).send(error);
                    res.end();
                    return
                    
                });
            }

            console.log(stakeput.sql);
            console.error('5')

            const uuidv4 = require('uuid/v4')
            let userID = req.header('InitiatedBy')
            let ClientID = req.header('Client_ID')
            let ID = uuidv4();

            console.error('6')

            Joi.validate(req.body, schema, (err, result) => {
                if(err) {

                    console.error('7')

                    console.error(err)
                    return res.status(400).send();  
              }
              console.error('8')

              var copyStakeholder = {
                    ID : ID,
                    StakeholderName  : req.body.StakeholderName,
                    StakeholderType : req.body.StakeholderType,
                    Address : req.body.Address,
                    ClientName : req.body.ClientName,
                    BuisnessRegistration : req.body.BuisnessRegistration,
                    TIN : req.body.TIN,
                    SwiftAddress : req.body.SwiftAddress,
                    PaymentDue : req.body.PaymentDue,
              }
              console.error('9')
              dbConnection.query("INSERT INTO Stakeholder SET ?", copyStakeholder, function(error, results, fields) {
                  
                console.log(error);

                if(error) {
                      res.status(500).send(error);
                      console.error('10')
                  }
                  else {
                      if (!results || results.length == 0) {
                            res.status(500).send(error);
                            console.error('11')
                      }
                      else {
                          if(!results || results.length == 0) {
                              res.status(404).send({
                                  error : false,
                                  message : 'No records found',
                                 
                              });
                              console.error('12')
                          }

                          else 
                          {
                              for (var k =0; k < req.body.ContactDetail.length ; k++ ) {

                                let contactDetails = {
                                    ID : ID,
                                    CDName : req.body.ContactDetail[k].CDName,
                                    CDDesignation : req.body.ContactDetail[k].CDDesignation,
                                    CDContactNo : req.body.ContactDetail[k].CDContactNo,
                                    CDEmail : req.body.ContactDetail[k].CDEmail,
                                    CDOtherContactDetails : req.body.ContactDetail[k].CDOtherContactDetails,
                                    CDCompanyName : req.body.ContactDetail[k].CDCompanyName,
                                }
                                console.error('13')

                                dbConnection.query("INSERT INTO SHContactDetails SET ? ", contactDetails, function(error1, results, fields) {
                                        if(error) {
                                            console.error(error1);
                                        }
                                        console.error('14')
                                });
                              }

                              dbConnection.commit(function (err) {
                                  if(error) {
                                      dbConnection.rollback(function() {
                                          res.status(500).send(error);
                                          res.end();
                                          return
                                      });
                                      console.error('14')
                                  }
                                  console.error('15')
                                  res.send({
                                      error : false,
                                      data : results,
                                      message : copyStakeholder.ID
                                  })
                                  console.error('16')
                                  res.end();
                                  return
                              })

                              console.error('17')
                          }
                      }
                  }
              })

              router.delete('/:Client_ID/stakeholder/:ID', function(req, res) {

                let ID = req.params.ID;

                if(!ID) {
                    res.status(400).send();
                    res.end();
                    return
                }

                dbConnection.query("UPDATE Stakeholder SET isDeleted = 1 WHERE ID = ?", [ID, function(error, results,fields) {

                    if(error) {
                        res.status(500).send(error);
                    }
                    else {
                        if(!results || results.length == 0) {
                            res.status(404).send();
                        }
                        else
                        {
                            res.send({
                                error : false,
                                data : results,
                                message :'Contact Details has been deleted successfuly'
                            })
                        }
                    }

                    res.end();
                    return
                }])
              })



            })
        })
    })
})




//-------------------
/*
router.post('/:Client-ID/stakeholder/', function(req, res, next) {
    if (!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();

    const uuidv4 = require('uuid/v4')
    let USER_ID = req.header('InitiatedBy')
    let Client_ID = req.header('Client_ID')
    let ID = uuidv4();

    req.body.CreatedBy = USER_ID;

    Joi.validate(req.body, schema, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(HTTP_STATUS.BAD_REQUEST).send(err);

        }

        var stakeholder = {
            ID : ID,
            StakeholderName : req.body.StakeholderName,
            StakeholderType : req.body.StakeholderType,
            Address : req.body.Address,
            ClientName : req.body.ClientName,
            BuisnessRegistration : req.body.BuisnessRegistration,
            TIN :req.body.TIN,
            SwiftAddress : req.body.SwiftAddress,
            PaymentDue : req.body.PaymentDue,
            Name : req.body.Name,
            Designation : req.body.Designation,
            ContactNo : req.body.ContactNo,
            EmailAddress : req.body.EmailAddress,
            OtherContactDetails : req.body.OtherContactDetails,
            CompanyName : req.body.CompanyName,
            Client_ID: Client_ID,
            CreatedBy: USER_ID,
            ContactDetails_ID : req.body.ContactDetails_ID ,
           // IsDeleted: req.body.IsDeleted,
            //IsActive: req.body.IsActive,
            //IsBOI: req.body.IsBOI,
            //Parent_ID: null,
        }

        dbConnection.beginTransaction(function(err) {
            if(err) return next(err);

            dbConnection.query("INSERT INTO Stakeholder SET ?", material, function (errStakeholder, results) {
                if(errStakeholder) {
                    dbConnection.rollback(function() {
                        console.error(errStakeholder);
                        return next(errStakeholder);
                    })
                }

                //insert

                if (req.body.ContactDe && req.body.ContactDe.length > 0) {
                    var sqlContactDe = "";
                    var contactDeData = []
                    const contactDeTemplate = 'INSERT INTO StakeholderContactDe SET ?'
                    for (i = 0; i < req.body.ContactDe.length; i++) {
                        sqlContactDe += contactDeTemplate;

                        if (i !== (req.body.ContactDe.length -1)) {
                            sqlContactDe +=  ';';
                        }
                        contactDeData.push({ID : ID ,StakeContactID : req.body.ContactDe[i] });                        
                    }
                    dbConnection.query(sqlContactDe, contactDeData, function(errContactDe, result) {
                        if (errContactDe) {
                            dbConnection.rollback(function() {
                                console,error(errContactDe);
                                return next(errContactDe)
                            })
                        }
                    })
                }

                dbConnection.commit(function (commitError) {
                    if(commitError) {
                        dbConnection.rollback(function() {
                            console.error(commitError);
                            return next (commitError);
                        });
                    }
                    return res.status(HTTP_STATUS.CREATED).send({error : false,data : ID, message : ID })
                })
            })
        })

    })
}) 

router.put('/:Client_ID/stakeholder/', function(req, res, next) {
    if(!req.body) return res.status(HTTP_STATUS.BAD_REQUEST).send();

    const uuidv4 = require('uuid/v4')
    const USER_ID = req.header('InitiatedBy')
    const Client_ID = req.header('Client_ID')
    const ID = uuidv4();
    const PARENT_ID = req.body.ID;

    req.body.Created_By = USER_ID;

    Joi.validate(req.body, schema, (err, results)=> {
        if (err) {
            console.error(err);
            return res.status(HTTP_STATUS.BAD_REQUEST).send(err);
        }

        var stakeholder = {
            ID : ID,
            StakeholderName  : req.body.StakeholderName,
            StakeholderType : req.body.StakeholderType,
            Address : req.body.Address,
            ClientName : req.body.ClientName,
            BuisnessRegistration : req.body.BuisnessRegistration,
            TIN : req.body.TIN,
            SwiftAddress : req.body.SwiftAddress,
            PaymentDue : req.body.PaymentDue,
           /*
            Name : req.body.Name,
            Designation : req.body.Designation,
            ContactNo : req.body.ContactNo,
            EmailAddress : req.body.EmailAddress,
            OtherContactDetails : req.body.OtherContactDetails,
            CompanyName : req.body.CompanyName,
            */
/*
            Parent_ID: PARENT_ID,
            Client_ID : req.body.Client_ID,
            Created_By : USER_ID,
            ContactDetails_ID : req.body.ContactDetails_ID 
        }

        dbConnection.beginTransaction(function(err) {
            if (err) return next (err);
            dbConnection.query("UPDATE Stakeholder SET IsActive = 0 WHERE ID = ? AND Client_ID = ? ," [PARENT_ID, req.params.Client_ID], function(errorUpdate, results, fields) {
                if (errorUpdate) {
                    dbConnection.rollback(function() {
                        console.error(errorUpdate);
                        return next(errorUpdate);
                    })
                }

                dbConnection.query("INSERT INTO Stakeholder SET ? ", stakeholder,function(errStakeholder, result) {
                    if(errStakeholder) {
                        dbConnection.rollback(function() {
                            console.error(errStakeholder);
                            return next(errStakeholder);
                        })
                    }

                    if (req.body.ContactDetails && req.body.ContactDetails.length > 0) {
                        var sqlContactDe = "";
                        var contactDeData = []
                        const contactDeTemplate = 'INSERT INTO ContactDetails SET ?'
                        for(i = 0; i <req.body.ContactDetails.length; i++) {
                            sqlContactDe += contactDeTemplate;
                            if (i !== (req.body.ContactDetails.length - 1)) {
                                sqlContactDe += ';';

                            }
                            contactDeData.push({ID : ID , ContctDetails_ID: req.body.ContactDetails[i] });
                            }
                            contactDeData.push({sqlContactDe, contactDeData,function(errContactDe, result) {
                                if(errContactDe) {
                                    dbConnection.rollback(function(){
                                        console.error(errContactDe);
                                        return next (errContactDe);
                                    })                                     
                                }
                            }})
                        
                    }

                    dbConnection.commit(function(commitError) {
                        if(commitError) {
                            dbConnection.rollback(function() {
                                console.error(commitError);
                                return next(commitError);
                            });
                        }
                        return res.status(HTTP_STATUS.SUCCESS).send({error: false, data : ID, message: ID})
                    })
                })
            })
        })
    })
})

router.delete('/:Client_ID/material/:ID', function (req, res) {
    dbConnection.query("UPDATE Stakeholder SET IsDeleted = 0, IsActive = WHERE ID = ? AND Client_ID = ?", [req.params.id, req.params.Client_ID], function (error, results, fields) {
        if (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(error);
        }
        else {
            if (!results || results.length == 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).send();
            } else {
                return res.status(HTTP_STATUS.SUCCESS).send();
            }
            
        }
    })
})

*/
module.exports = router;