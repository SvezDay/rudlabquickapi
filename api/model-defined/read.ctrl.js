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
const commonData = require('../_models/common.data');
// CONTROLLERS -----------------------------------------------------------------

module.exports.read = (tx, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    let one = `
    MATCH (i:Index{uuid:$idx_uuid})-[]->(t:Title)
    OPTIONAL MATCH (t)-[*]->(ns:Note)
    RETURN {index:{uuid:i.uuid, model:i.model}, title:{uuid:t.title, value:t.value, recallable:t.recallable}, notes:COLLECT(DISTINCT {uuid:ns.uuid, value:ns.value, code_label:ns.code_label})}`;

    tx.run(one, {idx_uuid:idx_uuid}).then(parser.parse)
    .then(data => {
      data[0].notes[0].uuid==null ? data[0].notes = [] : null
      return data;
    })
    .then(data=> resolve(data[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'model-defined/read.ctrl.js/read'}); })
  })
}
/*
* By:
* Input: idx_uuid
* Output: model
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log("ps", ps)

  validator.uuid(ps.idx_uuid, 'ps.idx_uuid')
  .then(()=> miscellaneousReq.access2Any(tx, ps.uid, ps.idx_uuid) )

  .then(()=>  this.read(tx, ps.idx_uuid))

  .then(data => {console.log(data); return data; })
  .then(data=> utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'model-defined/read.ctrl.js/main'}, res, tx)} )
};
