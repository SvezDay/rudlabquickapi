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
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------

module.exports.main = (req, res, next)=>{
  // permet d'implémenter manuellement une grande quantité de données
  let tx = driver.session().beginTransaction();
  let ps = req.body;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();
  console.log('ps', ps)

  let dcd = require('../document/create-document.ctrl').createDocument;
  let dcid = require('../dico/create-item-and-defintion.ctrl.js').createItemAndDefintion;


  let datas = require(`../_datas/${ps.file}`).data;
  // console.log('datas', datas)
  let dico;

  dcd(tx, 'dico', ps.uid)
  .then(data => {console.log('data', data); dico = data; })
  .then(()=>{
    let promises = [];
    for(var i=0; i<datas.length; i++){
      promises.push( dcid(tx, dico.index.uuid, 8.1, datas[i].english, 8.2, datas[i].french) )
    }
    return Promise.all(promises);
  })

  .then(() => utils.commit(tx, res, ps.uid, dico) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'game/get-suspended.ctrl.js/main'}, res, tx)} )
};
