'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../../_services/token.service');
const driver = require('../../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
const bluemise = require('bluebird');
// SERVICES --------------------------------------------------------------------
const utils = require('../../_services/utils.service');
const validator = require('../../_services/validator.service');
// REQUEST ---------------------------------------------------------------------
const miscellaneousReq = require('../../_services/miscellaneous.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------
let createIndexRecall = require('./create-index-recall.ctrl').createIndexRecall;
let deleteIndexRecall = require('./delete-index-recall.ctrl').deleteIndexRecall;

module.exports.updateRecallableState = (tx, idx_uuid, status, descendant)=>{ // Input: recall{uuid}, status  |  Output: void
  return new Promise((resolve, reject)=>{

    let one = ` MATCH (i:Index{uuid:$idx_uuid})-[]->(t:Title) SET t.recallable = $status`;
    tx.run(one, {idx_uuid:idx_uuid, status:status})
    .then(() => {
      if(descendant){
        let two = ` MATCH (i:Index{uuid:$idx_uuid})-[*]->(is:Index)-[]->(ts:Title) SET ts.recallable = $status`;
        return tx.run(two, {idx_uuid:idx_uuid, status:status})
      }
    })
    .then(() => resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'games/recall/update-recallable-state.ctrl.js/updateRecallableState'}); })
  })
};

module.exports.main = (req, res, next)=>{ // Input: idx_uuid, status(boolean), descendant(boolean)  |  Output: void
  let tx = driver.session().beginTransaction();
  let ps = req.body;
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.idx_uuid, "ps.idx_uuid")
  .then(() => validator.boolean(ps.status, "ps.status") )
  .then(() => validator.boolean(ps.descendant, "ps.descendant") )
  .then(() => miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )
  .then(() => this.updateRecallableState(tx, ps.idx_uuid, ps.status, ps.descendant))
  .then(()=>{
    if(ps.status){
      return createIndexRecall(tx, ps.uid, ps.idx_uuid);
    }else{
      return deleteIndexRecall(tx, ps.idx_uuid);
    }
  })
  .then(() => utils.commit(tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'games/recall/update-recallable-state.ctrl.js/main'}, res, tx)} )
};
