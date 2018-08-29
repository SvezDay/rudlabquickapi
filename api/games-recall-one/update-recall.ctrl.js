'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../_services/token.service');
const driver = require('../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
const bluebird = require('bluebird');
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


module.exports.getRecalls = (tx, uid)=>{
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (p:Person{uuid:$uid})
      MATCH (p)-[]->(r:Recall)
      RETURN collect(distinct r)    `;
    tx.run(query, {uid:uid}).then(parser.parse)
    // .then(res => {console.log("getCourseIndex ", res); return res})
    .then(recalls => resolve(recalls[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getRecalls'}); })
  })
}

module.exports.getDocumentIndex = (tx, uid)=>{
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (p:Person{uuid:$uid})
      OPTIONAL MATCH (p)-[*]->(is:Index)-[:Has]->(t:Title{course:true})
      RETURN COLLECT(distinct {uuid:is.uuid, model:is.model}) `;
    tx.run(query, {uid:uid}).then(parser.parse)
    // .then(res => {console.log("getCourseIndex ", res); return res})
    .then(recalls => resolve(recalls[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getRecalls'}); })
  })
}

module.exports.getBlankNodes = (tx, idx_uuid)=>{
  // GET INDEX'S TITLE AND NODES
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH path=(i:Index{uuid:$idx_uuid})
      OPTIONAL MATCH (i)-[:Has*]->(ns) WHERE (ns:Note OR ns:Title) COALESCE(ns.code_label, 1.1) <> 'Undefined'
      RETURN { index: {uuid: i.uuid, model:i.model}, nodes:COLLECT(DISTINCT {uuid:ns.uuid, value:ns.value, code_label:COALESCE(ns.code_label, 1.1)}) } `;
    tx.run(query, {uid:uid, idx_uuid:idx_uuid}).then(parser.parse)
    // .then(data => { console.log("data getNodeGraph: ", data); return data; })
    .then(data => { resolve(data[0])})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/graph.request.js/getNodeGraph'}); })
  })
}

module.exports.getBlankNodes = (tx, idx_uuid)=>{
  // GET INDEX'S TITLE AND NODES
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH path=(i:Index{uuid:$idx_uuid})
      OPTIONAL MATCH (i)-[:Has*]->(ns) WHERE (ns:Note OR ns:Title) COALESCE(ns.code_label, 1.1) <> 'Undefined'
      RETURN { index: {uuid: i.uuid, model:i.model}, nodes:COLLECT(DISTINCT {uuid:ns.uuid, value:ns.value, code_label:COALESCE(ns.code_label, 1.1)}) } `;
    tx.run(query, {uid:uid, idx_uuid:idx_uuid}).then(parser.parse)
    // .then(data => { console.log("data getNodeGraph: ", data); return data; })
    .then(data => { resolve(data[0])})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/graph.request.js/getNodeGraph'}); })
  })
}

module.exports.listing = (tx, item_uuid)=>{ // Return specific graphColumn
  return new Promise((resolve, reject)=>{
    let labels = commonData.getLabelsByType("language").map(x=>x.code_label);
    let one = `
    MATCH (item:Note{uuid:$item_uuid})
    OPTIONAL MATCH (item)-[:Has*]->(trad:Note) WHERE trad.code_label IN $labels
    WITH COUNT(trad) as count
    CALL apoc.do.when(count>0
      ," WITH [] AS list MATCH (item:Note{uuid:{item_uuid}})-[:Has*]->(trad:Note) WHERE trad.code_label IN {labels} WITH list + {uuid:item.uuid, code_label:item.code_label} AS list, trad WITH list + COLLECT(DISTINCT {uuid:trad.uuid, code_label:trad.code_label}) AS list RETURN list"
      ," WITH [] AS list MATCH (item:Note{uuid:{item_uuid}}) WITH list + {uuid:item.uuid, code_label:item.code_label} AS list RETURN list"
      , {item_uuid:$item_uuid, labels:$labels}) YIELD value
    RETURN value.list
    `;
    // console.log("query labels:",item_uuid)
    // console.log("query labels:",labels)
    // console.log("query labels:",one)
    return tx.run(one, {item_uuid:item_uuid, labels:labels}).then(parser.parse)
    // .then(data=>{console.log("listing:: data:", data); return data; })
    .then(data=> resolve(data[0]))
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/graph.request.js/listing'}); })
  })
}
// GET CONTAINER'S TITLE AND NODES
module.exports.getAllColumn = (tx, idx_uuid)=>{ // Return array of graphColumn
  return new Promise((resolve, reject)=>{

    let query = `
      MATCH (i:Index{uuid:$idx_uuid})-[:Has]->(tit:Title)
      OPTIONAL MATCH (tit)-[:Has]->(items:Note)
      RETURN {index:{uuid:i.uuid, model:i.model}, items:COLLECT(DISTINCT {uuid:items.uuid, value:items.value, code_label:items.code_label})} `;

    tx.run(query, {idx_uuid:idx_uuid}).then(parser.parse)
    // .then(data=>{console.log("getAllColumn :: data:", data); return data; })
    .then(itemList=>{
        if(!!itemList[0].items.length){

          let list = itemList[0];
          // console.log('list', list)
          return bluebird.each(itemList[0].items, (x, i) => {
            // console.log('itemList[0].items x', x)
            return this.listing(tx, x.uuid)
            .then(data => {
              // console.log('listing result data', data.length)
              list.items[i].nodes = data;
              // console.log('listing result list.items[i]', list.items[i].nodes.length)
            })
          })
          // .then(()=> {console.log('list', list)} )
          .then(()=> {return list} )
        }else{
          return itemList;
        }
    })
    // .then(data=>{console.log("getAllColumn :: data:", data.items[0].nodes); return data; })
    .then(data => resolve(data) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/graph.request.js/getHeadGraph'}); })
  })
}

module.exports.createCombinationFromBlank = (tx, graph)=>{ // Return specific graphColumn
  return new Promise((resolve, reject)=>{
    let comb = [];
    Promise.resolve()
    .then(()=>{
        for (x of graph.nodes) {
          let myLabList = commonData.labelsCombinaison[x.code_label];
          if(!!myLabList.length){
            for (z of graph.nodes) {
              if(myLabList.includes(z.code_label)){
                comb.push({from:x.uuid, to:z.uuid, idx_uuid:graph.index.uuid})
              }
            }
          }
        }
    })
    .then(()=> resolve(comb) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/graph.request.js/getHeadGraph'}); })
  })
}

module.exports.createCombinationFromColumnDico = (tx, column, idx)=>{ // Return specific graphColumn
  return new Promise((resolve, reject)=>{
    let comb = [];
    // console.log(" in createCombinationFromColumnDico:: column: ", column)
    Promise.resolve()
    .then(()=>{
      if(!!column.length){
        for (x of column) {
          let myLabList = commonData.labelsCombinaison.dico[x.code_label];
          // console.log("check code label de x", column)
          if(!!myLabList.length){
            for (z of column) {
              if(myLabList.includes(z.code_label)){
                comb.push({from:x.uuid, to:z.uuid, idx_uuid:idx})
              }
            }
          }
        }
      }
    })
    // .then(() => {console.log("createCombinationFromColumnDico combs", comb); })
    .then(()=> resolve(comb) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/graph.request.js/getHeadGraph'}); })
  })
}

module.exports.createCombination = (tx, documentIndex)=>{
  return new Promise((resolve, reject)=>{
    let combinations = [];

    const flatten = function(arr, result = []) {
      for (let i = 0, length = arr.length; i < length; i++) {
        const value = arr[i];
        if (Array.isArray(value)) {
          flatten(value, result);
        } else {
          result.push(value);
        }
      }
      return result;
    };

    // console.log("documentIndex", documentIndex)
    if(!!documentIndex.length){
      let blankIndex = documentIndex.filter(x=>x.model=='blank');
      let dicoIndex = documentIndex.filter(x=>x.model=='dico');
      let combinations = [];

      bluebird.each(blankIndex, x => {
        return this.getBlankNodes(tx, x.uuid)
        .then(graph => this.createCombinationFromBlank(tx, graph) )
        .then(combs => combinations.push( combs ) )
      })
      .then(() => {
        // console.log("dicoIndex", dicoIndex)
          return bluebird.each(dicoIndex, x => {
            // console.log("dicoIndex x", x)
            let dicoComb = [];
            return this.getAllColumn(tx, x.uuid)
            .then(arrays => {
              if(!!arrays.items.length){

                return bluebird.each(arrays.items, (item, i_item) => {
                  // console.log("check note avant de l'envoyer item", item)
                  return this.createCombinationFromColumnDico(tx, item.nodes, x.uuid)
                  .then(combs => {
                    // Filtre pour retirer les array avec un seul node
                    if(!!combs.length){
                      // console.log("getAllColumn arrays", combs)
                      dicoComb = dicoComb.concat( combs )
                    }
                  })
                })
              }
            }).then(()=>{ combinations.push( dicoComb ) })
          })
      })
      // .then(() => {console.log("createCombination combination", combinations); })
      .then(()=> resolve( flatten(combinations) ) )
      .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getRecalls'}); })
    }else{
      Promise.resolve(combinations);
    }
  })
}

module.exports.compareRecallCombination = (tx, recalls, combinations)=>{
  return new Promise((resolve, reject)=>{
    let del = [];
    let cre = [];
    // console.log("compareRecallCombination combinations ", combinations);
    // Loop pour selectionner les recall to delete
    for(var i=0; i<recalls.length; i++){
      let keep = false;
      // console.log("recalls", recalls[i])
      for(var j=0; j<combinations.length; j++){
        // console.log("combinations", combinations[i])
        if(recalls[i].to == combinations[j].to && recalls[i].from == combinations[j].from){
          keep = true;
        }
      }
      if(!keep){
        del.push(recalls[i]);
      }
    }
    // console.log("combinations[i]", combinations)

    // Loop pour selectionner les combinations to create
    for(var i=0; i<combinations.length; i++){
      let create = true;
      for(var j=0; j<recalls.length; j++){
        if(recalls[j].to == combinations[i].to && recalls[j].from == combinations[i].from){
          create = false;
        }
      }
      if(create){
        cre.push(combinations[i]);
      }
    }

    Promise.resolve()
    .then(() => resolve({delete:del, create:cre}) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getRecalls'}); })
  })
}

module.exports.deleteRecalls = (tx, recalls)=>{
  return new Promise((resolve, reject)=>{
    let list = recalls.map(x=> x.uuid)
    let query = `
      MATCH (rs:Recall) WHERE rs.uuid IN $list
      DETACH DELETE rs `;
    tx.run(query, {list:list})
    .then(() => resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getRecalls'}); })
  })
}

module.exports.selectCombinationToCreate = (tx, uid, combinations)=>{
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();
    // console.log("selectCombinationToCreate combinations", combinations)
    if(!!combinations.length){
      let one = ` MATCH (p:Person{uuid:$uid}) `;
      let two = "";
      for(var i=0; i<combinations.length; i++){
          // for(var j=0; j<combinations[i].length; j++){
          //   // console.log("check params combinations", combinations[i])
          // }
          one+= ` CREATE (r${i}:Recall{uuid:apoc.create.uuid(), to:'${combinations[i].to}', from:'${combinations[i].from}', idx_uuid:'${combinations[i].idx_uuid}', deadline:$now, status:true, level:0 }) `;
          two+= ` CREATE (p)-[rel${i}:Recall]->(r${i})`
      }

      return tx.run(one+two, {uid:uid, now:now})
      .then(() => resolve() )
      .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/maj.ctrl.js/getRecalls'}); })
    }else{
      resolve();
    }
  })
}

module.exports.main = (req, res, next)=>{ // params: none // return void
  let tx = driver.session().beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;
  // console.log('=================================================================')
  // console.log('ps', ps)
  let recalls = [];
  let documentIndex = [];
  let combinations = [];

  this.getRecalls(tx, ps.uid).then(data => recalls = data)
  .then(()=> this.getDocumentIndex(tx, ps.uid)).then(data => documentIndex = data )

  // .then(()=> console.log("check 1"))
  // Define combinaison to compare to recalls
  .then(()=> this.createCombination(tx, documentIndex)).then(data => combinations = data )
  // .then(()=> console.log("check 2"))
  // Compare combination and recalls, to delete and create
  .then(()=> this.compareRecallCombination(tx, recalls, combinations))
  .then(data => { recallsToDelete = data.delete; combinationsToCreate = data.create; })
  // .then(()=> console.log("check 3"))
  // Delete recalls
  .then(() => this.deleteRecalls(tx, recallsToDelete))
  // .then(()=> console.log("check 4"))
  // Create combinations as futur recall
  .then(()=> this.selectCombinationToCreate(tx, ps.uid, combinationsToCreate))

  // .then(()=> console.log("check 5"))
  .then(() => utils.commit(tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'games-recall-one/maj.ctrl.js/main'}, res, tx)} )
};
