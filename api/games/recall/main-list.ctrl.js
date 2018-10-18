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
let graph = require('../../_services/graph.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------



module.exports.mainList = (tx, uid)=>{
  // Return la list des index et title des document ayant course true and 1 ou plus de deadline
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();

    let one =
      `MATCH (pers:Person{uuid:$uid})
      OPTIONAL MATCH (pers)-[:Recall]->(ir:IndexRecall) WHERE ir.nextDeadline < $now
      RETURN COLLECT( DISTINCT {idx_uuid:ir.idx_uuid})`;

      tx.run(one, {uid:uid, now:now}).then(parser.parse)
    .then(data => {
      console.log("first data", data)
      console.log("now", now)
      if(!!data[0].length){
        let list = [];
        let promises = [];
        for(var i=0; i<data[0].length; i++){
          promises.push( graph.getHeadGraph(tx, data[0][i].idx_uuid).then(data => list.push(data)) );
        }
        return Promise.all(promises).then(() => {return list});
      }else{
        return [];
      }
    })
    .then(data=>{console.log("data", data); return data; })
    .then(data=> resolve(data) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/main-list.ctrl.js/mainList'}); })
  })
}
// module.exports.mainList = (tx, uid)=>{
//   // Return la list des index et title des document ayant course true and 1 ou plus de deadline
//   return new Promise((resolve, reject)=>{
//     let now = new Date().getTime();
//
//     let one =
//     `MATCH (pers:Person{uuid:$uid})
//     MATCH p=(pers)-[*]->(i:Index)-[:Has]->(:Title{recallable:true})
//     WITH collect(p) as ps
//     CALL apoc.convert.toTree(ps) yield value
//     return value`
//
//       tx.run(one, {uid:uid, now:now}).then(parser.parse)
//     // .then(recall => { console.log('recall', recall); return recall} )
//     // .then(recall => {if(!recall.length){throw {status: 204, mess: 'no more card'}}else{resolve(recall[0])}  })
//     .then(data=>resolve(data[0].manage))
//     .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/main-list.ctrl.js/mainList'}); })
//   })
// }

module.exports.convertToDeveloppedTree = (data)=>{
  return new Promise((resolve, reject)=>{
    let list = [];
    let pp = "";
    // console.log('========================================================')
    // console.log("data", data)
    let recursive =(data,  pp)=>{
      return new Promise((resolve, reject)=>{
        let promises = [];
        for(var i=0; i<data.length; i++){
          promises.push(pushList(data[i], pp))
        }
        Promise.all(promises).then(()=>resolve())
      })
    }

    let pushList = (data, pp)=>{
      return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
          if(!!pp.length){
            pp+=" | "+data.has[0].value;
          }else{
            pp=data.has[0].value;
          }
          list.push({ index:{uuid:data.uuid, model:data.model}, title:{uuid:data.has[0].uuid, value:data.has[0].value, course:data.has[0].course}, path: pp})
        }).then(()=> {
          if(data.has[0].hasOwnProperty('manage')){
            return recursive(data.has[0].manage, pp)
          }
        })
        .then(()=>resolve())
      })
    }
    Promise.resolve()
    .then(()=>{
      return recursive(data, pp)
    })
    .then(()=>resolve(list))
  })
}

module.exports.main = (req, res, next)=>{
  let session = driver.session();
let tx = session.beginTransaction();
  let ps = req.headers;

  ps.uid = req.decoded.uuid;
  this.mainList(tx, ps.uid)
  // .then(data=> this.convertToDeveloppedTree(data))
  .then(data => utils.commit(session, tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'recall/main-list.ctrl.js/main'}, res, tx)} )
};
