import category_full from '../components/category/full'
import favorite from '../components/favorite'
import relise from '../components/relise'
import full from '../components/view'
import events from '../components/events'
import nocomponent from '../components/nocomponent'

//todo при переименовании компонентов может сломаться логика загрузки последнего стейта, т.к. в сторедже будет стейт со старым именем
let component = {
    category_full,
    favorite,
    relise,
    full,
    events,
    nocomponent
}

function create(object){
    if(component[object.component]){
        return new component[object.component](object)
    }
    else{
        return new component.nocomponent(object)
    }
}

function add(name, comp){
    component[name] = comp
}

function get(name){
    return component[name]
}

export default {
    create,
    add,
    get
}