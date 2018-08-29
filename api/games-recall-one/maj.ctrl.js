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
// const descendantReq = require('../_services/descendant.request');
const recallReq = require('../_services/recall.request');
const graphReq = require('../_services/graph.request');
// COMMON ----------------------------------------------------------------------
const commonData = require('../_models/common.data');
// CONTROLLER ------------------------------------------------------------------


/*
* Input:
* Output: [recall]
*/
module.exports.getRecalls = (tx, uid)=>{
  return new Promise((resolve, reject)=>{
    let quer = `
      MATCH (p:Person{uuid:'${uid}'})
      MATCH (p)-[]->(r:Recall)
      RETURN collect(distinct r)
    `;
    tx.run(quer).then(parser.parse)
    .then(res => {console.log("getCourseIndex ", res); return res})
    .then(recalls => resolve(recalls[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getRecalls'}); })
  })
}
/*
* Input: tx, uid
* Output: [index]
*/
module.exports.getCourseIndex = (tx, uid)=>{
  return new Promise((resolve, reject)=>{
    // console.log('test on getCourseIndex ==========================================')
    let query = `
    MATCH (p:Person{uuid:$uid})
    MATCH (p)-[*]->(is:Index)-[]->(ts:Title)
    WHERE ts.course = true
    RETURN collect(distinct is) `;

    tx.run(query, {uid:uid}).then(parser.parse)
    // .then(res => {console.log("getCourseIndex ", res[0]); return res})
    .then(indexList => { resolve(indexList[0])})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getCourseIndexs'}); })
  })
}
/*
* Input: [index]
* Output: [{from, to, idx_uuid}]
*/
module.exports.getCombination = (tx, uid, indexList)=>{
  return new Promise((resolve, reject)=>{
    let combs=[];
    let allPromises = bluemise.each(indexList, i=>{
      console.log("index i:", i)
        if(i.model=="blank"){
          return graphReq.getNodeGraph(tx, uid, i.uuid)
          .then(graph => {console.log("graph", graph); return graph} )
          .then(graph => this.createCombination(tx, graph) )
          .then(result => {combs.push(...result)})
        }else if (i.model=="dico") {
          return graphReq.getAllColumn(tx, i.uuid)
          .then(arrays => {
            if(!!arrays.length){
              // Filtre pour retirer les array avec un seul node
              arrays = arrays.filter(x=> x.length>1);
              let promises = [];
              for(var i=0; i<arrays.length; i++){
                promises.push( this.createCombination(tx, arrays[i]) )
              }
              return Promise.all(promises).then(data=> {combs.push(...data)})
            }else{
              return;
            }
          })
        }
    })
    allPromises.then(()=>{ resolve(combs) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getCombination'}); })
  })
}

/*
* Input: graph{index,nodes[]}
* Output: [{from, to, idx_uuid}]
*/
module.exports.createCombination = (tx, graph)=>{
  return new Promise((resolve, reject)=>{
    console.log('graph', graph)
    let comb = [];
    for (x of graph.nodes) {
      let myLabList = commonData.labelsCombinaison[x.code_label];
      if(!!myLabList.length){
        for (z of graph.nodes) {
          // console.log('coe label', x.code_label)
          // console.log('myLabList', myLabList)
          if(myLabList.includes(z.code_label)){
            comb.push({from:x.uuid, to:z.uuid, idx_uuid:graph.index.uuid})
          }
        }
      }
    }
    // console.log('comb', comb)
    resolve(comb);
  })
}

/*
* Input: [{from, to, idx_uuid}], [recall]
* Output: [{from, to, idx_uuid}]
*/
module.exports.getRecall2Create = (combinations, recalls)=>{
  return new Promise((resolve, reject)=>{
    let list = [];
    for (c of combinations) {
      let exist = false;
      for (r of recalls) {
        if(c.from == r.from && c.to == r.to){
          exist = true;
        }
      }
      !exist ? list.push(c) : null
    }
    resolve(list);
  })
}

/*
* Input: [{from, to, idx_uuid}], [recall]
* Output: [recall]
*/
module.exports.getRecall2Delete = (combinations, recalls)=>{
  return new Promise((resolve, reject)=>{
    let list = [];
    for (r of recalls) {
      let exist = false;
      for (c of combinations) {
        if(r.from == c.from && r.to == c.to){
          exist = true;
        }
      }
      !exist ? list.push(r) : null
    }
    resolve(list);
  })
}

/*
* Input: void // but step next: idx_uuid
* Output: void
*/
module.exports.main = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();
  // console.log('=================================================================')
  // console.log('ps', ps)

  let combinationList=[]
    , recallList=[]
    , deleteRecallList=[]

  this.getCourseIndex(tx, ps.uid)
  // .then(result => {console.log("getCourseIndex ", result); return result})
  .then(result => { if(!!result.length) {return result} else {throw {status: 200}} })
  .then(indexList => this.getCombination(tx, ps.uid, indexList) )
  .then(result => {console.log("getCombination ", result); return result})
  .then(result => { if(!!result) {combinationList = result} else {throw {status: 200}} })
  .then(() => this.getRecalls(tx, ps.uid) )
  // .then(result => {console.log("getCourseIndex ", result); return result})
  .then(result => { recallList = result })

  .then(()=> this.getRecall2Create(combinationList, recallList))
  // .then(result => {console.log("getRecall2Create ", result); return result})
  .then(list=> { return !!list.length ? recallReq.createRecall(tx, ps.uid, list) : null })

  .then(()=> this.getRecall2Delete(combinationList, recallList))
  // .then(result => {console.log("getRecall2Delete ", result); return result})
  .then(list=> { return !!list.length ? recallReq.deleteRecall(tx, list) : null })
  // .then(result => { if(!!result) {return result} else {throw {status: 200}} })
  // .then(list=> {return recallReq.deleteRecall(tx, list)})

  .then(() => utils.commit(tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'games-recall-one/maj.ctrl.js/main'}, res, tx)} )
};
