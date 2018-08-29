'use-strict';
const express = require('express');
const parser = require('parse-neo4j');
const driver = require('../dbconnect');
const utils = require('../api/_services/utils.service');
const validator = require('../api/_services/validator.service');
let tokenGen = require('../api/_services/token.service');

module.exports.methodTesting = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let path = require(req.body.path);
  let params = req.body.params;

  Promise.resolve()
  .then(()=>{
    if(params.length==1){
      return path[req.body.method](tx, params[0]);
    }else if(params.length==2){
      return path[req.body.method](tx, params[1]);
    }
  })
  .then(data=>{ tx.commit(); res.status(200).json(data[0]); })
  .catch(err=>{ tx.rollback(); res.status(400).json({err:err})})
};
module.exports.methodTestingUid = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let path = require(req.body.path);
  let params = req.body.params;

  Promise.resolve()
  .then(()=>{
    if(params.length==0){
      return path[req.body.method](tx, req.decoded.uuid);
    }else if(params.length==1){
      return path[req.body.method](tx, req.decoded.uuid, params[0]);
    }
  })
  .then(data=>{console.log(data); return data})
  .then(data=>{ tx.commit(); res.status(200).json(data); })
  .catch(err=>{ tx.rollback(); res.status(400).json({err:err})})
};
// ====================== ROUTES ==================================
module.exports = ()=>{
  let routes = express.Router();
  routes.post('/methodTesting', this.methodTesting)
  routes.post('/methodTestingUid', this.methodTestingUid)
  return routes;
};
