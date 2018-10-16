'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../../_services/token.service');
const driver = require('../../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
// SERVICES --------------------------------------------------------------------
const utils = require('../../_services/utils.service');
const validator = require('../../_services/validator.service');
// REQUEST ---------------------------------------------------------------------
let miscellaneous = require('../../_services/miscellaneous.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------
let uirnd = require('./update-index-recall-next-deadline.ctrl');
module.exports.getRecall = (tx, uid, idx_uuid)=>{ // Input: idx.uuid   |  Output: Recall || message
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();
    // let idxList = [];

    let one = `
      MATCH (p:Person{uuid:$uid})
      OPTIONAL MATCH (p)-[r1:Recall]->(ir:IndexRecall{idx_uuid:$idx_uuid})-[:Recall]->(r:Recall{status:true})
      WHERE r.deadline < $now `;
    let two = ` WITH ir, r, rand() AS random ORDER BY random RETURN {uuid:r.uuid, idx_uuid:ir.idx_uuid, level:r.level, q:r.q, a:r.a} LIMIT 1`;

    // Promise.resolve().then(()=>{
    //   if( idx ){
    //     //
    //     return this.getIdxDecendant(tx, uid, idx).then(result =>{
    //       one+= ` AND r.idx_uuid IN [split('${result}', ',')] `
    //     })
    //   }
    //   // console.log(one+two)
    // })
    // .then(()=> tx.run(one+two, {uid:uid, idx_uuid:idx.uuid, now:now}) ).then(parser.parse)
    return tx.run(one+two, {uid:uid, idx_uuid:idx_uuid, now:now}).then(parser.parse)
    // .then(recall => { console.log('recall', recall); return recall} )
    // .then(recall => {if(!recall.length){throw {status: 204, mess: 'no more card'}}else{resolve(recall[0])}  })
    .then(data=>resolve(data[0]))
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/run.ctrl.js/getRecall'}); })
  })
}

// Si un document de référence est donnée (idx) alors les recall à selectionner devront en être les déscendant
// module.exports.getIdxDecendant = (tx, uid, idx_uuid)=>{ // Input: ?   |  Output: [index]
//   return new Promise((resolve, reject)=>{
//     let query = `
//       WITH [] AS list
//       MATCH (p:Person{uuid:$uid})
//       MATCH (i:Index{uuid:$idx_uuid})
//       OPTIONAL MATCH (p)-[*]->(i)-[*]->(is:Index)
//       WITH i.uuid + list AS list, is
//       WITH COLLECT(DISTINCT is.uuid) + list AS list
//       return list
//     `;
//     tx.run(query, {uid:uid, idx_uuid:idx_uuid}).then(parser.parse)
//     // .then(data => {console.log('getIdxDecendant :: data: ', data); return data; })
//     .then(indexList => { resolve(indexList[0])})
//     .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/run.ctrl.js/getIdxDecendant'}); })
//   })
// }

/*
* Input: tx, recall
* Output: {q, a}
*/
// Retourne le couple Question / Reponse
module.exports.getQA = (tx, recall)=>{
  return new Promise((resolve, reject)=>{
    // console.log("getQA recall", recall.q)
    let query = `
      MATCH (q{uuid:$q})
      MATCH (a{uuid:$a})
      RETURN {q:{uuid:q.uuid, value:q.value, code_label:COALESCE(q.code_label, 1.1)}, a:{uuid:a.uuid, value:a.value, code_label:COALESCE(a.code_label, 1.1)}}
    `;
    // console.log("query", query)
    return tx.run(query, {q:recall.q, a:recall.a}).then(parser.parse)
    .then(result => resolve(result[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/run.ctrl.js/getQA'}); })
  })
}

module.exports.main = (req, res, next)=>{ // Input: idx_uuid  |  Output: {recall, q, a}
  let tx = driver.session().beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();
  // console.log('ps', ps)

  let recall;
  validator.uuid(ps.idx_uuid, "ps.idx_uuid")
  .then(()=> miscellaneous.access2Index(tx, ps.uid, ps.idx_uuid) )
  // .then(() => {return ps.hasOwnProperty('idx_uuid') ? validator.uuid(ps.idx_uuid, "ps.idx_uuid") : null} )

  .then(() => this.getRecall(tx, ps.uid, ps.idx_uuid) )
  .then(recall => {
    // console.log('recall 2', recall)
    //
    if(!!recall.uuid){
       return this.getQA(tx, recall)
       .then(data => {
         data.recall = {uuid:recall.uuid, level:recall.level};
         return data;
       })
    }else{
      return uirnd.updateIndexRecallNextDeadline(tx, ps.uid, ps.idx_uuid).then(()=>{
        return {stat:204};
      })
    }
  })
  // .then(data=>{console.log('data', data); return data; })
  .then(data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'recall/run.ctrl.js/main'}, res, tx)} )
};
