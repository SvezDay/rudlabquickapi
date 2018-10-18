'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../../_services/token.service');
const driver = require('../../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
const bluebird = require('bluebird');
// SERVICES --------------------------------------------------------------------
const utils = require('../../_services/utils.service');
const validator = require('../../_services/validator.service');
let miscellaneous = require('../../_services/miscellaneous.request');
let graphReq = require('../../_services/graph.request');
// REQUEST ---------------------------------------------------------------------
// COMMON ----------------------------------------------------------------------
let common = require('../../_models/common.data');
// CONTROLLER ------------------------------------------------------------------
let urs = require('./update-recallable-state.ctrl');

module.exports.createCombination = (graph, model)=>{ // Input: graph{index,nodes[]}, model  |  Output: [{from, to, idx_uuid}]
  return new Promise((resolve, reject)=>{
    let comb = [];
    for (x of graph.nodes) {
      let myLabList = common.labelsCombinaison[model][x.code_label];
      if(!!myLabList.length){
        for (z of graph.nodes) {
          if(myLabList.includes(z.code_label)){
            // console.log("createCombination x.value", x.uuid);
            // console.log("createCombination z.value", z.uuid);
            comb.push({q:x.uuid, a:z.uuid, idx_uuid:graph.index.uuid})
          }
        }
      }
    }
    resolve(comb);
  })
}
let ii = 0;
module.exports.getDicoColumn = (tx, item_uuid)=>{
  // return ExtendColumnGraph
  return new Promise((resolve, reject)=>{
    ii++;
    let languageLabels = common.labels.filter(x=>x.type=="language").map(x=>x.code_label);

    let query = `
      WITH [] AS list
      MATCH (item:Note{uuid:$item_uuid})
      WITH list + item AS list, item
      OPTIONAL MATCH (item)-[*]->(ns:Note) WHERE ns.code_label in $labels
      WITH list + ns As list, ns
      UNWIND list AS listu
      RETURN COLLECT( DISTINCT {uuid:listu.uuid, code_label:listu.code_label} )
    `;
    // RETURN { notes:COLLECT( DISTINCT {uuid:ns.uuid, code_label:ns.code_label} ) }
    return tx.run(query, {item_uuid:item_uuid, labels:languageLabels}).then(parser.parse)
    .then(data => {
      if(ii==1) {
        // console.log('languageLabels', languageLabels)
        // console.log("getColumn data:", data[0])
      };
      return data;
    })
    .then(data => resolve(data[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/create-recall.ctrl/getColumn'}); })
  })
}
module.exports.getDicoRow = (tx, trad_uuid)=>{
  // Si et uniquement si une définition existe pour une traduction alors
  // return 2 combinations, (traduction -> definition et definition -> traduction)
  // sinon return un tableau vide
  return new Promise((resolve, reject)=>{
    let def_code_label = 5.2;
    let query = `
      MATCH (i:Index)-[]->(t:Title)-[]->(trad:Note{uuid:$trad_uuid})
      OPTIONAL MATCH (trad)-[]->(def:Note{code_label:$def_code_label})
      RETURN { trad:{uuid:trad.uuid}, def:{uuid:def.uuid}, index:{uuid:i.uuid} }
    `;
    return tx.run(query, {trad_uuid:trad_uuid, def_code_label:def_code_label}).then(parser.parse)
    // .then(data => {
    //   // if(!data.length){
    //   //   console.log("trad_uuid", trad_uuid)
    //   console.log("====================================================");
    //     console.log("getDicoRow data:", data);
    //   // }
    //   return data; })
    .then(data=> {
      // console.log("data of getDicoRow", data.length)
      //     console.log("trad_uuid", trad_uuid)
      if(!!data.length && !!data[0].def.uuid){
        // console.log("data of getDicoRow", data)
        resolve([{q:data[0].trad, a:data[0].def, idx_uuid:data[0].index.uuid}, {q:data[0].def, a:data[0].trad, idx_uuid:data[0].index.uuid}])
      }else{
        resolve([])
      }
    })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/create-recall.ctrl/getColumn'}); })
  })
}
module.exports.getRowCombinations = (tx, column)=>{
  // return 2 combinations, (traduction -> definition et definition -> traduction)
  // seulement si il y a des définition aux traductions, sinon rowCombinations est vide
  return new Promise((resolve, reject)=>{
    // console.log("column", column)
    let promises = [];
    let rowCombinations = [];
    for(var i=0; i<column.length; i++){
      let work = this.getDicoRow(tx, column[i].uuid)
      .then(d=> { if(!!d.length){ rowCombinations.push(d) } })
      promises.push(work);
    }

    Promise.all(promises)
    // .then(()=> {console.log("rowCombinations", rowCombinations); return rowCombinations} )
    // .then(()=>{ if(!rowCombinations.length){resolve()}else{resolve(rowCombinations)}})
    .then(()=> resolve(rowCombinations) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/create-recall.ctrl/getRowCombinations'}); })
  })
}
module.exports.getDicoItems = (tx, idx_uuid)=>{ // Return array of graphColumn
  // Return
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (i:Index{uuid:$idx_uuid})-[:Has]->(tit:Title)
      OPTIONAL MATCH (tit)-[:Has]->(items:Note)
      RETURN {index:{uuid:i.uuid, model:i.model}, items:COLLECT(DISTINCT {uuid:items.uuid, value:items.value, code_label:items.code_label})} `;
    tx.run(query, {idx_uuid:idx_uuid}).then(parser.parse)
    // .then(data=>{console.log("getDicoItems :: data:", data); return data; })
    .then(itemList=>{
      // itemList correspond aux premières notes d'un même model dico
        if(!!itemList[0].items.length){
          // console.log('itemList[0].items', itemList[0].items)
          let combinations = [];
          return bluebird.each(itemList[0].items, (x, i) => {
            // console.log("checker ", i)
            return this.getDicoColumn(tx, x.uuid)
            .then(column => {
              // console.log("column.length", column.length)
              if(column.length > 1){
                return this.createCombination({index:{uuid:idx_uuid}, nodes:column}, 'dico').then(cc=>combinations.push(cc)).then(()=>{return column})
              }else{
                return column;
              }
            })
            .then(column => {
              // Retourne un couple de combinaisons entre traduction et définition
              // console.log("=====================================================");
              // console.log('column', column)
              if(column.length > 1){
                return this.getRowCombinations(tx, column).then(rc => {if(!!rc.length){combinations.push(rc)} } )
              }
            })
          })
          // .then(()=> {console.log('list', combinations)} )
          .then(()=> {return combinations} )
        }else{
          // console.log("no items.length", itemList)
          return itemList;
        }
    })
    // .then(data=>{console.log("getAllColumn :: data:", data); return data; })
    .then(data => resolve(data) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/create-recall.ctrl/getAllColumn'}); })
  })
}
module.exports.getCombination = (tx, uid, idx_uuid, model)=>{ //  Input: idx_uuid  |  Output: [{from, to, idx_uuid}]
  // En fonction du modèle, la fonction fait appel aux sous fonction correspondante pour retourner une list de combinations
  return new Promise((resolve, reject)=>{
    let combs=[];
    Promise.resolve()
    .then(()=>{
      if(model=="blank"){
        return graphReq.getNodeGraph(tx, uid, idx_uuid)
        .then(graph => this.createCombination(graph, model) )
        .then(result => combs.push(...result) )
      }else if (model=="dico") {
        return this.getDicoItems(tx, idx_uuid)
        // .then(result=>{console.log("============== result", result); return result})
        .then(result => combs.push(...result) )
      }
    })
    .then(()=> resolve(combs))
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getCombination'}); })
  })
}
module.exports.createRecall = (tx, uid, idx_uuid, model)=> { // Input: uid, idx_uuid  |  Output: void
    return new Promise((resolve, reject)=>{
      let now = new Date().getTime();

      Promise.resolve()
      .then(()=> this.getCombination(tx, uid, idx_uuid, model) )
      .then(combs=>{

        // console.log("IN CreateRecall function, combs: ", combs)
        if(!!combs.length){
          let query = `MATCH (ir:IndexRecall{idx_uuid:$idx_uuid}) `
          for (let i = 0; i<combs.length; i++) {
              // console.log("combs[i] if length", combs[i])
              for(let y=0; y<combs[i].length; y++){
                query += `
                CREATE (r_${i}${y}:Recall {uuid:apoc.create.uuid(), q:'${combs[i][y].q}', a:'${combs[i][y].a}', level:0, deadline:toInteger($now), status:true })
                CREATE (ir)-[rel_${i}${y}:Recall]->(r_${i}${y}) `
              }
          }
          // console.log("query", query)
          return tx.run(query, {uid:uid, now:now, idx_uuid:idx_uuid})
        }else{
          // S'il n'y a pas de recall à créer alors Index Recall n'a pas lieu d'être cré
          return urs.updateRecallableState(tx, uid, idx_uuid, false, false);
        }

      })
      .then(() => resolve() )
      .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'recall/create-recall.ctrl.js/createRecall'}); })
    })
}
module.exports.main = (req, res, next)=>{ // Input: idx_uuid, model  |  Output: q, a
  let session = driver.session();
let tx = session.beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;
  // ps.now = new Date().getTime();

  let recall;
  validator.uuid(ps.idx_uuid, "ps.idx_uuid")
  .then(()=> miscellaneous.access2Any(tx, ps.uid, ps.idx_uuid))
  .then(()=> common.includeInModel(ps.model) )
  .then(() => this.createRecall(tx, ps.uid, ps.idx_uuid, ps.model) )

  .then(data => utils.commit(session, tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'recall/create-recall.ctrl.js/main'}, res, tx)} )
};
