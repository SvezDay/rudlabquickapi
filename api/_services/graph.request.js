'use-strict';
const parser = require('parse-neo4j');
const utils = require('./utils.service');
const common = require('../_models/common.data');

/*
* Input: tx, uid, idx_uuid
* Output: { index:{uuid}, title{uuid, value, course}, ?notes[{uuid, value, label}] } // optionally notes[]
*/
module.exports.getGraph = (tx, uid, idx_uuid)=>{
  // GET INDEX'S TITLE AND NODES
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (p:Person{uuid:$uid})
      MATCH path=(p)-[*]->(i:Index{uuid:$idx_uuid})-[:Has]->(tit:Title)
      OPTIONAL MATCH (tit)-[:Has*]->(note:Note)
      RETURN {index: {uuid: i.uuid, model:i.model}, title:{uuid:tit.uuid, value:tit.value, recallable:tit.recallable, code_label:tit.code_label}, notes:COLLECT(DISTINCT {uuid:note.uuid, value:note.value, code_label:note.code_label}) } `;
    tx.run(query, {uid:uid, idx_uuid:idx_uuid}).then(parser.parse)
    // Supprimer le note null dans les notes
    .then(data => {
      data[0].notes[0].uuid==null ? data[0].notes = [] : null
      // console.log('data of getGraph', data[0])
      return data[0];
    })
    // .then(data => { console.log("data getGraph: ", data); return data; })
    .then(data => { resolve(data)})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/graph.request.js/getGraph'}); })
  })
}

/*
* For: maj.Ctrl
* Return the list of node (title and note) of a graph, return a special label title and avoid the node with the label Undefined
* Input: tx, uid, idx_uuid
* Output: { index:{uuid}, nodes[{uuid, value, label}] }
*/
module.exports.getNodeGraph = (tx, uid, idx_uuid)=>{
  // GET INDEX'S TITLE AND NODES
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (p:Person{uuid:$uid})
      MATCH path=(p)-[*]->(i:Index{uuid:$idx_uuid})-[:Has*]->(node) WHERE COALESCE(node.code_label, 1.1) <> 'Undefined'
      RETURN { index: {uuid: i.uuid, model:i.model}, nodes:COLLECT(DISTINCT {uuid:node.uuid, value:node.value, code_label:COALESCE(node.code_label, 1.1)}) } `;
    tx.run(query, {uid:uid, idx_uuid:idx_uuid}).then(parser.parse)
    // .then(data => { console.log("data getNodeGraph: ", data); return data; })
    .then(data => { resolve(data[0])})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/graph.request.js/getNodeGraph'}); })
  })
}

/*
* Input: tx, idx_uuid
* Output: headGraph
*/
module.exports.getHeadGraph = (tx, idx_uuid)=>{
  // GET CONTAINER'S TITLE AND NODES
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (i:Index{uuid:$idx_uuid})-[:Has]->(tit:Title)
      RETURN {index:{uuid: i.uuid, model:i.model}, title:{uuid:tit.uuid, value:tit.value, recallable:tit.recallable, code_label:tit.code_label}} `;
    tx.run(query, {idx_uuid:idx_uuid}).then(parser.parse)
    // tx.run(query).then(data => {console.log("getHeadGraph", data); return data} ).then(parser.parse).then(data => {console.log("getHeadGraph", data); return data} )
    .then(data => { resolve(data[0])})
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/graph.request.js/getHeadGraph'}); })
  })
}
