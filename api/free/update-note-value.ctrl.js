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
// CONTROLLER ------------------------------------------------------------------
const detail = require('./read-graph-detail.ctrl');

/*
* Input: tx, uuid, value
* Output: void
*/
module.exports.updateNote = (tx, uuid, value)=>{
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (n:Note{uuid:$uuid})
      SET n.value = $value `;
    tx.run(query, {uuid:uuid, value:value})
    .then(() => {resolve()})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'free/update-note-value.ctrl.js/updateNote'}); })
  })
}
/*
* Input: idx_uuid, up_uuid, value
* Output:
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let sesion = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();

  validator.uuid(ps.up_uuid)
  .then(() => validator.uuid(ps.idx_uuid) )
  .then(() => validator.str(ps.value) )
  .then(() => miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )
  .then(() => miscellaneousReq.access2Note(tx, ps.uid, ps.up_uuid) )
  .then(()=> this.updateNote(tx, ps.up_uuid, ps.value) )
  .then(()=> detail.getDetail(tx, ps.uid, ps.idx_uuid) )
  .then(graph=>utils.commit(session, tx, res, ps.uid, graph) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'free/updaate-note-value.ctrl.js/main'}, res, tx)} )
};
