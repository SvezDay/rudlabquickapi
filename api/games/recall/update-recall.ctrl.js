'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../../_services/token.service');
const driver = require('../../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
// SERVICES --------------------------------------------------------------------
const utils = require('../../_services/utils.service');
const validator = require('../../_services/validator.service');
let miscellaneous = require('../../_services/miscellaneous.request');
let graphReq = require('../../_services/graph.request');
// REQUEST ---------------------------------------------------------------------
// COMMON ----------------------------------------------------------------------
// let commonData = require('../_models/common.data');
// CONTROLLER ------------------------------------------------------------------
let deleteRecall = require('./delete-recall.ctrl').deleteRecall;
let getCombinations = require('./create-recall.ctrl');

module.exports.getRecalls = (tx, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    let quer = `
      MATCH (ir:IndexRecall{idx_uuid:$idx_uuid})
      MATCH (ir)-[]->(rs:Recall)
      RETURN collect(distinct rs)
    `;
    tx.run(quer, {idx_uuid:idx_uuid}).then(parser.parse)
    // .then(res => {console.log("getCourseIndex ", res); return res})
    .then(recalls => resolve(recalls[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getRecalls'}); })
  })
}

module.exports.updateRecall = (tx, uid, idx_uuid, note_uuid, code_label)=> { // Input: comb:{q,a}  |  Output: void
    return new Promise((resolve, reject)=>{
      let now = new Date().getTime();
      let recalls = [];
      let combinations = [];
      let newCombinations= [];

      this.deleteRecall(tx, ps.note_uuid)
      .then(() => this.getRecall(tx, idx_uuid) )
      .then(data=> recalls = data )
      .then(()=> this.createRecall.getCombination(tx, uid, idx_uuid) )
      .then(data=> combinations = data )
      .then(()=>{
        for(var i=0; combinations.length; i++){
          let exist=false;
          for(var j=0; recalls.length; j++){
            if((combinations[i].q == recalls[j].q && combinations[i].a == recalls[j].a)){
              exist=true;
            }
          }
          if(!exist){
            newCombinations.push(combinations[i]);
          }
        }
      })
      .then(()=>{
        if(!!newRecalls.length){
          return this.createRecall.createRecall(tx, idx_uuid, newRecalls)
        }
      })
      .then(() => resolve() )
      .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/update-recall.ctrl.js/updateRecall'}); })
    })
}


module.exports.main = (req, res, next)=>{ // Input: idx_uuid, note_uuid, code_label  |  Output: void
  let session = driver.session();
let tx = session.beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.note_uuid, "ps.note_uuid")
  then(()=> validator.uuid(ps.idx_uuid, "ps.idx_uuid") )
  .then(()=> miscellaneous.access2Note(tx, ps.uid, ps.note_uuid))
  .then(()=> miscellaneous.access2Index(tx, ps.uid, ps.idx_uuid))

  .then(() => this.updateRecall(tx, ps.uid, ps.idx_uuid, ps.note_uuid, ps.code_label) )

  .then(() => utils.commit(session, tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'recall/update-recall.ctrl.js/main'}, res, tx)} )
};
