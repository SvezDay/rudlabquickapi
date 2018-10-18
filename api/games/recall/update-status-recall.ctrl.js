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
// const recallReq = require('../_services/recall.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------


module.exports.updateStatusRecall = (tx, recall_uuid, status)=>{ // Input: recall_uuid  | Output: void
    return new Promise((resolve, reject)=>{
      let query = `
        MATCH (r:Recall{uuid:$recall_uuid})
        SET r.status = $status`;
    tx.run(query, {recall_uuid:recall_uuid, status:status})
    .then(() => resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'games/recall/update-status-recall.ctrl.js/updateStatusRecall'}); })
  })
}

module.exports.main = (req, res, next)=>{ // Input: recall_uuid, status |  Output:  void
  let session = driver.session();
let tx = session.beginTransaction();
  let ps = req.body.recall;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();

  validator.uuid(ps.recall_uuid)
  .then(()=> validator.boolean(ps.status, 'ps.status'))
  .then(()=> miscellaneous.access2Any(tx, ps.uid, ps.recall_uuid) )

  .then(()=> this.updateStatusRecall(tx, ps.recall_uuid, ps.status) )

  .then(() => utils.commit(session, tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'games/recall/update-status-recall.ctrl.js/main'}, res, tx)} )
};
