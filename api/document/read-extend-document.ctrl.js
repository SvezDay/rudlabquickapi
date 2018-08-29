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
const graphReq = require('../_services/graph.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------

/*
* Input: tx, uid, idx_uid
* Output: ExtendGraph
*/
module.exports.getDetail = (tx, uid, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    let descendant = [];
    let graph;

    graphReq.getGraph(tx, uid, idx_uuid).then(result => graph=result)
    .then(() => {
      // console.log('graphdetail ===============================', graph)
      // IF NODE EXISTS GET THE EVENTUAL DESCENDANT OF IT
      if(!!graph.notes.length){
        return descendantReq.getGraphDescendant(tx, graph.notes).then(des => { descendant = des; })
      }
    })
    .then(() => {
      // console.log('graphdetail ===============================', descendant)
      // AGREGER LES descendant CORRESPONDANT AU DIFFERENT NODES
      if(!!descendant.length && !!graph.notes.length){
        return descendantReq.bindNoteToDescendant(tx, graph.notes, descendant[0]).then(notes=> {graph.notes = notes})
      }
    })
    .then(() => {
      return descendantReq.getTitleDescendant(tx, idx_uuid)
      .then(titleDescendant => {
        // console.log('titleDescendant ===============================', titleDescendant)
        let title = graph.title;
        title['descendant'] = titleDescendant
        graph.title = title;
      })
    })
    .then((result) => { resolve(graph) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/read-extend-document.ctrl.js/getDetail'}); })
  })
};

/*
* Input: {idx_uuid}
* Output: ExtendGraph
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log('ps', ps)
  validator.uuid(ps.idx_uuid)
  .then(() => miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )
  .then(()=> this.getDetail(tx, ps.uid, ps.idx_uuid) )
  // .then(data=>{console.log('==================== graph detail', data); return data})
  .then(data=>utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'document/read-extend-document.ctrl.js/main'}, res, tx)} )
};
