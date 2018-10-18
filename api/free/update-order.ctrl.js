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
// CONTROLLER ------------------------------------------------------------------

/*
* Input: idx_uuid
* Output: note[uuid]
*/
module.exports.compareOrder = (tx, idx_uuid, orderList)=>{
  // COMPARE L'ORDRE POUR EMPECHER UN HACKING
  return new Promise((resolve, reject)=>{
    let orderStringified = orderList[0];
    let query = `
      MATCH p1=(idx{uuid:$idx_uuid})-[:Has]->(tit:Title)
      MATCH p2=(tit)-[:Has*]->(notes:Note)
      RETURN EXTRACT(x IN COLLECT( DISTINCT notes) | x.uuid)`;
    tx.run(query, {idx_uuid:idx_uuid}).then(parser.parse)
    .then(data => {
      // console.log("data", data)
      if(!!data[0].length && data[0].join('') != orderList.join('')){
        resolve();
      }else{
        throw {status: 403, mess: 'error:: isSameOrder()'};
      }
    })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'free/update-order.ctrl.js/compareOrder'}); })
  })
}
/*
* Input: idx_uuid
* Output: void
*/
module.exports.deleteOldRelation = (tx, idx_uuid, order_list)=>{
  // COMPARE L'ORDRE POUR EMPECHER UN HACKING
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH p1=(idx{uuid:$idx_uuid})-[:Has]->(tit:Title)
      MATCH p2=(tit)-[:Has*]->(notes:Note)
      FOREACH(r IN relationships(p2) | DELETE r)`;
    tx.run(query, {idx_uuid:idx_uuid}).then(parser.parse)
    .then(() => { resolve()})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'free/update-order.ctrl.js/deleteOldRelation'}); })
  })
}
/*
* Input: idx_uuid
* Output: void
*/
module.exports.createRelationOrder = (tx, idx_uuid, order_list)=>{
  return new Promise((resolve, reject)=>{
    let qOne = `MATCH p1=(idx{uuid:$idx_uuid})-[:Has]->(tit:Title) `;
    let qTwo = ` CREATE (tit)`;
    order_list.forEach((x, i) => {
      qOne += ` MATCH (x_${i}{uuid:'${x}'}) `;
      qTwo += `-[:Has]->(x_${i})`;
    })
    tx.run(qOne+qTwo, {idx_uuid:idx_uuid})
    .then(() => {resolve()})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'free/update-order.ctrl.js/createRelationOrder'}); })
  })
}
/*
* Input: idx_uuid, order_list
* Output: void
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();
  // console.log('ps', ps)

  validator.uuid(ps.idx_uuid)
  .then(()=> miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )
  .then(()=> this.compareOrder(tx, ps.idx_uuid, ps.order_list) )
  .then(()=> this.deleteOldRelation(tx, ps.idx_uuid) )
  .then(()=> this.createRelationOrder(tx, ps.idx_uuid, ps.order_list) )
  .then(()=> { utils.commit(session, tx, res, ps.uid) })
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'free/update-order.ctrl.js/main'}, res, tx)} )
};
