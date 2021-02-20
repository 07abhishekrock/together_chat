const express = require('express');
const expressEjsLayouts = require('express-ejs-layouts');
const path = require('path');
const app = express();
const passport = require('passport');
const initialize = require('./passport_config');
const database = require('./firebase');
const express_session = require('express-session');
const WebSocket = require('ws');

app.use(express_session({
  resave:false,
  saveUninitialized:true,
  secret:"none of your business"
}));
app.use(passport.initialize());
app.use(passport.session());

initialize(passport,getUserById,writeUserData);

async function getUserById(id,debug=0){
  let starcountref =  await database.ref('users/'+id);
  let snapshot = await starcountref.once('value');
  let data =  await snapshot.val(); 
    let new_data = {
      id:id,
      age:data.age,
      email:data.email,
      first_time:data.first_time,
      motto:data.motto,
      photo:data.photo,
      username:data.name
    }
    if(debug){
    console.log(new_data);
    }
    return new_data;
}

//utility functions
async function writeUserData(user){

  username = user.username;
  id = user.id;
  email = user.email;
  photo = user.photo;
  age = user.age;
  motto = user.motto;
  first_time = true;

  let starcountref =  await database.ref('users/'+id);
  let snapshot = await starcountref.once('value');
  let data = await snapshot.val(); 
  if(data){
  if(data.first_time === false){
    console.log("already registered");
    return;
  }
  }

  database.ref('users/' + id).set({
    age:age,
    email:email,
    motto:motto,
    name:username,
    photo:photo,
    first_time:true
  });

  database.ref('users-index/' + username).set({
    id:id
  });
}

async function checkIfUsernameExists(value){
let starcountref =  await database.ref('users-index/');
let snapshot = await starcountref.once('value');
let data = await snapshot.val(); 
for (const key in data){
  if(key === username){
      return 1;
    }
  }
return 0;
}

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(expressEjsLayouts);
app.set('layout', './layouts/default');
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));

function isAuthenticated(req,res,next){
  if(req.user){
    next();
  }
  else{
    res.redirect('/');
  }
}

function isFirstTimeUser(req,res,next){
  if(req.user.first_time === false){
    res.redirect('/chat');
  }
  else{
    next();
  }
}

app.get('/index/:index',(req,res)=>{
  new_data = getUserById(req.params.index);
  console.log(new_data);
})

app.get('/', (req,res)=>{
  if(req.user){
    res.redirect('/chat');
  }
  else{
  res.render('start_page',{
    title:"Homepage"
  });
  }
})

app.get('/chat',isAuthenticated,(req,res)=>{
  if(req.user.first_time === true){
    let updates = {};
    updates['/users/' + req.user.id + '/first_time/'] = false;
    database.ref().update(updates);
    req.user.first_time = false;
  }
  console.log(req.user);
  res.render('chat_home',{
    title:"Chats",
    user:req.user
  })
})

app.get('/first-time',isAuthenticated,isFirstTimeUser,(req,res)=>{
  res.render('first_time', {
    title:"Getting Started"
  });
})

app.post('/first-time', async (req, res)=>{
  if(req.body['type'] === 'check'){

  username = req.body['username'];
  const response = await checkIfUsernameExists(username);
  if(response === 0){
    res.send('0');
  }
  else{
    res.send('1');
  }

  }

  else if(req.body['type'] === 'form-data'){
    await database.ref('/users-index/' + req.body.username).set({
      id:req.user.id
    });
    let updates = {};
    updates['/users-index/' + req.user.username] = null;
    updates['/users/' + req.user.id + '/name/'] = req.body.username;
    updates['/users/' + req.user.id + '/motto/'] = req.body.motto,
    updates['/users/' + req.user.id + '/age/'] = req.body.age;
    await database.ref().update(updates);
    res.send('ok');
  }
  
})

app.get('/chat_page', (req,res)=>{
  res.render('chat_home', {
    title:"Getting Started"
  })
})

app.get('/auth/google', passport.authenticate('google',{scope:['https://www.googleapis.com/auth/userinfo.email']}))

app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/'}),
  function(req,res){
    if(req.user.id === false){
      res.redirect('/chat');
    } 
    else{
      res.redirect('/first-time');
    }
  }
)

function is_substring(str1,str2){
  if(str1.length > str2.length){
    short_str = str2;
    long_str  = str1;
  }
  else{
    short_str = str1;
    long_str = str2;
  }

  //operate on long and short strings
  if(long_str.includes(short_str)){
    return true;
  }
  else{
    return false;
  }
  
}

async function list_all_user(value,id){
let starcountref =  await database.ref('users-index/');
let snapshot = await starcountref.once('value');
let data = await snapshot.val(); 
let id_array = [];
for (property in data){
  if(is_substring(value, property))
  {
    if(!(id === data[property]['id'])){
    id_array.push(data[property]['id']);
    }
  }
}
return id_array;
}

app.post('/chat_page', async (req,res)=>{
  if(req.body['type'] === 'list-all')
  {
    final_user = [];
    list_ids =await list_all_user(req.body['value'],req.user.id);
    if(list_ids.length === 0){
      res.send('no-response');
      return;
    }
    list_ids.forEach( async (element,index)=>{
    let starcountref = await database.ref('users/' + element);
    let snapshot = await starcountref.once('value');
    let data = await snapshot.val();
    final_user[index] = data;
    if(index === list_ids.length - 1){
      res.send(final_user);
    }
    })
  }

})

const server = app.listen(8080, ()=>console.log("go to browser at localhost:8080"));

const ws = new WebSocket.Server({
  server
})

//setting up ws client
//store message data on the server

function generate_message_id(sender_id, receiver_id){
  const sum = parseInt(sender_id) + parseInt(receiver_id);
  const sub = Math.abs(parseInt(sender_id) - parseInt(receiver_id));
  return `${sum}-${sub}`;
}

async function set_up_contacts(msg_obj){
  let starcountref =  await database.ref("/users/" + msg_obj['sender_id'] + '/contacts');
  let snapshot = await starcountref.once('value');
  let data = await snapshot.val(); 

  starcountref = await database.ref("/users/" + msg_obj['receiver_id'] + '/contacts');
  snapshot = await starcountref.once('value');
  let rec_data = await snapshot.val();


  console.log('update done');

  let updates = {};
  if(data){
    //for sender
    let new_data = `${data} ${msg_obj['receiver_id']}`
    updates['/users/' + msg_obj['sender_id'] + '/contacts/'] = new_data;
    //for receiver
  }
  else{
    let data_to_be_pushed = msg_obj['receiver_id'];
    updates['/users/' + msg_obj['sender_id'] + '/contacts/'] = data_to_be_pushed;
    //for receiver
  }
  if(rec_data)
  {
    new_data = `${rec_data} ${msg_obj['sender_id']}`
    updates['/users/' + msg_obj['receiver_id'] + '/contacts/'] = new_data;

  }
  else
  {
    //for sender
    data_to_be_pushed = msg_obj['sender_id'];
    updates['/users/' + msg_obj['receiver_id'] + '/contacts/'] = data_to_be_pushed;
  }

  await database.ref().update(updates);

}

async function store_msg_data(msg_obj){
  const message_id = generate_message_id(msg_obj['sender_id'], msg_obj['receiver_id']);
  let starcountref =  await database.ref(message_id+"/");
  let snapshot = await starcountref.once('value');
  let data = await snapshot.val(); 
  if(data){
    //update
    const count = parseInt(data['count']);
    let updates = {}; 
    updates[message_id + "/count/"] = count+1;
    database.ref().update(updates);
    //add new message
    database.ref(message_id + "/" + count).set({
        sender_id : msg_obj['sender_id'],
        receiver_id : msg_obj['receiver_id'],
        msg_body : msg_obj['msg_body'],
        date:msg_obj['date'],
        time:msg_obj['time'],
    })
  }
  else{
    //setup for the first time
    console.log("first time setup");
    database.ref(message_id + "/").set({
      count:1,
      unread:0,
      0:{
        sender_id : msg_obj['sender_id'],
        receiver_id : msg_obj['receiver_id'],
        msg_body : msg_obj['msg_body'],
        date:msg_obj['date'],
        time:msg_obj['time'],
      }
    });

    //update the contacts in main user structure
    await set_up_contacts(msg_obj);
    
  }
}
 
async function getUnread(main_user , user2_id){

  const message_id = generate_message_id(main_user , user2_id);
  let starcountref =  await database.ref(message_id+"/count/");
  let snapshot = await starcountref.once('value');
  let total_count = await snapshot.val(); 

  //get last message
  starcountref = await database.ref(message_id +'/'+ `${total_count - 1}`);
  snapshot = await starcountref.once('value');
  let last_message = await snapshot.val();

  //get unread count
  if(last_message['sender_id'] === main_user){
    //no unread messages
    return [last_message, 0];
  }
  else {
    //find the number of unread messages
    starcountref = await database.ref(message_id + '/unread/');
    snapshot = await starcountref.once('value');
    let unread_messages = await snapshot.val();
    return [last_message, unread_messages]; 
  }

}



ws.on('connection',(wss)=>{
  wss.on('message',async (message)=>{
    //parse the message so that I can read it
    message_body  = JSON.parse(message);
    console.log(message_body['type']);
    if(message_body['type'] ===  'welcome'){
      //a welcome message is received
      wss.id = message_body['id'];
      let resp_obj = {'response':'ok','response-type':'chat-setup'};

      let starcountref =  await database.ref('users/' + message_body['id'] + '/contacts/');
      let snapshot = await starcountref.once('value');
      let data = await snapshot.val(); 
      if(!data){
        return;
      }
      users_list = data.split(' ');
      let final = []; 
      let index = 0;
      for(const element of users_list){
        console.log(element);
        console.log(wss.id);
        let user = await getUserById(element);
        let unread = await getUnread(wss.id,element);
        //put them together
        final[index] = {user:user,unread:unread};
        index++;
        //if this is the last index that means loop ends here, so send the message
      }
      resp_obj['data'] = final; 
      let resp_msg = JSON.stringify(resp_obj);
      wss.send(resp_msg);
      
    }
    else if(message_body['type'] === 'return_id'){
      // asking for receiver's userid in real time
      let starcountref =  await database.ref('users-index/' + message_body['name']);
      let snapshot = await starcountref.once('value');
      let data = await snapshot.val(); 
      resp_obj = {'response':'ok','response-type':'return_id', 'id':data['id']};
      resp_msg = JSON.stringify(resp_obj);
      wss.send(resp_msg);
    }
    else if(message_body['type'] === 'msg_send'){
      //message is sent to the user
        await store_msg_data(message_body);



        let connection_id = generate_message_id(message_body['sender_id'], message_body['receiver_id']);
        let updates = {};
        let starcountref = await database.ref(connection_id + '/unread');
        let snapshot = await starcountref.once('value');
        unread_old_count = await snapshot.val();
        updates[connection_id + '/unread'] = unread_old_count + 1;
        database.ref().update(updates);
        let resp_obj = {}; 

        resp_obj['unread'] = unread_old_count + 1;
        console.log('unread done');


      for(element of ws.clients){
        console.log('user' + element.id);
        console.log('receiver'+  message_body['receiver_id']);
        console.log('sender' + message_body['sender_id']);


        if(element.id === message_body['receiver_id']){
          let sender_user= await getUserById(message_body['sender_id']);
          resp_obj = {'response':'ok',
          'response-type':'msg_receive',
          'sender_id':message_body['sender_id'],
          'receiver_id':message_body['receiver_id'],
          'msg_body':message_body['msg_body'],
          'date':message_body['date'],
          'time':message_body['time'],
          'sender_user_name':sender_user['username'],
          'sender_user_photo':sender_user['photo']
          }
          console.log('succes sent to the receiver');
 
        }
        else if(element.id === message_body['sender_id']){
          let receiver_user = await getUserById(message_body['receiver_id']);
          resp_obj = {
          'response':'ok',
          'response-type':'msg-sent',
          'sender_id':message_body['sender_id'],
          'receiver_id':message_body['receiver_id'],
          'msg_body':message_body['msg_body'],
          'date':message_body['date'],
          'time':message_body['time'],
          'receiver_user_name':receiver_user['username'],
          'receiver_user_photo':receiver_user['photo']
          }
        }
        console.log(element.id);
        resp_msg = JSON.stringify(resp_obj);
        console.log('message sent to the receiver');
        //finally send
        element.send(resp_msg);
      }
        //save the message vvi
         //increase unread count
 ;



        console.log('done');
    }
    else if(message_body['type'] === 'req_message'){
      let connection_id = generate_message_id(message_body['main_id'], message_body['receiver_id']);
      //make reference to get unread and count
      let starcountref = await database.ref(connection_id + '/' + 'count/');
      let snapshot = await starcountref.once('value');
      let total_count = await snapshot.val();
  
      starcountref = await database.ref(connection_id + '/' + 'unread/');
      snapshot = await starcountref.once('value');
      let unread = await snapshot.val();
  
      unread_start_index = total_count - unread - 3;
      msgs = [];
      for(i=unread_start_index;i<total_count;i++){
        starcountref = await database.ref(connection_id + '/' + i);
        snapshot = await starcountref.once('value');
        message = await snapshot.val();
        msgs.push(message);
      }
  
      resp_obj = {'response':'ok','response-type':'msg-list-received',
      'data':msgs
      }
      wss.send(JSON.stringify(resp_obj));
    }
    else if(message_body['type'] === 'mark-read'){
      let connection_id = generate_message_id(message_body['sender_id'],message_body['receiver_id']);
      let updates = {};
      updates[connection_id + '/unread'] = message_body['new_unread']
      database.ref().update(updates);
      console.log('all messages have been read');
    }
    else if(message_body['type'] === 'get-last-message'){
      let connection_id = generate_message_id(message_body['primary_id'], message_body['other_id'])
      let starcountref = await database.ref(connection_id + '/count');
      let snapshot = await starcountref.once('value');
      let last_message_index = await snapshot.val();

      last_message_index = last_message_index - 1;
      //get the last message
      starcountref = await database.ref(connection_id + '/' + last_message_index);
      snapshot = await starcountref.once('value');
      last_message = await snapshot.val();
      if(!last_message){
        return;
      }
      let resp_obj = {
        'response':'ok',
        'response-type':'got-last-message',
        'msg_body':last_message['msg_body'],
        'time':last_message['time'],
        'sender_id':last_message['sender_id'],
        'receiver_id':last_message['receiver_id']
      }
      wss.send(JSON.stringify(resp_obj));
    }
  })
})

