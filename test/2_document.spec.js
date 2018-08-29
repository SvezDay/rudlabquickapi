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
let firstFreeDoc;
let secondFreeDoc;

let thirdDico;
// let firstExtendHeadGraph;
let thirdDicoExtendColumnGraph =[];

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
//
// describe('CREATE DOCUMENTS',()=>{
//   it('should create a firstFreeDoc document and return the list of the root documents', (done)=>{
//     chai.request('http://localhost:3200')
//     .post('/api/document/add-document')
//     .set('x-access-token',token)
//     .send({model:'free'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.should.be.an('array');
//       firstFreeDoc = res.body.data[0];
//       done();
//     })
//   })
//   it('should create a secondFreeDoc document and return the list of the root documents', (done)=>{
//     chai.request('http://localhost:3200')
//     .post('/api/document/add-document')
//     .set('x-access-token',token)
//     .send({model:'free'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       secondFreeDoc = res.body.data[1];
//       done();
//     })
//   })
//   it('should create a firstFreeDoc document and return the list of the root documents', (done)=>{
//     chai.request('http://localhost:3200')
//     .post('/api/document/add-document')
//     .set('x-access-token',token)
//     .send({model:'dico'})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.data.should.be.an('array');
//       thirdDico = res.body.data[2];
//
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
//       res.body.data.length.should.equal(3)
//       res.body.data[2].index.uuid.should.equal(firstFreeDoc.index.uuid);
//       res.body.data[1].index.uuid.should.equal(secondFreeDoc.index.uuid);
//       res.body.data[0].index.uuid.should.equal(thirdDico.index.uuid);
//       done();
//     })
//   })
// })
//
// describe('CREATE COLLECTION OF NOTES', ()=>{
//   it('should create first note to firstFreeDoc',(done)=>{
//     chai.request('http://localhost:3200')
//     .post('/api/free/create-note')
//     .set('x-access-token',token)
//     .send({uuid:firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('data');
//       res.body.data.notes.length.should.equal(1);
//       firstFreeDoc = res.body.data;
//       done();
//     })
//   })
//   it('should create second note to the document',(done)=>{
//     chai.request('http://localhost:3200')
//     .post('/api/free/create-note')
//     .set('x-access-token',token)
//     .send({uuid:firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.notes.length.should.equal(2);
//       firstFreeDoc = res.body.data;
//       token=res.body.token;
//       done();
//     })
//   })
//   it('should create third note to the document',(done)=>{
//     chai.request('http://localhost:3200')
//     .post('/api/free/create-note')
//     .set('x-access-token',token)
//     .send({uuid:firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.be.a('object');
//       res.body.should.have.property('token');
//       res.body.should.have.property('exp');
//       res.body.should.have.property('data');
//       res.body.data.notes.length.should.equal(3);
//
//
//
//       firstFreeDoc = res.body.data;
//       token=res.body.token;
//       done();
//     })
//   })
// })
// describe('UPDATE NOTE',()=>{
//   it('should update first note value',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-value').set('x-access-token',token)
//     .send({idx_uuid:firstFreeDoc.index.uuid, up_uuid:firstFreeDoc.notes[0].uuid, value:"modification"})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.notes[0].value.should.equal("modification");
//       firstFreeDoc = res.body.data;
//       done();
//     })
//   })
//   it('should update first note label',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-note-label').set('x-access-token',token)
//     .send({idx_uuid:firstFreeDoc.index.uuid, up_uuid:firstFreeDoc.notes[0].uuid, code_label:8.2})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.notes[0].code_label.should.equal(8.2);
//       firstFreeDoc = res.body.data;
//       done();
//     })
//   })
//   xit('should not update first note value',(done)=>{ // the feature not control if previous different or not, yet !s
//     chai.request('http://localhost:3200')
//     .put('/api/free/update-note-value')
//     .set('x-access-token',token)
//     .send({idx_uuid:firstFreeDoc.index.uuid, up_uuid:firstFreeDoc.notes[0].uuid, value:"modification"})
//     .end((err, res)=>{
//       res.should.have.status(400);
//       done();
//     })
//   })
// })
// describe('HANDLE ORDER NOTE UP', ()=>{
//   let one, two, three;
//   it('should update note order up 2-1-3',(done)=>{
//     one = firstFreeDoc.notes[0].uuid;
//     two = firstFreeDoc.notes[1].uuid;
//     three = firstFreeDoc.notes[2].uuid;
//     chai.request('http://localhost:3200').put('/api/free/update-order').set('x-access-token',token).send({idx_uuid:firstFreeDoc.index.uuid, order_list:[two, one, three]})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return the new order', (done)=>{
//     chai.request('http://localhost:3200').post('/api/free/graph-detail').set('x-access-token',token).send({'uuid':firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.notes[0].uuid.should.equal(two);
//       res.body.data.notes[1].uuid.should.equal(one);
//       res.body.data.notes[2].uuid.should.equal(three);
//       firstFreeDoc = res.body.data;
//       done();
//     })
//   })
//   it('should update note order up 2-3-1',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-order').set('x-access-token',token).send({idx_uuid:firstFreeDoc.index.uuid, order_list:[two, three, one]})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return the new order', (done)=>{
//     chai.request('http://localhost:3200').post('/api/free/graph-detail').set('x-access-token',token).send({'uuid':firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.notes[0].uuid.should.equal(two);
//       res.body.data.notes[1].uuid.should.equal(three);
//       res.body.data.notes[2].uuid.should.equal(one);
//       firstFreeDoc = res.body.data;
//       done();
//     })
//   })
//   it('should update note order up 1-2-3',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-order').set('x-access-token',token).send({idx_uuid:firstFreeDoc.index.uuid, order_list:[one, two, three]})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return the new order', (done)=>{
//     chai.request('http://localhost:3200').post('/api/free/graph-detail').set('x-access-token',token).send({'uuid':firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.notes[0].uuid.should.equal(one);
//       res.body.data.notes[1].uuid.should.equal(two);
//       res.body.data.notes[2].uuid.should.equal(three);
//       firstFreeDoc = res.body.data;
//       done();
//     })
//   })
// })
// describe('HANDLE ORDER NOTE DOWN', ()=>{
//   let one, two, three;
//   it('should update note order up 1-3-2',(done)=>{
//     one = firstFreeDoc.notes[0].uuid;
//     two = firstFreeDoc.notes[1].uuid;
//     three = firstFreeDoc.notes[2].uuid;
//     chai.request('http://localhost:3200').put('/api/free/update-order').set('x-access-token',token).send({idx_uuid:firstFreeDoc.index.uuid, order_list:[one, three, two]})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return the new order', (done)=>{
//     chai.request('http://localhost:3200').post('/api/free/graph-detail').set('x-access-token',token).send({'uuid':firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.notes[0].uuid.should.equal(one);
//       res.body.data.notes[1].uuid.should.equal(three);
//       res.body.data.notes[2].uuid.should.equal(two);
//       firstFreeDoc = res.body.data;
//       done();
//     })
//   })
//   it('should update note order up 3-1-2',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-order').set('x-access-token',token).send({idx_uuid:firstFreeDoc.index.uuid, order_list:[three, one,two]})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return the new order', (done)=>{
//     chai.request('http://localhost:3200').post('/api/free/graph-detail').set('x-access-token',token).send({'uuid':firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.notes[0].uuid.should.equal(three);
//       res.body.data.notes[1].uuid.should.equal(one);
//       res.body.data.notes[2].uuid.should.equal(two);
//       firstFreeDoc = res.body.data;
//       done();
//     })
//   })
//   it('should update note order up 1-2-3',(done)=>{
//     chai.request('http://localhost:3200').put('/api/free/update-order').set('x-access-token',token).send({idx_uuid:firstFreeDoc.index.uuid, order_list:[one, two, three]})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return the new order', (done)=>{
//     chai.request('http://localhost:3200').post('/api/free/graph-detail').set('x-access-token',token).send({'uuid':firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.notes[0].uuid.should.equal(one);
//       res.body.data.notes[1].uuid.should.equal(two);
//       res.body.data.notes[2].uuid.should.equal(three);
//       firstFreeDoc = res.body.data;
//       done();
//     })
//   })
// })
// describe('DELETE COLLECTION OF NOTE', ()=>{
//   it('should delete only the first note',(done)=>{
//     chai.request('http://localhost:3200')
//     .delete('/api/free/delete-note')
//     .set('x-access-token',token)
//     .set('idx_uuid',firstFreeDoc.index.uuid)
//     .set('note_uuid',firstFreeDoc.notes.shift().uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should delete only the last note',(done)=>{
//     chai.request('http://localhost:3200')
//     .delete('/api/free/delete-note')
//     .set('x-access-token',token)
//     .set('idx_uuid',firstFreeDoc.index.uuid)
//     .set('note_uuid',firstFreeDoc.notes.pop().uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return only one note', (done)=>{
//     chai.request('http://localhost:3200')
//     .post('/api/free/graph-detail')
//     .set('x-access-token',token)
//     .send({'uuid':firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.notes.length.should.equal(1);
//       done();
//     })
//   })
// })
// describe('MOVE DOCUMENT',()=>{
//   it('should move secondFreeDoc in firstFreeDoc title', (done)=>{
//     chai.request('http://localhost:3200').post('/api/tree/move').set('x-access-token',token)
//     .send({'idx_uuid':secondFreeDoc.index.uuid, destination_uuid:firstFreeDoc.title.uuid, withDescendant:true})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.have.property('data');
//       should.equal(res.body.data, null);
//       done();
//     })
//   })
//   // Verification of the position
//   it('should find secondFreeDoc in the firstFreeDoc title descendant', (done)=>{
//     chai.request('http://localhost:3200').post('/api/free/graph-detail').set('x-access-token',token)
//     .send({'uuid':firstFreeDoc.index.uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.title.descendant.length.should.equal(1);
//       done();
//     })
//   })
// })
//
// describe('DEVELOP DICO', ()=>{
//   it('should not create a dico first item, because the code_label is false', (done)=>{
//     chai.request('http://localhost:3200').post('/api/dico/create-item').set('x-access-token',token)
//     .send({'idx_uuid':thirdDico.index.uuid, code_label:7.1})
//     .end((err, res)=>{
//       res.should.have.status(403);
//       done();
//     })
//   })
//   it('should create a dico first item', (done)=>{
//     chai.request('http://localhost:3200').post('/api/dico/create-item').set('x-access-token',token)
//     .send({'idx_uuid':thirdDico.index.uuid, code_label:8.1})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.have.property('data');
//       res.body.data.should.have.property('uuid');
//       res.body.data.should.have.property('value');
//       res.body.data.should.have.property('code_label');
//       thirdDicoExtendColumnGraph.push(res.body.data);
//       done();
//     })
//   })
//   it('should create a dico second item', (done)=>{
//     chai.request('http://localhost:3200').post('/api/dico/create-traduction').set('x-access-token',token)
//     .send({'item_uuid':thirdDicoExtendColumnGraph[0].uuid, code_label:8.2})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.should.have.property('uuid');
//       res.body.data.should.have.property('value');
//       res.body.data.should.have.property('code_label');
//       thirdDicoExtendColumnGraph.push(res.body.data);
//       done();
//     })
//   })
//   it('should create a dico second item', (done)=>{
//     chai.request('http://localhost:3200').post('/api/dico/create-traduction').set('x-access-token',token)
//     .send({'item_uuid':thirdDicoExtendColumnGraph[0].uuid, code_label:8.3})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       thirdDicoExtendColumnGraph.push(res.body.data);
//       done();
//     })
//   })
//   it('should create a dico second item', (done)=>{
//     chai.request('http://localhost:3200').post('/api/dico/create-traduction').set('x-access-token',token)
//     .send({'item_uuid':thirdDicoExtendColumnGraph[0].uuid, code_label:8.4})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       thirdDicoExtendColumnGraph.push(res.body.data);
//       done();
//     })
//   })
//   it('should create a dico second item', (done)=>{
//     chai.request('http://localhost:3200').post('/api/dico/create-traduction').set('x-access-token',token)
//     .send({'item_uuid':thirdDicoExtendColumnGraph[0].uuid, code_label:8.5})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       thirdDicoExtendColumnGraph.push(res.body.data);
//       done();
//     })
//   })
//   it('should return an ExtendColumnGraph', (done)=>{
//     chai.request('http://localhost:3200').get('/api/dico/read-extend-column-graph').set('x-access-token',token)
//     .set('item_uuid',thirdDicoExtendColumnGraph[0].uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.have.property('data');
//       res.body.data.length.should.equal(5);
//       res.body.data[4].word.should.have.property('uuid');
//       res.body.data[4].word.uuid.should.be.a('string');
//       res.body.data[4].word.should.have.property('value');
//       res.body.data[4].word.should.have.property('code_label');
//       res.body.data[4].word.should.not.have.property('id');
//       done();
//     })
//   })
// })
// describe('HANDLE COMPLETE DICO', ()=>{
//   let traductionDefinition;
//   it('should create a definition to item', (done)=>{
//     chai.request('http://localhost:3200').post('/api/dico/create-definition').set('x-access-token',token)
//     .send({'note_uuid':thirdDicoExtendColumnGraph[0].uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.should.have.property('uuid');
//       res.body.data.should.have.property('value');
//       res.body.data.should.have.property('code_label');
//       done();
//     })
//   })
//   it('should create a definition to traduction', (done)=>{
//     chai.request('http://localhost:3200').post('/api/dico/create-definition').set('x-access-token',token)
//     .send({'note_uuid':thirdDicoExtendColumnGraph[1].uuid})
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.should.have.property('uuid');
//       res.body.data.should.have.property('value');
//       res.body.data.should.have.property('code_label');
//       traductionDefinition = res.body.data;
//       done();
//     })
//   })
//   it('should delete a definition to traduction', (done)=>{
//     chai.request('http://localhost:3200').delete('/api/dico/delete-definition').set('x-access-token',token)
//     .set('delete_uuid',traductionDefinition.uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('Verification that definition to traduction is deleted', (done)=>{
//     chai.request('http://localhost:3200').get('/dev/is-node-exist').set('x-access-token',token)
//     .set('node_uuid',traductionDefinition.uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.should.equal(0);
//       done();
//     })
//   })
// })
//
// xdescribe('DELETE DICO',  ()=>{
//   it('should delete the last traduction of the dico', (done)=>{
//     chai.request('http://localhost:3200').delete('/api/dico/delete-traduction').set('x-access-token',token)
//     .set('delete_uuid',thirdDicoExtendColumnGraph[4].uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return an ExtendColumnGraph', (done)=>{
//     chai.request('http://localhost:3200').get('/api/dico/read-extend-column-graph').set('x-access-token',token)
//     .set('item_uuid',thirdDicoExtendColumnGraph[0].uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.have.property('data');
//       res.body.data.length.should.equal(4);
//       done();
//     })
//   })
//   it('should delete the middle traduction of the dico', (done)=>{
//     chai.request('http://localhost:3200').delete('/api/dico/delete-traduction').set('x-access-token',token)
//     .set('delete_uuid',thirdDicoExtendColumnGraph[2].uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return an ExtendColumnGraph', (done)=>{
//     chai.request('http://localhost:3200').get('/api/dico/read-extend-column-graph').set('x-access-token',token)
//     .set('item_uuid',thirdDicoExtendColumnGraph[0].uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.have.property('data');
//       res.body.data.length.should.equal(3);
//       done();
//     })
//   })
//   it('should delete the first traduction of the dico', (done)=>{
//     chai.request('http://localhost:3200').delete('/api/dico/delete-traduction').set('x-access-token',token)
//     .set('delete_uuid',thirdDicoExtendColumnGraph[0].uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return an ExtendColumnGraph', (done)=>{
//     chai.request('http://localhost:3200').get('/api/dico/read-extend-column-graph').set('x-access-token',token)
//     .set('item_uuid',thirdDicoExtendColumnGraph[1].uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.have.property('data');
//       res.body.data.length.should.equal(2);
//       done();
//     })
//   })
//   it('should delete the complete item of dico', (done)=>{
//     chai.request('http://localhost:3200').delete('/api/dico/delete-item').set('x-access-token',token)
//     .set('delete_uuid',thirdDicoExtendColumnGraph[1].uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should return an empty ExtendHeadGraph', (done)=>{
//     chai.request('http://localhost:3200').get('/api/dico/read-extend-head-graph').set('x-access-token',token)
//     .set('idx_uuid',thirdDico.index.uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.data.notes.length.should.equal(0);
//       done();
//     })
//   })
//   it('should delete the complete dico', (done)=>{
//     chai.request('http://localhost:3200').delete('/api/dico/delete-dico').set('x-access-token',token)
//     .set('idx_uuid',thirdDico.index.uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
// })
//
// xdescribe('DELETE DOCUMENT',()=>{
//   it('should delete a firstFreeDoc', (done)=>{
//     chai.request('http://localhost:3200').delete('/api/free/delete-graph').set('x-access-token',token)
//     .set('uuid',firstFreeDoc.index.uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should delete a secondFreeDoc', (done)=>{
//     chai.request('http://localhost:3200').delete('/api/free/delete-graph').set('x-access-token',token)
//     .set('uuid',secondFreeDoc.index.uuid)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('should not delete a free doc, because already deleted', (done)=>{
//     chai.request('http://localhost:3200')
//     .delete('/api/free/delete-graph')
//     .set('x-access-token',token)
//     .set('uuid',firstFreeDoc.index.uuid)
//     .end((err, res)=>{
//       res.should.have.status(403);
//       done();
//     })
//   })
// })
//
// xdescribe('DELETE BRUCE WAYNE ACCOUNT', ()=>{
//   it('should delete the account', (done)=>{
//     chai.request('http://localhost:3200')
//     .delete('/api/user/delete-account')
//     .set('x-access-token',token)
//     .end((err, res)=>{
//       res.should.have.status(200);
//       done();
//     })
//   })
//   it('the database should be clear', (done)=>{
//     chai.request('http://localhost:3200')
//     .get('/dev/node-list')
//     .end((err, res)=>{
//       res.should.have.status(200);
//       res.body.should.equal(0);
//       done();
//     })
//   })
// })
