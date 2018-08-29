'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../_services/token.service');
const driver = require('../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
const bluemise = require('bluebird');
// SERVICES --------------------------------------------------------------------
const utils = require('../_services/utils.service');
const validator = require('../_services/validator.service');
// REQUEST ---------------------------------------------------------------------
const miscellaneousReq = require('../_services/miscellaneous.request');
const descendantReq = require('../_services/descendant.request');
const ancestorReq = require('../_services/ancestor.request');
const graphReq = require('../_services/graph.request');
// COMMON ----------------------------------------------------------------------
const commonData = require('../_models/common.data');
// CONTROLLER ------------------------------------------------------------------

/*
* Input: tx, uid, idx_uuid, destination_uuid
* Output: headGraph
*/
module.exports.moveWithDescendant = (tx, uid, idx_uuid, destination_uuid)=>{
  return new Promise((resolve, reject)=>{
    let query;
    if(!destination_uuid){
      query = `MATCH (dest:Person{uuid:$uid}) `;
    }else{
      query = `MATCH (dest{uuid:$destination_uuid}) WHERE dest:Title or dest:Note`;
    }
    query += `
      MATCH (n:Index{uuid:$idx_uuid})<-[rel]-(parent)
      OPTIONAL MATCH (n)<-[*]-(index:Index)
      CREATE (dest)-[:Manage]->(n)
      DELETE rel
      RETURN index limit 1 `;
    return tx.run(query, {uid:uid, idx_uuid:idx_uuid, destination_uuid:destination_uuid}).then(parser.parse)
    // .then(data=>{console.log('move data ======================================',data); return data;})
    .then(data => resolve(data[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'tree/move.ctrl.js/moveWithDescendant'}); })
  })
};
/*
* Input: idx_uuid, destination_uuid, withDescendant:boolean (actually only true)
* Output: headGraph
*/
module.exports.main = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let ps = req.body;
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.destination_uuid)
  .then(() => validator.uuid(ps.idx_uuid) )
  .then(() => miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )
  .then(() => miscellaneousReq.access2Any(tx, ps.uid, ps.destination_uuid) )
  .then(() => {
    if(ps.withDescendant){
      return this.moveWithDescendant(tx, ps.uid, ps.idx_uuid, ps.destination_uuid);
    }else{
      throw {status: 403, mess: err || 'ERROR on move tree cause no method for this job yet'}
    }
  })
  .then(data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'tree/move.ctrl.js/lose'}, res, tx)} )
};
