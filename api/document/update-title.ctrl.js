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
const graphReq = require('../_services/graph.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------

/*
* Input: tx, uuid, value
* Output: void
*/
module.exports.updateTitle = (tx, uuid, value)=>{
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();
    let query = `
      MATCH (t:Title{uuid:$uuid})
      SET t.value = $value
    `;
    tx.run(query, {uuid:uuid, value:value})
    .then(() => {resolve()})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/update-title.ctrl.js/updateTitle'}); })
  })
}
/*
* Input: idx_uuid, up_uuid, value
* Output: ExtendGraph
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.up_uuid, 'ps.up_uuid')
  .then(() => { return validator.uuid(ps.idx_uuid, 'ps.idx_uuid') })
  .then(() => { return validator.str(ps.value) })
  .then(() => { return miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) })
  .then(() => { return miscellaneousReq.access2Any(tx, ps.uid, ps.up_uuid) })
  .then(()=> {return this.updateTitle(tx, ps.up_uuid, ps.value)} )
  .then(()=> {return graphReq.getHeadGraph(tx, ps.idx_uuid)} )
  .then(graph=>utils.commit(tx, res, ps.uid, graph) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'document/update-title.ctrl.js/main'}, res, tx)} )
};
