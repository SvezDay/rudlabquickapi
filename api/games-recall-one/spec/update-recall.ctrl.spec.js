process.env.NODE_ENV = 'dev';

let chai = require('chai');
let chaiHttp = require('chai-http');
let path = require('path');


let expect = chai.expect;
let should = chai.should();
chai.use(chaiHttp);

let server = require('../../../server');
const driver = require('../../../dbconnect');

let ctrl = require("../update-recall.ctrl");
let dev = require("../../../devRoutes/routes.dev");



let formReg = {first:'bruce', last:'wayne', email:'bruce@wayne.com', password:'wayne'};
let formAuth = {email:'bruce@wayne.com', password:'wayne'};
let token;

let dico = {};


describe('GRAPH REQUEST :: CLEAR DATABASE', ()=>{
  it('should return nothing', (done)=>{
    chai.request('http://localhost:3200')
    .delete('/dev/clear-database')
    .end((err, res)=>{
      res.should.have.status(200);
      res.body.should.be.a('object');
      done();
    })
  })
})
describe('CREATE BRUCE WAYNE', ()=>{
  it('should return object with token, exp, data.first for an Manual Register', (done)=>{
    chai.request('http://localhost:3200')
    .post('/manual_register')
    .send(formReg)
    .end((err, res)=>{
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('token');
      res.body.should.have.property('exp');
      res.body.should.have.property('data');
      res.body.data.should.have.property('first');
      // res.body.errors.pages.should.have.property('kind').eql('required');
      done();
    })
  })
  it('should object with token, exp, data.first for an Manual Authentication', (done)=>{
    chai.request('http://localhost:3200')
    .post('/manual_authenticate')
    .send(formAuth)
    .end((err, res)=>{
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('token');
      res.body.should.have.property('exp');
      res.body.should.have.property('data');
      res.body.data.should.have.property('first');
      token = res.body.token;
      done();
    })
  })
  it('should return empty list of document for validate the token in the api routes', (done)=>{
    chai.request('http://localhost:3200')
    .get('/api/document/get-main')
    .set('x-access-token',token)
    .send()
    .end((err, res)=>{
      res.should.have.status(200);
      // res.body.should.be.a('object');
      done();
    })
  })
})

describe('CAS 1', ()=>{
  describe('CREATE dico',()=>{
    it('should create a document', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-document').set('x-access-token',token).send({model:'dico'})
      .end((err, res)=>{
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('token');
        res.body.should.have.property('exp');
        res.body.should.have.property('data');
        res.body.data.should.have.property('index');
        res.body.data.index.should.have.property('uuid');
        res.body.data.should.have.property('title');
        dico = res.body.data
        done();
      })
    })
    it('should create item', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'dico', parent_uuid:dico.title.uuid, model:dico.index.model, code_label:8.1})
      .end((err, res)=>{
        dico.items = [];
        dico.items.push(res.body.data);
        done();
      })
    })
    it('should create item', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'dico', parent_uuid:dico.title.uuid, model:dico.index.model, code_label:8.1})
      .end((err, res)=>{
        dico.items.push(res.body.data);
        done();
      })
    })
    it('should create item', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'dico', parent_uuid:dico.title.uuid, model:dico.index.model, code_label:8.1})
      .end((err, res)=>{
        dico.items.push(res.body.data);
        done();
      })
    })
    it('should create trad', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'dico', parent_uuid:dico.items[0].uuid, model:dico.index.model, code_label:8.2})
      .end((err, res)=>{
        dico.items[0].trads = [];
        dico.items[0].trads.push(res.body.data);
        done();
      })
    })
    it('should create trad', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'dico', parent_uuid:dico.items[0].trads[0].uuid, model:dico.index.model, code_label:8.3})
      .end((err, res)=>{
        dico.items[0].trads.push(res.body.data);
        done();
      })
    })
    it('should create trad', (done)=>{
      chai.request('http://localhost:3200')
      .post('/api/document/create-note').set('x-access-token',token).send({model:'dico', parent_uuid:dico.items[1].uuid, model:dico.index.model, code_label:8.2})
      .end((err, res)=>{
        dico.items[1].trads = [];
        dico.items[1].trads.push(res.body.data);
        done();
      })
    })
    it('should turn on the course', (done)=>{
      chai.request('http://localhost:3200')
      .put('/api/games-recall-one/status').set('x-access-token',token).send({idx_uuid:dico.index.uuid, status:true, descendant:true})
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
    it('should get title with true course', (done)=>{
      chai.request('http://localhost:3200')
      .get('/api/document/read-document').set('x-access-token',token).set('idx_uuid',dico.index.uuid)
      .end((err, res)=>{
        res.should.have.status(200);
        expect(res.body.data.title.course).to.be.true;
        done();
      })
    })
  })
  describe('update-recall',()=>{
    it('should update the recall', (done)=>{
      chai.request('http://localhost:3200')
      .get('/api/games-recall-one/update-recall').set('x-access-token',token)
      .end((err, res)=>{
        res.should.have.status(200);
        done();
      })
    })
  })
  describe('test each method of the route update-recall',()=>{
    let person;
    let recalls;
    let documentIndex;
    let combinations;
    it('should return person form dev routes', (done)=>{
      chai.request('http://localhost:3200')
      .get('/dev/getPerson').set('x-access-token',token)
      .end((err, res)=>{
        res.should.have.status(200);
        person = res.body.data;
        expect(res.body.data.uuid).to.be.a('string');
        done();
      })
    })
    it('should get the recall', (done)=>{
      let tx = driver.session().beginTransaction();
      ctrl.getRecalls(tx, person.uuid).then(data=>{
        recalls = data;
        expect(data).to.be.an('array');
        expect(data.length).to.equal(8);
        done();
      })
    })
    it('should get documentIndex', (done)=>{
      let tx = driver.session().beginTransaction();
      ctrl.getDocumentIndex(tx, person.uuid).then(data=>{
        documentIndex = data;
        expect(data).to.be.an('array');
        expect(data.length).to.equal(1);
        data[0].should.have.property('uuid');
        done();
      })
    })
    it('should createCombination', (done)=>{
      let tx = driver.session().beginTransaction();
      ctrl.createCombination(tx, documentIndex).then(data=>{
        combinations = data;
        expect(data).to.be.an('array');
        expect(data.length).to.equal(8);
        done();
      })
    })
    it('should compareRecallCombination', (done)=>{
      let tx = driver.session().beginTransaction();
      ctrl.compareRecallCombination(tx, recalls, combinations).then(data=>{
        toDelete = data.delete;
        toCreate = data.create;
        expect(data).to.be.an('object');
        data.should.have.property('delete');
        data.should.have.property('create');
        expect(data.delete.length).to.equal(0)
        expect(data.create.length).to.equal(0)
        done();
      })
    })
  })
})
