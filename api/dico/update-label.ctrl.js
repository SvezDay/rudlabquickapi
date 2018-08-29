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
* Input:  first_uuid, up_uuid, code_label
* Output: VocabularyGraph
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log('======================================================================')
  // console.log('ps', ps)

  validator.uuid(ps.first_uuid, 'ps.first_uuid')
  .then(()=> validator.uuid(ps.up_uuid, 'ps.up_uuid'))
  .then(()=> validator.num(ps.code_label, 'ps.code_label'))
  .then(()=> miscellaneousReq.access2Note(tx, ps.uid, ps.first_uuid) )
  .then(()=> miscellaneousReq.access2Note(tx, ps.uid, ps.up_uuid) )
  .then(()=>{
    let query = `
      MATCH (up:Note{uuid:'${ps.up_uuid}'})
      SET up.code_label = ${ps.code_label}
    `;
    return tx.run(query)
  })
  .then(() => ecg.getColumnGraph(tx, ps.first_uuid) )
  .then(graph => ecg.getRowGraph(tx, graph) )
  .then(graph => {console.log('graph result', graph); return graph})
  .then(graph=>utils.commit(tx, res, ps.uid, graph) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'dico/update-label.ctr.js/main'}, res, tx)} )
};
