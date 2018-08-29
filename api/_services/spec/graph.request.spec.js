process.env.NODE_ENV = 'dev';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../server');
let should = chai.should();
chai.use(chaiHttp);

const path = require('path');

let formReg = {first:'bruce', last:'wayne', email:'bruce@wayne.com', password:'wayne'};
let formAuth = {email:'bruce@wayne.com', password:'wayne'};
let token;

let dico = {};



xdescribe('GRAPH REQUEST :: CLEAR DATABASE', ()=>{
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
xdescribe('CREATE BRUCE WAYNE', ()=>{
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

xdescribe('CAS 1', ()=>{
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

  })
  describe('test the getAllColumn',()=>{
    it('update title value', (done)=>{
      let expect = chai.expect;
      let graph = require('../graph.request');
      let driver = require('../../../dbconnect');
      let tx = driver.session().beginTransaction();
      graph.getAllColumn(tx, dico.index.uuid)
      .then(data=>{
          expect(data instanceof Array).to.equal(true);
          done();
      })
    })
  })
})
