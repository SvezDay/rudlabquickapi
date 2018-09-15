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
let common = require('../../_models/common.data');
// CONTROLLER ------------------------------------------------------------------
let updateRecallableState = require('./update-recallable-state.ctrl').updateRecallableState;
module.exports.isRecallExist = ()=>{

}

module.exports.getCombinationByIndexList = (tx, uid, indexList)=>{ //  Input: [index]  |  Output: [{from, to, idx_uuid}]
  return new Promise((resolve, reject)=>{
    let combs=[];
    let allPromises = bluemise.each(indexList, i=>{
      // console.log("index i:", i)
        if(i.model=="blank"){
          return graphReq.getNodeGraph(tx, uid, i.uuid)
          // .then(graph => {console.log("graph", graph); return graph} )
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
    allPromises.then(()=>{
      // createRecall for each index
    })
    .then(()=>{ resolve(combs) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getCombination'}); })
  })
}
module.exports.getCombination = (tx, uid, idx_uuid, model)=>{ //  Input: idx_uuid  |  Output: [{from, to, idx_uuid}]
  return new Promise((resolve, reject)=>{
    // console.log("model", model)
    let combs=[];
    Promise.resolve()
    .then(()=>{
      if(model=="blank"){
        return graphReq.getNodeGraph(tx, uid, idx_uuid)
        // .then(graph => {console.log("graph", graph); return graph} )
        .then(graph => this.createCombination(tx, graph, model) )
        .then(result => combs.push(...result) )
      }else if (model=="dico") {
        return graphReq.getAllColumn(tx, idx_uuid)
        .then(arrays => {
          if(!!arrays.length){
            // Filtre pour retirer les array avec un seul node
            arrays = arrays.filter(x=> x.length>1);
            let promises = [];
            for(var i=0; i<arrays.length; i++){
              promises.push( this.createCombination(tx, arrays[i], model) )
            }
            return Promise.all(promises).then(data=> {combs.push(...data)})
          }else{
            return;
          }
        })
      }
    })
    // .then(()=> console.log('combs', combs))
    // .then(()=> console.log("idx"))
    .then(()=> resolve(combs))
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getCombination'}); })
  })
}

module.exports.createCombination = (tx, graph, model)=>{ // Input: graph{index,nodes[]}  |  Output: [{from, to, idx_uuid}]
  return new Promise((resolve, reject)=>{
    // console.log('graph', graph)
    // console.log("==========================================================")
    // console.log("model", model)
    // console.log(common.labelsCombinaison)
    let comb = [];
    for (x of graph.nodes) {
      let myLabList = common.labelsCombinaison[model][x.code_label];
      if(!!myLabList.length){
        for (z of graph.nodes) {
          // console.log('coe label', x.code_label)
          // console.log('myLabList', myLabList)
          if(myLabList.includes(z.code_label)){
            comb.push({q:x.uuid, a:z.uuid, idx_uuid:graph.index.uuid})
          }
        }
      }
    }
    // console.log('comb', comb)
    resolve(comb);
  })
}


module.exports.createRecall = (tx, uid, idx_uuid, model)=> { // Input: uid, idx_uuid  |  Output: void
    return new Promise((resolve, reject)=>{
      let now = new Date().getTime();
      Promise.resolve()
      .then(()=> this.getCombination(tx, uid, idx_uuid, model) )
      .then(combs=>{
        if(!!combs.length){
          let query = `MATCH (ir:IndexRecall{idx_uuid:$idx_uuid}) `
          for (let i = 0; i<combs.length; i++) {
            query += `
            CREATE (r_${i}:Recall {uuid:apoc.create.uuid(), q:'${combs[i].q}', a:'${combs[i].a}', level:0, deadline:toInteger($now), status:true })
            CREATE (ir)-[rel_${i}:Recall]->(r_${i}) `
          }
          return tx.run(query, {uid:uid, now:now, idx_uuid:idx_uuid})
        }else{
          // S'il n'y a pas de recall à créer alors Index Recall n'a pas être cré
          return updateRecallableState(tx, idx_uuid, false, false);
        }

      })
      .then(() => resolve() )
      .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/create-recall.ctrl.js/createRecall'}); })
    })
}


module.exports.main = (req, res, next)=>{ // Input: idx_uuid, model  |  Output: q, a
  let tx = driver.session().beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();

  let recall;
  validator.uuid(ps.idx_uuid, "ps.idx_uuid")
  .then(()=> miscellaneous.access2Any(tx, ps.uid, ps.idx_uuid))
  .then(()=> common.includeInModel(ps.model) )
  .then(() => this.createRecall(tx, ps.uid, ps.idx_uuid, ps.model) )

  .then(data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'recall/create-recall.ctrl.js/main'}, res, tx)} )
};
