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
* Input: tx, traduction_uuid
* Output: {result:true}
*/
module.exports.getTraductionEnvironnement = (tx, traduction_uuid)=>{
  // DELETE DOC CONTAINER TITLE NODES
  return new Promise((resolve, reject)=>{
    let defCode = commonData.getLabelByDesignation("Definition").code_label;
    let labelList = commonData.getLabelsByType("language").map(x=>x.code_label)
    let query = `
      MATCH (parent)-[]->(n:Note{uuid:$traduction_uuid})
      OPTIONAL MATCH (n)-[]->(def:Note) WHERE def.code_label = $defCode
      OPTIONAL MATCH (n)-[]->(child:Note) WHERE child.code_label IN $labelList
      RETURN {traduction_uuid:n.uuid, parent_uuid:parent.uuid, definition_uuid:def.uuid, child_uuid:child.uuid} `;

    return tx.run(query, {traduction_uuid:traduction_uuid, defCode:defCode, labelList:labelList}).then(parser.parse)
    // .then(data=>{ console.log('----------------------------- getTraductionEnvironnement', data); return data})
    .then(data => { resolve(data[0]) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_dico/delete-traduction.ctrl.js/getTraductionEnvironnement'}); })
  })
}
/*
* Input: tx, env:traductionEnvironnement
* Output: {result:true}
*/
module.exports.deleteTraduction = (tx, env)=>{
  // DELETE DOC CONTAINER TITLE NODES
  return new Promise((resolve, reject)=>{
    let query =` MATCH (n:Note{uuid:$traduction_uuid}) DETACH DELETE n `;
    if(!!env.definition_uuid){
      query+=` WITH 'not_need_a_with_between' as checking  MATCH (def:Note{uuid:$definition_uuid}) DETACH DELETE def  `;
    }
    if(!!env.child_uuid){
      query+= ` WITH 'need_a_with_between' as checked MATCH (parent{uuid:$parent_uuid}) MATCH (child:Note{uuid:$child_uuid}) CREATE (parent)-[:Has]->(child) `;
    }
    // query+=` RETURN {parent:{}}`
    return tx.run(query, env)
    .then(() => { resolve() })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_dico/delete-traduction.ctrl.js/deleteTraduction'}); })
  })
}

/*
* Input: traduction_uuid
* Output: true
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! delete traduction ps',ps)

  validator.uuid(ps.traduction_uuid)
  .then(() => miscellaneousReq.access2Note(tx, ps.uid, ps.traduction_uuid) )

  .then(() => this.getTraductionEnvironnement(tx, ps.traduction_uuid) )
  .then(data => this.deleteTraduction(tx, data) )

  .then(() => utils.commit(session, tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'dico/delete-traduction.ctrl.js/main'}, res, tx)} )

};
