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
/*
* Input: first_uuid, up_uuid, value
* Output: VocabularyGraph
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;
  console.log('======================================================================')
  console.log('ps', ps)

  validator.uuid(ps.item_uuid, "ps.item_uuid")
  .then(()=> validator.uuid(ps.up_uuid," ps.up_uuid"))
  .then(()=> validator.str(ps.value))
  .then(() => {return miscellaneousReq.access2Note(tx, ps.uid, ps.item_uuid) })
  .then(() => {return miscellaneousReq.access2Note(tx, ps.uid, ps.up_uuid) })
  .then(()=>{
    let query = `
      MATCH (up:Note{uuid:$up_uuid})
      SET up.value = $value
      RETURN {uuid:up.uuid, value:up.value, code_label:up.code_label}`;
    return tx.run(query, ps).then(parser.parse)
  })
  // .then(() => ecg.getColumnGraph(tx, ps.item_uuid) )
  // .then(graph => ecg.getRowGraph(tx, graph) )
  .then(graph => {console.log('graph result', graph); return graph})
  .then(data=>utils.commit(session, tx, res, ps.uid, data[0]) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'dico/update-value.ctr.js/main'}, res, tx)} )
};
