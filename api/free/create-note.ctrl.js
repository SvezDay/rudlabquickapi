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
// CONTROLLERS -----------------------------------------------------------------
const detail = require('./read-graph-detail.ctrl');

module.exports.createNote = (tx, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    let query = `
    MATCH (i:Index{uuid:$idx_uuid})-[]->(t:Title)
    OPTIONAL MATCH p=(t)-[*]->(f:Note)
    CREATE (new:Note {value:'', code_label:99.1, uuid:apoc.create.uuid()})
    WITH COUNT(r) as count, i, new
    CALL apoc.do.when(count=1,
      "MATCH(i:Index)-[]->(t:Title)-[rel]->(f:Note) WHERE i={i} MATCH (new:Note) WHERE new={new} DELETE rel CREATE (t)-[hn:Has]->(new)-[hf:Has]->(f) RETURN true"
      , "MATCH(i:Index)-[]->(t) WHERE i={i} MATCH (new:Note) WHERE new={new} CREATE (t)-[hn:Has]->(new) RETURN true"
      , {i:i,new:new}) YIELD value
      RETURN new`

    return tx.run(query, {idx_uuid:idx_uuid})
    .then(()=>resolve())
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'free/create-note.ctrl.js/createNote'}); })
  })
}
/*
* Input: uuid
* Output: ExpendGraph
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();

  validator.uuid(ps.uuid)
  .then(()=>{return miscellaneousReq.access2Index(tx, ps.uid, ps.uuid) })

  .then(() => this.createNote(tx, ps.uuid) )

  .then(() => detail.getDetail(tx, ps.uid, ps.uuid) )
  .then( data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'free/create-note.ctrl.js/main'}, res, tx)} )
};
