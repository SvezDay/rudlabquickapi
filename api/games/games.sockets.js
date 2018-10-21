
let driver = require('../../dbconnect');
let verify = require('../tokenRoutes').verify;

// CONTROLLERS
let ubd = require('./update-brut-data.ctrl').ubd;
let urs = require('./recall/update-recallable-state.ctrl');

module.exports = (io)=>{

  // GAMES
  let gamesNsp = io.of('/games');
  gamesNsp.on('connection', socket=>{

    socket.on('update-recallable-state', ss=>{
      // console.log('ss.token', ss.token)
      let session = driver.session();
      let tx = session.beginTransaction();
      let uid = verify(ss.token).uuid;
      console.log("============================================================")
      socket.emit('update-recallable-state-response', 'ongoing');
      urs.updateRecallableState(tx, uid, ss.idx_uuid, ss.status, ss.descendant)
      .then(()=>tx.commit())
      .then(()=>{
        session.close();
        console.log('======================== SUCCESS')
        socket.emit('update-recallable-state-response', 'successed')
      })
      .catch(err=>{
        tx.rollback();
        session.close();
        console.log('socket err', err)
        socket.emit('update-recallable-state-response', 'failed')
      })
    })
    // socket.on('updateBrutData', ss=>{
    //   // console.log('connection from games module !', ss)
    //   let tx = driver.session().beginTransaction();
    //   let uid = verify(ss.token).uuid;
    //   // console.log("uid", uid)
    //   socket.emit('updateBrutDataResponse', 'ongoing')
    //   ubd(tx, uid, ss.file)
    //   .then(dico=>{
    //     console.log('dico from socket', dico)
    //     socket.emit('updateBrutDataResponse', 'successed')
    //   })
    //   .catch(err=>{
    //     console.log('socket err', err)
    //     socket.emit('updateBrutDataResponse', 'failed')
    //   })
    // })
  })
}
