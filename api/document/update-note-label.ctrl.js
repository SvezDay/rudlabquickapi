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
// COMMON ----------------------------------------------------------------------
// const commonData = require('../_models/common.data');
// CONTROLLER ------------------------------------------------------------------
let detail = require('../free/read-graph-detail.ctrl');
let updateRecall = require('../games/recall/update-recall.ctrl').updateRecall;

module.exports.updateLabel = (tx, uuid, code_label)=>{ //  Input: tx, uuid, code_label  |  Output: void
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();

    Promise.resolve()
    .then(() => {
      let query = `
        MATCH (n:Note{uuid:$uuid})
        SET n.code_label = $code_label `;
      return tx.run(query,{uuid:uuid, code_label:code_label})
    })
    .then(() => {resolve()})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/update-note-label.ctrl.js/updatLabel'}); })
  })
}

module.exports.main = (req, res, next)=>{ // Input: idx_uuid, up_uuid, code_label  |  Output: ExtendGraph
  let ps = req.body;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.idx_uuid, "ps.idx_uuid")
  .then(()=> validator.uuid(ps.up_uuid, "ps.uuid") )
  .then(()=> validator.num(ps.code_label, 'ps.code_label') )
  .then(()=> miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )
  .then(()=> miscellaneousReq.access2Note(tx, ps.uid, ps.up_uuid) )
  .then(()=> this.updateLabel(tx, ps.up_uuid, ps.code_label) )
  .then(()=> this.updateRecall(tx, ps.up_uuid, ps.code_label) )
  .then(()=> detail.getDetail(tx, ps.uid, ps.idx_uuid) )

  .then(result=> { utils.commit(tx, res, ps.uid, result) })
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'document/update-note.ctrl.js/main'}, res, tx)} )
};
