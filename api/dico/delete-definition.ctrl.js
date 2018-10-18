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
const commonData = require('../_models/common.data');
// CONTROLLERS -----------------------------------------------------------------
const ehg=require('./read-extend-head-graph.ctrl');

/*
* Input: tx, delete_uuid
* Output:
*/
module.exports.deleteDefinition = (tx, def_uuid)=>{
  // DELETE DOC CONTAINER TITLE NODES
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (n:Note{uuid:$def_uuid})
      DETACH DELETE n `;

    return tx.run(query, {def_uuid:def_uuid})
    .then(() => { resolve() })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_dico/delete-definition.ctrl.js/deleteDefinition'}); })
  })
}

/*
* Input: delete_uuid
* Output: true
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! delete definition ps',ps)

  validator.uuid(ps.def_uuid, 'ps.def_uuid')
  .then(() => miscellaneousReq.access2Note(tx, ps.uid, ps.def_uuid) )

  .then(() => this.deleteDefinition(tx, ps.def_uuid) )

  .then(() => utils.commit(session, tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'dico/delete-definition.ctrl.js/main'}, res, tx)} )

};
