'use-strict';
const parser = require('parse-neo4j');
const utils = require('./utils.service');

/*
* Input:
* Output: parent, collection[Index]
*/
module.exports.getNoteAncestorAndDescendant = (tx, note_uuid)=>{
  // SELECTION DU NODE CONTENANT LE CONTAINER SI IMBRIQUE ET LES SUB A PARTIR D'UN NODE
  return new Promise((resolve, reject)=>{
    // Selection des collection en dépendance
    // Si l'index de la note est imbriqué dans une note alors selection de cette note
    // pour une remonté automatique des index en dépendance
    const collectionIndex = `
      MATCH (note:Note{uuid:'${note_uuid}'})
      MATCH (parent)-[]->(curIdx:Index)-[*]->(note) WHERE parent:Note OR parent:Person OR parent:Title
      OPTIONAL MATCH (note)-[]->(idx:Index)
      RETURN parent,  COLLECT(distinct idx) as collection `;

    tx.run(collectionIndex).then(parser.parse)
    .then( result =>{ resolve(result[0]) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/descendant.request.js/getNoteAncestorAndDescendant'}); })
  })
}
/*
* Used by: updateCtrl, graphDetailCtrl
* Input: note[]
* Output: list[{ note_uuid, index{uuid},title: {uuid, value} }]
*/
module.exports.getGraphDescendant = (tx, notes)=>{
  // GET GRAPH ID AND TITLE FROM ARRAY OF NODES
  return new Promise((resolve, reject)=>{
    let q2one = "WITH [] as list ";
    let q2two = " RETURN DISTINCT list "
    for (n of notes) {
      q2one +=` OPTIONAL MATCH (n_${n.id}:Note{uuid:'${n.uuid}'})-[]->(i_${n.id}:Index)-[]->(t_${n.id}:Title)
      WITH list + collect({note_uuid:n_${n.id}.uuid, index: {uuid:i_${n.id}.uuid, model:i_${n.id}.model}, title:{ uuid:t_${n.id}.uuid, value:t_${n.id}.value} }) AS list`;
    }
    tx.run(q2one + q2two).then(parser.parse)
    .then(list => { resolve(list) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/descendant.request.js/getGraphDescendant'}); })
  })
}
/*
* Input:
* Output: [notes]
*/
module.exports.bindNoteToDescendant = (tx, notes, descendant)=>{
  return new Promise((resolve, reject)=>{
    let arr = [];
    Promise.resolve().then(()=>{
      for(x of notes){
        for(y of descendant){
          if(y.note_uuid == x.uuid){
            if(!x.hasOwnProperty('descendant')){
              Object.assign(x, {descendant:[]});
            }
            x.descendant.push(y);
          }
        }
        arr.push(x)
      }
    })
    .then(()=> resolve(arr) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/descendant.request.js/bindNoteToDescendant'}); })
  })
}
/*
* Input: tx, uid, idxOrigin
* Output: [headGraph]
*/
module.exports.getAllNoteDescendant = (tx, uid, idxOrigin)=>{
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (p:Person{uuid:'${uid}'})
      MATCH path=(p)-[*]->(io:Index{uuid:'${idxOrigin}'})-[]->(iot:Title)-[*]->(notes:Note)-[]->(idxColl:Index)-[]->(titColl:Title)
      RETURN {index:{uuid:idxColl.uuid, model:idxColl.model}, title:{uuid:titColl.uuid, value:titColl.value}}
    `;
    tx.run(query).then(parser.parse)
    // .then(data => {console.log("getAllNoteDescendant", data); return data} )
    .then(result => resolve(result) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/descendant.request.js/getAllNoteDescendant'}); })
  })
}
/*
* By: free getDetail
* Input: tx, idx_uuid
* Output: [headGraph]
*/
module.exports.getTitleDescendant = (tx, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (i:Index{uuid:'${idx_uuid}'})-[:Has]->(tit:Title)-[:Manage]->(idx:Index)-[:Has]->(title:Title)
      RETURN {index:{uuid:idx.uuid, model:idx.model}, title:{uuid:title.uuid, value:title.value} } `;
    tx.run(query)
    // .then(data => {console.log("getTitleDescendant ============================", data); return data} )
    .then(parser.parse)
    .then(result => { resolve(result) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/descendant.request.js/getTitleDescendant'}); })
  })
}
/*
* By: tree tree
* Input: tx, uid,
* Output: [headGraph]
*/
module.exports.getTitleDescendantByUid = (tx, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (p:Person{uuid:'${uid}'})-->(i:Index{uuid:'${idx_uuid}'})-[:Has]->(tit:Title)-[:Manage]->(idx:Index)-[:Has]->(title:Title)
      RETURN {index:{uuid:idx.uuid, model:idx.model}, title:{uuid:title.uuid, value:title.value} } `;
    tx.run(query)
    // .then(data => {console.log("getTitleDescendant ============================", data); return data} )
    .then(parser.parse)
    .then(result => { resolve(result) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/descendant.request.js/getTitleDescendantByUid'}); })
  })
}
