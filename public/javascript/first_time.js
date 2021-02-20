let cta_button = document.querySelector('button.first-time-login');
let name_field = document.querySelector('div.form-group-text>input');
let age_field = document.querySelector('div.form-group-number>input')
let text_area = document.querySelector('textarea.motto');
function clear_entry(element, text=""){
    element.parentNode.children[2].innerHTML = text;
    element.parentNode.children[2].setAttribute('status', 'success');
    element.setAttribute('status', 'success');
}
function set_status(error_code, field, error_text){
    const error = error_code ? 'error':'success';
    footer_field = field.parentNode.children[2];
    field.setAttribute('status', error);
    footer_field.setAttribute('status', error);
    footer_field.innerHTML = error_text;
    if(error_code){
        console.log('errors');
        cta_button.disabled = true;
    }
    else{
        cta_button.disabled = false;
    }
}
function submit_form_data(username, age, motto){
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/first-time');
    xhr.setRequestHeader('Content-type','application/json');
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState < 3){
            cta_button.disabled = true;
        }
    }
    xhr.onload = ()=>{
       const response = xhr.response;
       console.log('response done');
       cta_button.disabled = false;
    }
    const send_obj = {
        type:'form-data',
        username : username,
        age:age,
        motto:motto
    }
    json = JSON.stringify(send_obj);
    xhr.send(json);  
}
cta_button.onclick = ()=>{
    bounce('button.first-time-login');
    submit_form_data(name_field.value, age_field.value, text_area.value);
}
name_field.onfocus = ()=>{
    clear_entry(name_field);
}
age_field.onfocus = ()=>{
    clear_entry(age_field);
}
text_area.onfocus = ()=>{
    clear_entry(text_area, "Enter here the best thing about yourself");
}


//initial setup
clear_entry(text_area, "Enter here the best thing about yourself");
cta_button.disabled = true;
//ends here



name_field.onblur = ()=>{
    footer_field = name_field.parentNode.children[2];
    if(name_field.value === ''){
        set_status(1, name_field,'This field should not be empty');
        return;
    }
    //make request to server for checking if username exists
    if(name_field.value === ''){
        set_status(1, name_field, error_text);
        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/first-time');
    const obj = {
        "type":'check',
        "username":name_field.value 
    }
    json_Obj = JSON.stringify(obj);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onload = ()=>{
        const resp = xhr.response;
        if(resp === '1'){
            set_status(1,name_field, 'Username is already taken');
        }
        else{
            set_status(0, name_field, 'Username is valid and unique');
        }
    };
    xhr.send(json_Obj);
}


age_field.onblur = ()=>{
    if(age_field.value === ''){
        set_status(1, age_field,'This field should not be empty');
        return;
    }
    if(age_field.value < 12){
        set_status(1,age_field,'You are too young, go play outside');
    }
    else if(age_field.value >= 12){
        set_status(0, age_field, 'Keep going !!!');
    }
}

text_area.onblur = ()=>{
    if(text_area.value === ''){
        set_status(1,text_area, 'This field must not be empty');
    }
    if(text_area.value.split(' ').length > 20){
        set_status(1, text_area, 'Your motto should be short');
    }
    else{
        set_status(0, text_area, 'Looks Great !!!')
    }
}