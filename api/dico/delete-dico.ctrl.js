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

/*
* Input: idx_uuid
* Output: {result:true}
*/
module.exports.deleteDico = (tx, idx_uuid)=>{
  // DELETE DOC CONTAINER TITLE NODES
  return new Promise((resolve, reject)=>{
    const query = `
    MATCH (idx:Index{uuid:$idx_uuid})
    OPTIONAL MATCH (top)-[:Manage]->(idx) WHERE top:Note OR top:Title OR top:Person
    OPTIONAL MATCH (idx)-[:Has|:Linked*]->(collection) WHERE collection:Title OR collection:Note
    OPTIONAL MATCH (idx)-[*]->(bot:Index)
    WITH idx, top, collect(distinct collection) AS collectionlist, collect(distinct bot) AS botlist
    FOREACH(n IN collectionlist | DETACH DELETE n)
    DETACH DELETE idx
    FOREACH(b IN botlist | CREATE (top)-[:Manage]->(b) )
    RETURN {result:true} `;

    return tx.run(query, {idx_uuid:idx_uuid}).then(parser.parse)
    .then(result => { resolve(result) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_dico/delete-dico.ctrl.js/deleteDico'}); })
  })
}

/*
* Input: index
* Output: true
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! delete dico ps',ps)

  validator.uuid(ps.idx_uuid)
  .then(() => miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )
  .then(() => this.deleteDico(tx, ps.idx_uuid) )
  .then(() => utils.commit(session, tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'dico/delete-dico.ctrl.js/main'}, res, tx)} )

};
