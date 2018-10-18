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

/*
* Input: idx_uuid
* Output: {result:true}
*/
module.exports.delDocIndex = (tx, idx_uuid)=>{
  // DELETE DOC CONTAINER TITLE NODES
  return new Promise((resolve, reject)=>{
    const query = `
    MATCH (con:Index{uuid:$idx_uuid})
    OPTIONAL MATCH (top)-[:Manage]->(con) WHERE top:Note OR top:Title OR top:Person
    OPTIONAL MATCH (con)-[:Has*]->(collection) WHERE collection:Title OR collection:Note
    OPTIONAL MATCH (con)-[*]->(bot:Index)
    WITH con, top, collect(distinct collection) AS collectionlist, collect(distinct bot) AS botlist
    FOREACH(n IN collectionlist | DETACH DELETE n)
    DETACH DELETE con
    FOREACH(b IN botlist | CREATE (top)-[:Manage]->(b) )
    RETURN {result:true}
      `;
    tx.run(query, {idx_uuid:idx_uuid}).then(parser.parse)
    .then(result => { resolve(result) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'free/delete-graph-and-descendant.ctrl.js/delDocIndex'}); })
  })
}

/*
* Input: idx_uuid
* Output: true
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.idx_uuid)
  .then(() => {return miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) })
  .then(() => {return this.delDocIndex(tx, ps.idx_uuid) })
  .then( result => { utils.commit(session, tx, res, ps.uid, result[0]) })
  .catch(err =>{console.log(err); utils.fail(session,{status: err.status || 400, mess: err.mess || 'free/delete-graph-and-descendant.ctrl.js/main'}, res, tx)} )

};
