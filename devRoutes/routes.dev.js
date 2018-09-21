'use-strict';
const express = require('express');
const parser = require('parse-neo4j');
const driver = require('../dbconnect');
const utils = require('../api/_services/utils.service');
const validator = require('../api/_services/validator.service');
let tokenGen = require('../api/_services/token.service');



module.exports.query = (req, res, next)=>{
  // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%ù query req.body:', req.body)
  let tx = driver.session().beginTransaction();
  tx.run(req.body.query).then(parser.parse)
  .then(data=>{console.log('@@@@@@@@@@@@@@@@@@@@ query data:',data); return data; })
  .then(data=>{ tx.commit(); res.status(200).json({data:data});  })
  .catch(err=>{console.log(err); tx.rollback()});
};


module.exports.createDicoItem = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%ù req.body', req.body)
  let query = `
  MATCH (i:Index{uuid:'${req.body.idx_uuid}'})-[]->(t:Title)
  CREATE (new:Note{uuid:apoc.create.uuid(), code_label:8.1, value:"Undefined"})
  CREATE (t)-[h:Has]->(new)
  RETURN new`;
  tx.run(query).then(parser.parse)
  // .then(data=>{console.log('@@@@@@@@@@@@@@@@@@@@ dicoItem',data); return data; })
  .then(data=>{ tx.commit(); res.status(200).json(data[0]); })
  .catch(err=>{console.log(err); reject(err)});
};
module.exports.clearDatabase = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  tx.run('MATCH (n) DETACH DELETE n').then(()=>{ tx.commit(); res.status(200).json({}); });
};
module.exports.nodeList = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let query = ` MATCH (n) RETURN count(n) `;
  tx.run(query).then(parser.parse)
  // .then(data=>{console.log(data); return data; })
  .then(data=>{ tx.commit(); res.status(200).json(data[0]); });
};
module.exports.isNodeExist = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let query = ` MATCH (n{uuid:$node_uuid}) RETURN count(n) `;
  // console.log(req.headers)
  tx.run(query, {node_uuid:req.headers.node_uuid}).then(parser.parse)
  // .then(data=>{console.log('idNodeExist devRoutes: data', data); return data; })
  .then(data=>{ tx.commit(); res.status(200).json({data:data[0]}); });
};
module.exports.allDocument = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let query = ` MATCH (i:Index)-[:Has]->(t:Title) RETURN {index:{uuid:i.uuid}, title:{uuid:t.uuid}} `;
  // console.log(req.headers)
  tx.run(query).then(parser.parse)
  .then(data=>{console.log('allDocument devRoutes: data', data); return data; })
  .then(data=>{ tx.commit(); res.status(200).json({data:data}); });
};
module.exports.getPerson = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let query = ` MATCH (p:Person) RETURN p`;
  // console.log(req.headers)
  tx.run(query).then(parser.parse)
  // .then(data=>{console.log('getPerson devRoutes: data', data); return data; })
  .then(data=>{ tx.commit(); res.status(200).json({data:data[0]}); });
};

// ====================== ROUTES ==================================
module.exports = ()=>{
  let routes = express.Router();
  routes
  .post('/query', this.query) // this route send a full query
  //
  .post('/create-dico-item', this.createDicoItem)
  .delete('/clear-database', this.clearDatabase)
  .get('/node-list', this.nodeList)
  .get('/is-node-exist', this.isNodeExist)
  .get('/all-document', this.allDocument)
  .get('/getPerson', this.getPerson)
  return routes;
};
