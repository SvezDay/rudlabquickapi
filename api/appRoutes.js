"use-strict";
const express = require('express');
// const apoc = require('apoc');
// const neo4j = require('neo4j-driver').v1;
// const version = require('../package.json').version;

// const multer = require('multer');
// const upload = multer()

module.exports = ()=>{
   let routes = express.Router();
   routes

   // // ADMIN
      .post('/admin/add-dico', require('./admin/add-dico.ctrl').main)
   // // USER
      .delete('/user/delete-account', require('./user/delete-account.ctrl').main)
   // TESTS

// DOCUMENTATION

   // Models defined
      .get('/model-defined/read', require('./model-defined/read.ctrl').main)
   // DOCUMENT
      .post('/document/create-document', require('./document/create-document.ctrl').main)
      .post('/document/create-note', require('./document/create-note.ctrl').main)
      .get('/document/get-main', require('./document/get-main.ctrl').main)
      .get('/document/read-document', require('./document/read-document.ctrl').main)
      .get('/document/read-extend-document', require('./document/read-extend-document.ctrl').main)
      .put('/document/update-title', require('./document/update-title.ctrl').main)
      .delete('/document/delete-document-recursively', require('./document/delete-document-recursively.ctrl').main)
      .delete('/document/delete-document', require('./document/delete-document.ctrl').main)
      .delete('/document/delete-note', require('./document/delete-note.ctrl').main)
    // ACTIVITY
       .get('/activity/get-main', require('./activity/get-main.ctrl').main)
       .post('/activity/create-activity', require('./activity/create-activity.ctrl').main)
       .post('/activity/create-event', require('./activity/create-event.ctrl').main)
   // FREE
     .post('/free/graph-detail', require('./free/read-graph-detail.ctrl').main)
     .post('/free/create-note', require('./free/create-note.ctrl').main)
     .put('/free/update-note-value', require('./free/update-note-value.ctrl').main)
     .put('/free/update-note-label', require('./free/update-note-label.ctrl').main)
     .put('/free/update-order', require('./free/update-order.ctrl').main)
     .delete('/free/delete-graph', require('./free/delete-graph.ctrl').main)
     .delete('/free/delete-graph-and-descendant', require('./free/delete-graph-and-descendant.ctrl').main)
     // .delete('/free/delete-note', require('./free/delete-note.ctrl').main) // Redirect to document/delete-note
   // DICO
     .post('/dico/create-item', require('./dico/create-item.ctrl').main)
     .post('/dico/create-traduction', require('./dico/create-traduction.ctrl').main)
     .post('/dico/create-definition', require('./dico/create-definition.ctrl').main)
     .delete('/dico/delete-dico', require('./dico/delete-dico.ctrl').main)
     .delete('/dico/delete-item', require('./dico/delete-item.ctrl').main)
     .delete('/dico/delete-traduction', require('./dico/delete-traduction.ctrl').main)
     .delete('/dico/delete-definition', require('./dico/delete-definition.ctrl').main)
     .get('/dico/read-extend-head-graph', require('./dico/read-extend-head-graph.ctrl').main)
     .get('/dico/read-extend-column-graph', require('./dico/read-extend-column-graph.ctrl').main)
     .put('/dico/update-traduction-value', require('./dico/update-value.ctrl').main)
     .put('/dico/update-traduction-label', require('./dico/update-label.ctrl').main)
     .put('/dico/update-definition', require('./dico/update-definition.ctrl').main)
   // TREE
      .post('/tree/move', require('./tree/move.ctrl').main)
      .get('/tree', require('./tree/tree.ctrl').main)
   // GAME
      .get('/games/suspended', require('./games/get-suspended.ctrl').main)
      .put('/games/update-brut-data', require('./games/update-brut-data.ctrl').main)
   // GAME RECALL ONE
     .post('/games-recall-one/scoring/win', require('./games-recall-one/scoring.ctrl').win)
     .post('/games-recall-one/scoring/lose', require('./games-recall-one/scoring.ctrl').lose)
     .get('/games-recall-one/update-recall', require('./games-recall-one/update-recall.ctrl').main)
     .get('/games-recall-one/run', require('./games-recall-one/run.ctrl').main)
     .put('/games-recall-one/status', require('./games-recall-one/status.ctrl').main)
     .put('/games-recall-one/recallStatus', require('./games-recall-one/status.ctrl').recallStatus)

   return routes;
};
