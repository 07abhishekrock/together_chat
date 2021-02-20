


function bounce(element_query, callback,y=-3){
    gsap.to(element_query,{duration: 0.2,y : y});
    gsap.to(element_query,{duration: 0.2,y: 0,delay:0.2, onComplete:callback});
}


function add_events_and_hover_state(element,index, options, options_body){
element.setAttribute('animate', '1');
setTimeout(()=>{
    element.setAttribute('animate', '0');
}, 500)
past_index = options_body.getAttribute('past_index');
if(past_index != '-1')
{
    options[past_index].setAttribute('select', 0);
    options[past_index].children[0].style.backgroundImage = `url('/res/icons/${parseInt(past_index)+1}_not_selected.svg')`;
}
element.setAttribute('select', 1);
options_body.setAttribute('past_index', index);
element.children[0].style.backgroundImage = `url('/res/icons/${parseInt(index)+1}_selected.svg')`;
}