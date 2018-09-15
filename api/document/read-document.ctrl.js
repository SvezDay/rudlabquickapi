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

module.exports.readDocument = (tx, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    let one = `
    MATCH (i:Index{uuid:$idx_uuid})-[]->(t:Title)
    OPTIONAL MATCH (t)-[:Has]->(ns:Note)
    WITH i, t, ns, COUNT(ns) AS count
    CALL apoc.do.when(count>1 AND count<>0
      ,' MATCH (t)-[:Has]->(ns:Note) WHERE t={t} RETURN ns AS notes '
      ,' OPTIONAL MATCH (t)-[:Has*]->(ns:Note) WHERE t={t} RETURN ns AS notes'
      ,{t:t})YIELD value
    WITH i, t, value.notes as ns
    RETURN {index:{uuid:i.uuid, model:i.model}, title:{uuid:t.uuid, value:t.value, recallable:t.recallable, code_label:t.code_label}, notes:COLLECT(DISTINCT {uuid:ns.uuid, value:ns.value, code_label:ns.code_label})}`;

    tx.run(one, {idx_uuid:idx_uuid}).then(parser.parse)
    .then(data => {
      data[0].notes[0].uuid==null ? data[0].notes = [] : null
      return data;
    })
    .then(data=> resolve(data[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/read-document.ctrl.js/readDocument'}); })
  })
}

module.exports.main = (req, res, next)=>{ // Input: idx_uuid  |  Output: document
  let ps = req.headers;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log("ps", ps)

  validator.uuid(ps.idx_uuid, 'ps.idx_uuid')
  .then(()=> miscellaneousReq.access2Any(tx, ps.uid, ps.idx_uuid) )

  .then(()=>  this.readDocument(tx, ps.idx_uuid))

  // .then(data => {console.log("read-document",data); return data; })
  .then(data=> utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'document/read-document.ctrl.js/main'}, res, tx)} )
};
