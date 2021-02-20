//element queries
login_btn = document.querySelector('div.app-title button');
signup_btn = document.querySelector('div.app_footer button');

//utility functions

//events
login_btn.onclick = ()=>{
    bounce('div.app-title button');
    setTimeout(()=>{
        window.location.href = `${window.location.href}auth/google`; 
    },400)
}
signup_btn.onclick = ()=>{
    bounce('div.app_footer button');
    setTimeout(()=>{
        window.location.href = `${window.location.href}auth/google`; 
    },400)
}
