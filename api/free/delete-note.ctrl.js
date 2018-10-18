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
const miscellaneousReq = require('../_services/miscellaneous.request');
const descendantReq = require('../_services/descendant.request');
const relationReq = require('../_services/relation.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLERS -----------------------------------------------------------------
const graphDetail = require('./read-graph-detail.ctrl');
const deleteGraph = require('./delete-graph.ctrl');

/*
* Input: tx, parent_uuid, collection
* Output:
*/
module.exports.leveledCollection = (tx, parent_uuid, collection)=>{
  // REMONTE DES SUB
  return new Promise((resolve, reject)=>{
    let leveled1 = `MATCH (par{uuid:$parent_uuid }) `;
    let leveled2 = "";
    collection.forEach((cont, idx)=>{
      leveled1 += ` MATCH (cont_${cont.id}{uuid:'${cont.uuid}' }) `;
      leveled2 += ` MERGE (par)-[:Manage]->(cont_${cont.id}) `;
    })
    return tx.run(leveled1 + leveled2, {parent_uuid:parent_uuid})
    .then(() => { resolve() })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'free/delete-note.ctrl.js/leveledCollection'}); })
  })
}

/*
* Input:
* Output:
*/
module.exports.getNoteAround = (tx, note_uuid)=>{
  // PREPARATION DE RATACHEMENT ENTRE NODE PRECEDENT ET NODE SUIVANT
  // Selection du note ou titre en amont du note à supprimer
  // Selection des notes en dépendance
  return new Promise((resolve, reject)=>{
    let collectionNote = `
      MATCH (tit:Title)-[*]->(n:Note{uuid:$note_uuid})
      OPTIONAL MATCH (up:Note)-[]->(n)
      OPTIONAL MATCH (n)-[]->(down:Note)
      RETURN tit, up, down
    `;
    return tx.run(collectionNote, {note_uuid:note_uuid}).then(parser.parse)
    .then((result) => { resolve(result[0]) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'free/delete-note.ctrl.js/getNoteAround'}); })
  })
}

/*
* Input: tx, note_uuid
* Output:
*/
module.exports.deleteNote = (tx, note_uuid)=>{
  return new Promise((resolve, reject)=>{
    let deleteIt = ` MATCH (note:Note{uuid:$note_uuid}) DETACH DELETE note `;
    return tx.run(deleteIt, {note_uuid:note_uuid}).then(parser.parse)
    .then((result) => { resolve(result) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'free/delete-note.ctrl.js/deleteNote'}); })
  })
}

/*
* Input: idx_uuid, note_uuid
* Output: void
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let sesion = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();

  validator.uuid(ps.note_uuid)
  .then(()=>{return validator.uuid(ps.idx_uuid) })
  .then(()=>{return miscellaneousReq.access2Note(tx, ps.uid, ps.note_uuid) })
  .then(()=>{return miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) })
  .then(()=>{return descendantReq.getNoteAncestorAndDescendant(tx, ps.note_uuid) })
  .then( result => {
    // console.log('============================================================')
    // console.log('restult ance and des', result)
    // Si la note possède une collection de graph
    // console.log("getParentAndCollection", result)
    if(!!result.collection.length){
      return this.leveledCollection(tx, result.parent, result.collection) }
  })
  .then(() => { return this.getNoteAround(tx, ps.note_uuid) })
  .then( result => {
    // console.log("getNoteArround", result)
    // Si un note en dépendance existe
    switch (true) {
      case (!!result.up && !!result.down):
        return relationReq.attachNotes(tx, result.up.uuid, result.down.uuid)
              .then(() => {return this.deleteNote(tx, ps.note_uuid) })
        break;
      case (!result.up && !!result.down):
        return relationReq.attachNotes(tx, result.tit.uuid, result.down.uuid)
              .then(() => {return this.deleteNote(tx, ps.note_uuid) })
        break;
      case (!result.down):
        return this.deleteNote(tx, ps.note_uuid)
        break;
      default:
        throw {status: 303, mess: 'error:: delete-note() main'};
    }
  })
  .then( () => { utils.commit(session, tx, res, ps.uid) })
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'free/delete-note.ctrl.js/main'}, res, tx)} )
};
