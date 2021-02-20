let options_body = document.querySelector('div.footer-options');
let options = document.querySelectorAll('div.option');
let chat_list = document.querySelector('ul.chat-list');
let arrow = document.querySelectorAll('div.arrow');
let send_btn = document.querySelector('div.msg_entry>button');
let collapse_footer = document.querySelector('div.footer-options>button');
let textarea = document.querySelector('textarea');
let chat_body = document.querySelector('div.chat-text-body');
let back_button = document.querySelector('div.top-heading>div');
let main_profile_pic = document.querySelector('div.profile_pic_main');
let span_heading = document.querySelector('div.top-heading>span');
let msg_icon = document.querySelector('div.new-msg');
let contacts_body = document.querySelector('div.contacts-body');
let contacts_search = document.querySelector('div.contacts-body div.search-icon')
let hidden_id = document.getElementById('hidden_field');

function rtc_call_for_id(username){
   chat_body.innerHTML = '';


   console.log('hello world');
   let msg = {'type':'return_id','name':username}
   let msg_obj = JSON.stringify(msg);
   ws.send(msg_obj);
}


options.forEach((element, index)=>{
   element.onclick = ()=>{
    add_events_and_hover_state(element,index, options, options_body);
   } 
})

function move_chat_body(direction,text,bridge){
      one_width_unit = window.innerWidth;
      total_move_units = 3 * (one_width_unit/100) + 10;
   if(!direction){
      rtc_call_for_id(text);
      span_heading.innerHTML = `<large>${text[0]}</large><small>${text.substring(1)}</small>`;
      span_heading.setAttribute('cur_user', text);
      gsap.fromTo('div.chat-body', {duration:0.5 , yPercent:150, opacity:0}, {yPercent:0, opacity:1, onComplete:()=>{chat_body.parentNode.style.pointerEvents = 'all'}})
      gsap.fromTo('div.top-heading>div:first-child',{duration:0.5,scale:(0,0),opacity:0},{scale:(1,1),opacity:1});
      gsap.to('div.top-heading>span', {duration:0.5, x:total_move_units - 10,onComplete:()=>{back_button.classList.remove('disappear');}})
   }
   else{
      span_heading.innerHTML = '<large>T</large><small>ogether</small>';
      gsap.fromTo('div.chat-body', {duration:0.5 , yPercent:0, opacity:1}, {yPercent:150, opacity:0, onComplete:()=>{chat_body.parentNode.style.pointerEvents = 'all'}})
      gsap.fromTo('div.top-heading>div:first-child', {duration:0.5 , scale:(1,1),opacity:1}, {scale:(0,0) , opacity:0, onComplete:()=>{chat_body.parentNode.style.pointerEvents = 'none'; back_button.classList.add('disappear')}})
      if(!bridge)
      {
         console.log('hello');
        gsap.to('div.top-heading>span', {duration:0.5, x:-2 * total_move_units + 10,delay:0.9});
      }
   }
}

function move_contact_body(direction,bridge=false){
   one_width_unit = window.innerWidth;
   total_move_units = 3 * (one_width_unit/100) + 10;
   if(!direction){
      back_button.classList.remove('disappear');
      span_heading.innerHTML = '<large>C</large><small>hats</small>';
      gsap.fromTo('div.contacts-body', {duration:0.5 , yPercent:150, opacity:0}, {yPercent:0, opacity:1, onComplete:()=>{contacts_body.style.pointerEvents = 'all'}})
         gsap.fromTo('div.top-heading>div:first-child',{scale:(0,0),opacity:0},{duration:0.5,scale:(1,1),opacity:1})
         gsap.to('div.top-heading>span', {duration:0.5, x:total_move_units - 10,onComplete:()=>{back_button.classList.remove('disappear');}})


}
else{
      span_heading.innerHTML = '<large>T</large><small>ogether</small>';
      gsap.fromTo('div.contacts-body', {duration:0.9, yPercent:0, opacity:1}, {yPercent:150, opacity:1,onComplete:()=>{
      back_button.classList.add('disappear')
      contacts_body.style.pointerEvents = 'none';
   }});
      gsap.fromTo('div.top-heading>div:first-child',{duration:0.9,delay:0.3, scale:(1,1),opacity:1}, {scale:(0,0),opacity:0})
      gsap.to('div.top-heading>span', {duration:0.5, x:-2 * total_move_units + 10,delay:0.9});
}
}

textarea.onfocus = ()=>{
   chat_body.scrollTo(0,chat_body.scrollHeight);
}

collapse_footer.onclick = (e)=>{
   let face_value = e.target.getAttribute('face');
   if(face_value === 'up'){
      e.target.setAttribute('face', 'down');
      gsap.to('div.footer-options', {yPercent:-90, duration:0.5});
   }
   else{
      e.target.setAttribute('face', 'up');
      gsap.to('div.footer-options', {yPercent:0, duration:0.5});
   }
}

chat_list.onclick = (e)=>{
   console.log(e.target);
   if(e.target.parentNode.classList[0] === 'chat-list'){
         back_button.setAttribute('window', '0');
         move_chat_body(0,e.target.children[1].children[0].innerHTML)
}}

arrow.forEach((element, index)=>
element.onclick = (e)=>{
      element_query = `ul.chat-list>li:nth-child(${index+1})>div.collapse-options>div`;
      element_parent_query = `ul.chat-list>li:nth-child(${index+1})>div.collapse-options`;
      chat_line_query = `ul.chat-list>li:nth-child(${index+1}) div.chat-line`;
      image_query = `ul.chat-list>li:nth-child(${index+1})>div.profile-body>div.image`
      gsap.to(element_parent_query, {width:'calc(100% - 24vw)', duration:0.5}); 
      gsap.to(image_query, {xPercent:600, duration:0.8, delay:0.8});
      gsap.to(chat_line_query, {opacity:0, duration:0.2});
      gsap.fromTo(element_query, {yPercent : 200, opacity:0},{yPercent : 0, delay:0.6,duration: 0.7, stagger:-0.2, opacity:1, ease:"power1.out"});
   setTimeout(()=>{element.setAttribute('collapse', '0')}, 700);
}
)

back_button.onclick = ()=>{
   const window_index = back_button.getAttribute('window');

   if(window_index === '1'){
      move_contact_body(1);
   }
   else if(window_index === '0'){
      move_chat_body(1);
   }
   else if(window_index === '2'){
      move_chat_body(1,"CHATS",bridge=true);
      move_contact_body(0);
      back_button.setAttribute('window', '1');
   }
}

msg_icon.onclick = ()=>{
   back_button.setAttribute('window', '1');
   bounce('div.new-msg',move_contact_body(0));
}

function create_li_elements(obj){

   obj.forEach((element,index)=>{
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.style.backgroundImage = `url("${element['photo']}")`;
      const div = document.createElement('div');
      const span_child_1 = document.createElement('span');
      const span_child_2 = document.createElement('span');
      span_child_1.innerHTML = element['name'];
      span_child_2.innerHTML = element['motto'];
      div.appendChild(span_child_1);
      div.style.pointerEvents = "none";
      div.appendChild(span_child_2);
      li.appendChild(span);
      li.appendChild(div);
      li.classList.add('search-item');
      contacts_body.children[2].append(li);
   })
}

contacts_search.onclick = ()=>{
   let xhr = new XMLHttpRequest();   
   contacts_body.children[1].setAttribute('animate','1');
   xhr.open('POST', '/chat_page');
   xhr.setRequestHeader('Content-type','application/json');
   xhr.onload = ()=>{
      contacts_body.children[2].innerHTML = "";
      contacts_body.children[1].setAttribute('animate', 0);
      if(xhr.response === 'no-response'){
         contacts_body.children[3].style.opacity = 1;
         return;
      }
      contacts_body.children[3].style.opacity = 0;
      let obj_array = JSON.parse(xhr.response);
      create_li_elements(obj_array);
   }
   const obj = {type:'list-all',value:contacts_search.parentNode.children[0].value};
   json_obj = JSON.stringify(obj);
   xhr.send(json_obj);
}

contacts_body.children[2].onclick = (e)=>{
   if(e.target.classList[0] === 'search-item'){
      //chat element is pressed
      move_chat_body(0,e.target.children[1].children[0].innerHTML);
      back_button.setAttribute('window',2);
   }
}
//coding the chat mechanism very important

function msg_pop_in(flag,index,text,time_rec,scroll){

   //create msg element
   //0 when message is sent //will get the receive class
   //1 when message is received  // will get the send class


   let msg = document.createElement('span');
   msg.classList.add('message');

   msg.setAttribute('type', index ? 'send':'receive');

   let x = Date().split(' ');
   let date = `${x[2]} ${x[1]} ${x[3]}`; 
   let time = `${x[4].split(':')[0]}:${x[4].split(':')[1]}`;


//flag decides if the given values are used or not
if(flag===0){
   msg.innerHTML = `${textarea.value}<i>${time}</i>`
   //this implies the message object needs to be sent
   let message = {
      'type':'msg_send',
      'sender_id':hidden_id.value,
      'receiver_id':hidden_id.getAttribute('receiver'),
      'msg_body':textarea.value,
      'date':date,
      'time':time,
   }
   message_obj = JSON.stringify(message);
   ws.send(message_obj);
   textarea.value = "";
   chat_body.scrollTo(0,chat_body.scrollHeight);
}
else{
   msg.innerHTML = `${text}<i>${time_rec}</i>` 
}

if(scroll){
chat_body.scrollTo(0,chat_body.scrollHeight);
}
console.log('message sent');
chat_body.append(msg);

}
send_btn.onclick = ()=>{
   if(textarea.value === ""){
      return;
   }
   send_btn.disabled = true;
   //make ajax request to get the details of the user
   //ends here
   bounce('div.msg_entry>button',()=>msg_pop_in(0,0,'none','none',1));
   setTimeout(()=>{
      send_btn.disabled = false;
   },500);
}
function update_chat_list(msg,sent=1){
   let flag = 0;
   for(const element of Array.from(chat_list.children)){
      console.log(element.getAttribute('id'));
      console.log(msg['sender_id']);
      console.log(msg['receiver_id']);
      if(element.getAttribute('id') === msg['sender_id']){
         console.log("the conversation is already at the home screen")
         if(msg['msg_body'].length > 22){
         element.children[1].children[1].innerHTML = `<i>RECEIVE</i>${msg['msg_body'].substring(0,22)}...`;
         }
         else{
         element.children[1].children[1].innerHTML = `<i>RECEIVE</i>${msg['msg_body']}`;
         }
         element.children[1].children[2].innerHTML =  msg['time']; 
         element.children[0].children[0].classList.remove('invisible');
         element.children[0].children[0].innerHTML = msg['unread']; 
         if(msg['unread']===0){
         element.children[0].children[0].classList.add('invisible');
         }
         flag = 1;
      }

     else if(element.getAttribute('id') === msg['receiver_id'])
      {
         console.log("the conversation is carrying on");
         if(msg['msg_body'].length > 22){
            element.children[1].children[1].innerHTML = `<i>SEND</i>${msg['msg_body'].substring(0,22)}...`;
         }
         else{
            element.children[1].children[1].innerHTML = `<i>SEND</i>${msg['msg_body']}`;
         }
         element.children[1].children[2].innerHTML = msg['time'];
         //no unread because this was sent
         element.children[0].children[0].classList.add('invisible');
         flag = 1;
      }
   }
      if(flag === 0)
     {
         //create a new user object
         console.log('created new user object');
         if(sent){
         new_user = {'photo':msg['sender_user_photo'],'username':msg['sender_user_name']}
         create_li_home(new_user,msg,msg['unread']);
         }
         else{
            new_user = {'photo':msg['receiver_user_photo'], 'username':msg['sender_user_name']}
            create_li_home(new_user,msg,0);
         }
      }
}
function create_li_home(user,msg,unread){
   let chat_element = document.createElement('li');
   let profile_pic = document.createElement('div');
   let message_body = document.createElement('div');
   let title = document.createElement('span');
   let message = document.createElement('span');
   let time = document.createElement('span');
   let unread_span = document.createElement('span');

   //adding profile photo 
   profile_pic.classList.add('profile-pic');
   profile_pic.style.backgroundImage = `url('${user.photo}')`; 
   chat_element.appendChild(profile_pic);
   unread_span.innerHTML = unread;
   profile_pic.appendChild(unread_span);
   message_body.classList.add('profile-info');
   
   //adding message body
   //adding title
   title.innerHTML = user['username'];
   message_body.appendChild(title);
   //adding message
   if(msg['sender_id'] === hidden_id.value){
      //the sender is the same as the current user
      if(msg['msg_body'].length > 22){
         message.innerHTML = `<i>SEND</i>${msg['msg_body'].substring(0,22)}...`;
         }
         else{
         message.innerHTML = `<i>SEND</i>${msg['msg_body']}`;
         }
      unread_span.classList.add('invisible');
   }
   else{
         if(msg['msg_body'].length > 22){
         message.innerHTML = `<i>RECEIVE</i>${msg['msg_body'].substring(0,22)}...`;
         }
         else{
         message.innerHTML = `<i>RECEIVE</i>${msg['msg_body']}`;
         }
      unread_span.classList.remove('invisible');
   }
   message_body.appendChild(message);
   //adding time
   time.innerHTML = msg['time'];
   message_body.appendChild(time);

   chat_element.appendChild(profile_pic);
   chat_element.appendChild(message_body);
   let parentelement = document.querySelector('ul.chat-list');
   chat_element.setAttribute('id',(msg['sender_id']===hidden_id.value)?msg['receiver_id']:msg['sender_id'])
   parentelement.appendChild(chat_element);
   setTimeout(()=>{chat_element.style.opacity = 1;chat_element.style.transform = `translateY(0px)`},100);
}


//coding for websocket very important
ws = new WebSocket('ws://localhost:8080');
ws.onopen = ()=>{
   let msg_obj = {
      'type':'welcome',
      'id':hidden_field.value
   };
   msg_string = JSON.stringify(msg_obj);
   ws.send(msg_string);
}
ws.onmessage = (message)=>{
   let msg_obj = JSON.parse(message.data);
   console.log(msg_obj['response-type']);
   if(msg_obj['response'] === 'ok'){
      if(msg_obj['response-type'] === 'return_id'){
         hidden_id.setAttribute('receiver',msg_obj['id']);
         //load messages here
         //make an ajax request to the server to get all the messages
         let req_obj = {
            'type':"req_message",
            'main_id':hidden_id.value,
            'receiver_id':msg_obj['id']
         }
         //clear existing messages
         ws.send(JSON.stringify(req_obj));

         //make request to clear all read messages
         let resp_obj = {
            'response':'ok',
            'type':'get-last-message',
            'primary_id':hidden_id.value,
            'other_id':hidden_id.getAttribute('receiver')
         }
         ws.send(JSON.stringify(resp_obj));
      }
      else if(msg_obj['response-type'] === 'msg_receive'){
         const attr_window = back_button.getAttribute('window');
         console.log(attr_window);
            //chat window is high
            let resp_obj = {
               'response':'ok',
               'type':'mark-read',
               'receiver_id':msg_obj['receiver_id'],
               'sender_id':msg_obj['sender_id']
            }
            if(((attr_window === '0') || (attr_window === '2')) && !(Array.from(back_button.classList).includes('disappear'))){
                  console.log('window open')
               //mark all messages as read;
               if(msg_obj['sender_id'] === hidden_id.getAttribute('receiver')){
                  msg_pop_in(1,1,msg_obj['msg_body'],msg_obj['time'],1);
                  resp_obj['new_unread'] = 0;
                  ws.send(JSON.stringify(resp_obj));
                  msg_obj['unread'] = 0;
               }
            }
         update_chat_list(msg_obj);

      }
      else if(msg_obj['response-type'] === 'chat-setup'){
         for (const element of msg_obj['data']){
            let user = element['user'];
            let msg = element['unread'][0];
            let unread_count = element['unread'][1]
            create_li_home(user,msg,unread_count);
         }   
      }
      else if(msg_obj['response-type']=== 'msg-sent'){
         //message was sent successfully
         console.log(msg_obj);
         msg_obj['unread'] = 0;
         update_chat_list(msg_obj, sent=0);
      }
      else if(msg_obj['response-type'] === 'msg-list-received'){
         //messages successfully received
         console.log(msg_obj);
         for (const element in msg_obj['data']){
            console.log(element);
            index_data = msg_obj['data'][element];
            if(!index_data){
               continue;
            }
            if(index_data['sender_id'] === hidden_id.value){
               msg_pop_in(1,0,index_data['msg_body'],index_data['time'],0);
            }
            else if(index_data['receiver_id'] === hidden_id.value){
               msg_pop_in(1,1,index_data['msg_body'],index_data['time'],0);
            }
         }
      }
      else if(msg_obj['response-type'] === 'got-last-message'){
         console.log('last message received');
         if(hidden_id.value === msg_obj['receiver_id']){
            //you RECEIVED the last message , mark all as read
            //sent is 1
            msg_obj['unread'] = 0;
            update_chat_list(msg_obj);
            let resp_obj = {
               'response':'ok',
               'type':'mark-read',
               'receiver_id':msg_obj['receiver_id'],
               'sender_id':msg_obj['sender_id']
            }
                  resp_obj['new_unread'] = 0;
                  ws.send(JSON.stringify(resp_obj));

         }
      }
      
   }
}
