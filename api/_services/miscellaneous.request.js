'use-strict';
const parser = require('parse-neo4j');
const utils = require('./utils.service');

/*
* Input: tx, uid, idx_uuid
* Output: void
*/
module.exports.access2Index = (tx, uid, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
      let query =` MATCH (acc:Person{uuid:$uid}) OPTIONAL MATCH (acc)-[*]->(idx:Index{uuid:'${idx_uuid}'}) RETURN COUNT(idx) as count`;
      return tx.run(query, {uid:uid, idx_uuid:idx_uuid}).then(parser.parse)
      .then( result => { if(!result[0]){ throw {status: 403, mess: `access2Index() user access failed: ${idx_uuid}: user:${uid}`} } })
      .then(result => resolve() )
      .catch(err =>{console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',err); reject({status: err.status || 400, mess: err.mess || '_services/miscellaneous.request.js/access2Index'}); })
  })
}
/*
* Input: tx, uid, tit_uuid
* Output: void
*/
module.exports.access2Title = (tx, uid, tit_uuid)=>{
  return new Promise((resolve, reject)=>{
      let query =` MATCH (acc:Person{uuid:$uid}) OPTIONAL MATCH (acc)-[*]->(tit:Title{uuid:$tit_uuid}) RETURN COUNT(tit) as count`;
      tx.run(query, {uid:uid, tit_uuid:tit_uuid}).then(parser.parse)
      .then( result => { if(!result[0]){ throw {status: 403, mess: `access2Title() user access failed: ${tit_uuid}`} } })
      .then(result => resolve() )
      .catch(err =>{console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',err); reject({status: err.status || 400, mess: err.mess || '_services/miscellaneous.request.js/access2Title'}); })
  })
}
/*
* Input: tx, uid, note_uuid
* Output: void
*/
module.exports.access2Note = (tx, uid, note_uuid)=>{
  return new Promise((resolve, reject)=>{
      let query =` MATCH (acc:Person{uuid:$uid}) OPTIONAL MATCH (acc)-[*]->(note:Note{uuid:$note_uuid}) RETURN COUNT(note) as count`;
      tx.run(query, {uid:uid, note_uuid:note_uuid}).then(parser.parse)
      .then( result => { if(!result[0]){ throw {status: 403, mess: `access2Note() user access failed: ${note_uuid}`} } })
      .then(result => resolve() )
      .catch(err =>{console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',err); reject({status: err.status || 400, mess: err.mess || '_services/miscellaneous.request.js/access2Note'}); })
  })
}

/*
* Input: tx, uid, any_uuid
* Output: void
*/
module.exports.access2Any = (tx, uid, any_uuid)=>{
  return new Promise((resolve, reject)=>{
      let query =` MATCH (acc:Person{uuid:$uid}) OPTIONAL MATCH (acc)-[*]->(any{uuid:$any_uuid}) RETURN COUNT(any) as count`;
      tx.run(query, {uid:uid, any_uuid:any_uuid}).then(parser.parse)
      .then( result => { if(!result[0]){ throw {status: 403, mess: `access2Any() user access failed: ${any_uuid}`} } })
      .then(result => resolve() )
      .catch(err =>{console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',err); reject({status: err.status || 400, mess: err.mess || '_services/miscellaneous.request.js/access2Any'}); })
  })
}
/*
* Input: tx, uid, xxx_uuid
* Output: void
*/
module.exports.access2NoteOrTitle = (tx, uid, xxx_uuid)=>{
  return new Promise((resolve, reject)=>{
      let query =` MATCH (acc:Person{uuid:$uid}) OPTIONAL MATCH (acc)-[*]->(x{uuid:$xxx_uuid}) WHERE x:Title or x:Note RETURN COUNT(x) as count`;
      tx.run(query, {uid:uid, xxx_uuid:xxx_uuid}).then(parser.parse)
      .then( result => { if(!result[0]){ throw {status: 403, mess: `access2NoteOrTitle() user access failed: ${xxx_uuid}`} } })
      .then(result => resolve() )
      .catch(err =>{console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',err); reject({status: err.status || 400, mess: err.mess || '_services/miscellaneous.request.js/access2Note'}); })
  })
}
/*
* Input: tx, uid, xxx_uuid
* Output: void
*/
module.exports.access2NoteOrTitleOrNull = (tx, uid, xxx_uuid)=>{
  return new Promise((resolve, reject)=>{
    if(xxx_uuid==null){
      resolve();
    }else{
      let query =` MATCH (acc:Person{uuid:$uid}) OPTIONAL MATCH (acc)-[*]->(x{uuid:$xxx_uuid}) WHERE x:Title or x:Note RETURN COUNT(x) as count`;
      tx.run(query, {uid:uid, xxx_uuid:xxx_uuid}).then(parser.parse)
      .then( result => { if(!result[0]){ throw {status: 403, mess: `access2NoteOrTitle() user access failed: ${xxx_uuid}`} } })
      .then(result => resolve() )
      .catch(err =>{console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',err); reject({status: err.status || 400, mess: err.mess || '_services/miscellaneous.request.js/access2Note'}); })
    }
  })
}
