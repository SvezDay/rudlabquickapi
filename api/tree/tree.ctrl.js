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
const miscellaneousReq = require('../_services/miscellaneous.request');
const descendantReq = require('../_services/descendant.request');
const ancestorReq = require('../_services/ancestor.request');
const graphReq = require('../_services/graph.request');
// COMMON ----------------------------------------------------------------------
const commonData = require('../_models/common.data');
// CONTROLLER ------------------------------------------------------------------
const getMainCtrl=require('../document/get-main.ctrl');

/*
* Input: tx, uid, idx_uuid
* Output: {headGraph, ancestor:[headGraph], titleDescendant[headGraph], noteDescendant[headGraph]}
*/
module.exports.getTreeByIndex = (tx, uid, idx_uuid)=>{
  return new Promise((resolve, reject)=>{

    let tree = {};

    ancestorReq.getAncestor(tx, uid, idx_uuid)
    // .then(data=>{console.log('getancestor data ===================', data); return data;})
    .then(result => tree.ancestor = result )
    .then(() => graphReq.getHeadGraph(tx, idx_uuid) )
    // .then(data=>{console.log('getHeadGraph data ===================', data); return data;})
    .then(result => tree.headGraph = result )
    .then(() => descendantReq.getTitleDescendant(tx, idx_uuid) )
    .then(data=>{console.log('getTitleDescendant data ===================', data); return data;})
    .then(result => { tree.titleDescendant = result;  })
    .then(() => descendantReq.getAllNoteDescendant(tx, uid, idx_uuid) )
    // .then(data=>{console.log('getAllNoteDescendant data ===================', data); return data;})
    .then(result => { tree.noteDescendant = result;  })
    .then(() => console.log("tree", tree) )
    .then(()=>resolve(tree))
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'tree/tree.ctrl.js/getTreeByIndex'}); })
  })
};
/*
* Input: tx, uid
* Output: {headGraph, ancestor:[headGraph], titleDescendant[headGraph], noteDescendant[headGraph]}
*/
module.exports.getTreeFromRoot = (tx, uid)=>{
  return new Promise((resolve, reject)=>{

    let tree;

    getMainCtrl.getMain(tx, uid)
    .then(data=>{
      tree = {
        ancestor:{}
        , headGraph:{}
        , titleDescendant: data
      };
      // console.log("home tree ", tree)
    })
    .then(() => console.log("tree", tree) )
    .then(()=>resolve(tree))
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'tree/tree.ctrl.js/getTreeFromRoot'}); })
  })
};
/*
* Input: idx_uuid || null
* Output: {headGraph, ancestor:[headGraph], titleDescendant[headGraph], noteDescendant[headGraph]}
*/
module.exports.main = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;
  console.log('ps', ps)

  validator.isUndefined(ps.idx_uuid, 'ps.idx_uuid')
  .then(isUndefined => {
    if(isUndefined){
      return this.getTreeFromRoot(tx, ps.uid)
    }else{
      return miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid).then(() => this.getTreeByIndex(tx, ps.uid, ps.idx_uuid) )
    }
  })
  .then(data => {console.log("tree", data); return data} )
  .then(data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'tree/tree.ctrl.js/lose'}, res, tx)} )
};
