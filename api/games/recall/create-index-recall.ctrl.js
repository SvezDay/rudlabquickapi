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
let createRecall = require('./create-recall.ctrl');

module.exports.createIndexRecall = (tx, uid, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();
    let default_nextDeadline = now + (1000 * 3600 * 24 * 365);
    let one = `
      MATCH (p:Person{uuid:$uid})
      MATCH (i:Index{uuid:$idx_uuid})
      CREATE (ir:IndexRecall{uuid:apoc.create.uuid(), idx_uuid:$idx_uuid, nextDeadline:$now})
      CREATE (p)-[r:Recall]->(ir)
      RETURN {index:{uuid:i.uuid, model:i.model}}
    `;
    tx.run(one, {uid:uid, idx_uuid:idx_uuid, default_nextDeadline:default_nextDeadline, now:now}).then(parser.parse)
    .then(data => createRecall.createRecall(tx, uid, idx_uuid, data[0].index.model) )
    .then(() => resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/create-index-recall.ctrl.js/main'} )} )
  })
}

module.exports.main = (req, res, next)=>{ // Input: idx_uuid  |  Output: q, a
  let session = driver.session();
  let tx = session.beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();

  let recall;
  validator.uuid(ps.idx_uuid, "ps.idx_uuid")
  .then(()=> miscellaneous.access2Any(tx, ps.uid, ps.idx_uuid))

  .then(() => this.createIndexRecall(tx, ps.uid, ps.idx_uuid) )
  .then(() => utils.commit(session, tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'recall/create-index-recall.ctrl.js/main'}, res, tx)} )
};
