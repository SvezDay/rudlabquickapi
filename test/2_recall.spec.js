process.env.NODE_ENV = 'dev';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
chai.use(chaiHttp);

const path = require('path');

let formReg = {first:'bruce', last:'wayne', email:'bruce@wayne.com', password:'wayne'};
let formAuth = {email:'bruce@wayne.com', password:'wayne'};
let token;
let doc1;
let doc2;
let doc3;
let doc4;
let doc5;
let doc6;

// describe('CLEAR DATABASE', ()=>{
//   it('should return nothing', (done)=>{
//     chai.request('http://localhost:3200')
//     .delete('/dev/clear-database')
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       // Object.keys(res.body).length.should.be(null);
//       done();
//     })
//   })
// })
// describe('CREATE BRUCE WAYNE', ()=>{
//   it('should return object with token, exp, data.first for an Manual Register', (done)=>{
//     chai.request('http://localhost:3200')
//     .post('/manual_register')
//     .send(formReg)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('first');
//       // res.body.errors.should.have.property('first');
//       // res.body.errors.pages.should.have.property('kind').eql('required');
//       done();
//     })
//   })
//   it('should object with token, exp, data.first for an Manual Authentication', (done)=>{
//     chai.request('http://localhost:3200')
//     .post('/manual_authenticate')
//     .send(formAuth)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('first');
//       token = res.body.token;
//       done();
//     })
//   })
//   it('should return empty list of document for validate the token in the api routes', (done)=>{
//     chai.request('http://localhost:3200')
//     .get('/api/document/get-main')
//     .set('x-access-token',token)
//     .send()
//     .end((err, res)=>{
//       res.should.have.status(200);
//       // res.body.should.be.a('object');
//       done();
//     })
//   })
// })


// describe('CREATE DOCUMENTS',()=>{
//   it('should create doc1', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/add-document').set('x-access-token',token).send({model:'free'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       doc1 = res.body.data[0];
//       done();
//     })
//   })
//   it('should create doc2', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/add-document').set('x-access-token',token).send({model:'free'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       doc2 = res.body.data[1];
//       done();
//     })
//   })
//   it('should create doc3', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/add-document').set('x-access-token',token).send({model:'free'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       doc3 = res.body.data[2];
//       done();
//     })
//   })
//   it('should create doc4', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/add-document').set('x-access-token',token).send({model:'free'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       doc4 = res.body.data[3];
//       done();
//     })
//   })
//   it('should create doc5', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/add-document').set('x-access-token',token).send({model:'free'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       doc5 = res.body.data[4];
//       done();
//     })
//   })
//   it('should create doc6', (done)=>{
//     chai.request('http://localhost:3200').post('/api/document/add-document').set('x-access-token',token).send({model:'free'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       doc6 = res.body.data[5];
//       done();
//     })
//   })
// })
// describe('CHECK ROOT DOCUMENT',()=>{
//   it('should return the document root list', (done)=>{
//     chai.request('http://localhost:3200').get('/api/document/get-main').set('x-access-token',token)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.should.be.a('array');
//       res.body.data.length.should.equal(6)
//       done();
//     })
//   })
// })
// describe('CREATE COLLECTION OF NOTES', ()=>{
//   it('should create note in doc1',(done)=>{
//     chai.request('http://localhost:3200').post('/api/free/create-note').set('x-access-token',token).send({uuid:doc1.index.uuid}).end((err, res)=>{ done() })
//   })
//   it('should create note in doc1',(done)=>{
//     chai.request('http://localhost:3200').post('/api/free/create-note').set('x-access-token',token).send({uuid:doc1.index.uuid}).end((err, res)=>{ done() })
//   })
//   it('should create note in doc1',(done)=>{
//     chai.request('http://localhost:3200').post('/api/free/create-note').set('x-access-token',token).send({uuid:doc1.index.uuid}).end((err, res)=>{ done() })
//   })
//   it('should create note in doc1',(done)=>{
//     chai.request('http://localhost:3200').post('/api/free/create-note').set('x-access-token',token).send({uuid:doc1.index.uuid}).end((err, res)=>{ done() })
//   })
//   it('should create note in doc2',(done)=>{
//     chai.request('http://localhost:3200').post('/api/free/create-note').set('x-access-token',token).send({uuid:doc2.index.uuid}).end((err, res)=>{ done() })
//   })
//   it('should create note in doc2',(done)=>{
//     chai.request('http://localhost:3200').post('/api/free/create-note').set('x-access-token',token).send({uuid:doc2.index.uuid}).end((err, res)=>{ done() })
//   })
//   it('should create note in doc2',(done)=>{
//     chai.request('http://localhost:3200').post('/api/free/create-note').set('x-access-token',token).send({uuid:doc2.index.uuid}).end((err, res)=>{ done() })
//   })
//   it('should create note in doc2',(done)=>{
//     chai.request('http://localhost:3200').post('/api/free/create-note').set('x-access-token',token).send({uuid:doc2.index.uuid}).end((err, res)=>{ done() })
//   })
//   it('should get-detail of doc1',(done)=>{
//     chai.request('http://localhost:3200').post('/api/free/graph-detail').set('x-access-token',token)
//     .send({uuid:doc1.index.uuid})
//     .end((err, res)=>{
//       res.body.data.should.have.property('index');
//       doc1 = res.body.data;
//       done()
//     })
//   })
//   it('should get-detail of doc2',(done)=>{
//     chai.request('http://localhost:3200').post('/api/free/graph-detail').set('x-access-token',token)
//     .send({uuid:doc2.index.uuid})
//     .end((err, res)=>{
//       res.body.data.should.have.property('index');
//       doc2 = res.body.data;
//       done()
//     })
//   })
// })
// describe('UPDATE NOTES',()=>{
//   it('should update doc1 label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc1.index.uuid, up_uuid:doc1.notes[0].uuid, code_label:4.1})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should update doc1 label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc1.index.uuid, up_uuid:doc1.notes[1].uuid, code_label:4.2})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should update doc1 label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc1.index.uuid, up_uuid:doc1.notes[2].uuid, code_label:4.3})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should update doc1 label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc1.index.uuid, up_uuid:doc1.notes[3].uuid, code_label:4.4})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should update doc2 label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc2.index.uuid, up_uuid:doc2.notes[0].uuid, code_label:4.1})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should update doc2 label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc2.index.uuid, up_uuid:doc2.notes[1].uuid, code_label:4.2})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should update doc2 label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc2.index.uuid, up_uuid:doc2.notes[2].uuid, code_label:4.3})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should update doc2 label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc2.index.uuid, up_uuid:doc2.notes[3].uuid, code_label:4.4})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
// })
// describe('TURN ON THE COURSE STATUS',()=>{
//   it('should turn on the doc1 course status',(done)=>{
//     chai.request('http://localhost:3200').put('/api/games-recall-one/status').set('x-access-token',token)
//     .send({idx_uuid:doc1.index.uuid, status:true, des:true})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   xit('should turn on the doc2 course status',(done)=>{
//     chai.request('http://localhost:3200').put('/api/games-recall-one/status').set('x-access-token',token)
//     .send({idx_uuid:doc2.index.uuid, status:true, des:true})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
// })
//
// // xdescribe('MAJ METHODS', ()=>{
// //   it('should return the indexList',(done)=>{
// //     chai.request('http://localhost:3200').post('/devUid/methodTestingUid').set('x-access-token',token)
// //     .send({
// //       path:'../api/games-recall-one/maj.ctrl'
// //       , method: 'getCourseIndex'
// //       , params:[]
// //     })
// //     .end((err, res)=>{
// //       res.should.have.status(200);
// //       res.body.length.should.equal(1);
// //       done();
// //     })
// //   })
// //   xit('should return the combinations',(done)=>{
// //     chai.request('http://localhost:3200').post('/devUid/methodTestingUid').set('x-access-token',token)
// //     .send({
// //       path:'../api/games-recall-one/maj.ctrl'
// //       , method: 'getCombination'
// //       , params:[]
// //     })
// //     .end((err, res)=>{
// //       res.should.have.status(200);
// //       res.body.length.should.equal(2);
// //       done();
// //     })
// //   })
// // })
// describe('MAJ TEST 1', ()=>{
//   // Verification basic de la method à l'initialisation
//   it('should maj',(done)=>{
//     chai.request('http://localhost:3200').get('/api/games-recall-one/maj').set('x-access-token',token)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
// })
// describe('MAJ TEST 2',()=>{
//   // Modification de plusieurs labels et maj, pour controller la suppression de combinaisons
//   xit('should update doc1 label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc1.index.uuid, up_uuid:doc1.notes[0].uuid, code_label:4.1})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   xit('should maj',(done)=>{
//     chai.request('http://localhost:3200').get('/api/games-recall-one/maj').set('x-access-token',token)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
// })
// describe('RUN TEST 1 et 2',()=>{
//   // Run pour valider le bon fonctionnement de base
//   // Modification de label et Run pour verifier la détection de combinaison obsolète
//   xit('should run',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc1.index.uuid, up_uuid:doc1.notes[0].uuid, code_label:4.1})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   xit('should update label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc1.index.uuid, up_uuid:doc1.notes[0].uuid, code_label:4.1})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   xit('should run',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:doc1.index.uuid, up_uuid:doc1.notes[0].uuid, code_label:4.1})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   xit('should maj',(done)=>{
//     chai.request('http://localhost:3200').get('/api/games-recall-one/maj').set('x-access-token',token)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
// })
