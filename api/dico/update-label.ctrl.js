'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../_services/token.service');
const driver = require('../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
// SERVICES --------------------------------------------------------------------
const utils = require('../_services/utils.service');
const validator = require('../_services/validator.service');
// REQUEST ---------------------------------------------------------------------
const miscellaneousReq = require('../_services/miscellaneous.request');
const descendantReq = require('../_services/descendant.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLERS -----------------------------------------------------------------
const ehg=require('./read-extend-head-graph.ctrl');
const ecg=require('./read-extend-column-graph.ctrl');
let updateRecall = require('../games/recall/update-recall.ctrl').updateRecall;

module.exports.updateLabel = (tx, first_uuid, up_uuid, code_label)=>{ // Input:  first_uuid, up_uuid, code_label  |  Output: VocabularyGraph
  return new Promise((resolve,reject)=>{
    let query = `
      MATCH (up:Note{uuid:$up_uuid})
      SET up.code_label = $code_label
    `;
    tx.run(query, {up_uuid:up_uuid, code_label:code_label})
    .then(() => ecg.getColumnGraph(tx, first_uuid) )
    .then(graph => ecg.getRowGraph(tx, graph) )
    .then(data=> resolve(data))
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'dico/read-extend-head-graph.ctrl.js/getExtendHeadGraph'}); })
  })
}

module.exports.main = (req, res, next)=>{ // Input:  first_uuid, up_uuid, code_label  |  Output: VocabularyGraph
  let ps = req.body;
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.first_uuid, 'ps.first_uuid')
  .then(()=> validator.uuid(ps.up_uuid, 'ps.up_uuid'))
  .then(()=> validator.num(ps.code_label, 'ps.code_label'))
  .then(()=> miscellaneousReq.access2Note(tx, ps.uid, ps.first_uuid) )
  .then(()=> miscellaneousReq.access2Note(tx, ps.uid, ps.up_uuid) )
  .then(() => this.updateLabel(tx, ps.first_uuid, ps.up_uuid, ps.code_label) )
  .then(graph=>utils.commit(session, tx, res, ps.uid, graph) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'dico/update-label.ctr.js/main'}, res, tx)} )
};
