'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../../_services/token.service');
const driver = require('../../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
// SERVICES --------------------------------------------------------------------
const utils = require('../../_services/utils.service');
const validator = require('../../_services/validator.service');
let miscellaneous = require('../../_services/miscellaneous.request');
// REQUEST ---------------------------------------------------------------------
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------
let createRecall = require('./create-recall.ctrl').createRecall;

module.exports.updateIndexRecallNextDeadline = (tx, uid, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    let one = `
      MATCH (p:Person{uuid:$uid})-[:Recall]->(ir:IndexRecall{idx_uuid:idx_uuid})
      OPTIONAL MATCH (ir)-[:Recall]->(r:Recall)
      WITH ir, r ORDER BY r.deadline LIMIT 1
      SET ir.nextDeadline = r.deadline `;

    tx.run(one, {uid:uid, idx_uuid:idx_uuid, default_nextDeadline:default_nextDeadline}).then(parser.parse)
    .then(data => createRecall(tx, uid, idx_uuid, data[0].index.model) ) // then create recalls
    .then(() => resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/update-index-recall-next-deadline.ctrl.js/main'} )} )
  })
}

module.exports.main = (req, res, next)=>{ // Input: idx_uuid  |  Output: void
  let tx = driver.session().beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;

  let recall;
  validator.uuid(ps.idx_uuid, "ps.idx_uuid")
  .then(()=> miscellaneous.access2Any(tx, ps.uid, ps.idx_uuid))

  .then(() => this.updateIndexRecallNextDeadline(tx, ps.uid, ps.idx_uuid) )
  .then(() => utils.commit(tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'recall/update-index-recall-next-deadline.ctrl.js/main'}, res, tx)} )
};
