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
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------
/*
* Input: idx.uuid || null
* Output: Recall || message
*/
module.exports.getRecall = (tx, uid, idx)=>{
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();
    let idxList = [];

    let one = `
      MATCH (p:Person{uuid:$uid})
      OPTIONAL MATCH (p)-[]->(r:Recall)
      WHERE r.status = true
      AND r.deadline < ${now} `;
    let two = ` WITH r, rand() AS random ORDER BY random RETURN {uuid:r.uuid, idx_uuid:r.idx_uuid, level:r.level, from:r.from, to:r.to} LIMIT 1`;

    Promise.resolve().then(()=>{
      if( idx ){
        return this.getIdxDecendant(tx, uid, idx).then(result =>{
          one+= ` AND r.idx_uuid IN [split('${result}', ',')] `
        })
      }
      // console.log(one+two)
    })
    .then(()=> tx.run(one+two, {uid:uid}) ).then(parser.parse)
    // .then(recall => { console.log('recall', recall); return recall} )
    // .then(recall => {if(!recall.length){throw {status: 204, mess: 'no more card'}}else{resolve(recall[0])}  })
    .then(data=>resolve(data[0]))
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/run.ctrl.js/getRecall'}); })
  })
}

/*
* Input:
* Output: [index]
*/
// Si un document de référence est donnée (idx) alors les recall à selectionner devront en être les déscendant
module.exports.getIdxDecendant = (tx, uid, idx)=>{
  return new Promise((resolve, reject)=>{
    let query = `
      WITH [] AS list
      MATCH (p:Person{uuid:$uid})
      MATCH (i:Index{uuid:$idx})
      OPTIONAL MATCH (p)-[*]->(i)-[*]->(is:Index)
      WITH i.uuid + list AS list, is
      WITH COLLECT(DISTINCT is.uuid) + list AS list
      return list
    `;
    tx.run(query, {uid:uid, idx:idx}).then(parser.parse)
    .then(data => {console.log('getIdxDecendant :: data: ', data); return data; })
    .then(indexList => { resolve(indexList[0])})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/run.ctrl.js/getIdxDecendant'}); })
  })
}

/*
* Input: tx, recall
* Output: {from, to}
*/
// Retourne le couple Question / Reponse
module.exports.getQA = (tx, recall)=>{
  return new Promise((resolve, reject)=>{
    // console.log("getQA recall", recall.from)
    let query = `
      MATCH (from{uuid:$from})
      MATCH (to{uuid:$to})
      RETURN {from:{uuid:from.uuid, value:from.value, code_label:COALESCE(from.code_label, 1.1)}, to:{uuid:to.uuid, value:to.value, code_label:COALESCE(to.code_label, 1.1)}}
    `;
    // console.log("query", query)
    return tx.run(query, {from:recall.from, to:recall.to}).then(parser.parse)
    .then(result => resolve(result[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/run.ctrl.js/getQA'}); })
  })
}

/*
* Input:
* Output: {recall, from, to}
*/
module.exports.main = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();

  let recall;
  validator.uuid(ps.uid, "ps.uid")
  .then(() => {return ps.hasOwnProperty('idx_uuid') ? validator.uuid(ps.idx_uuid, "ps.idx_uuid") : null} )

  .then(() => this.getRecall(tx, ps.uid, ps.idx_uuid) )
  .then(recall => {
    // console.log('recall 2', recall)
    if(!!recall.uuid){
       return this.getQA(tx, recall)
       .then(data => {
         data.recall = {uuid:recall.uuid, level:recall.level};
         return data;
       })
    }else{
      return {stat:204};
    }
  })
  .then(data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'games-recall-one/run.ctrl.js/main'}, res, tx)} )
};
