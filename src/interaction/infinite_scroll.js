import Scroll from './scroll'
import Arrays from '../utils/arrays'
import Card from './card'
import Controller from './controller'

function infinite(object, params){
    let scroll = new Scroll({mask:true,over:true,step:250})
    let body   = $('<div class="category-full"></div>')
    let items  = []
    let render = []
    let load   = params.data
    let row    = 0

    function append(element){
        let item = new Card(element, {
            card_category: true,
            object: object
        })

        item.create()

        item.render().on('hover:enter',(e)=>{
            //scroll.update($(e.target),true)
        })

        params.onItem(item, element)

        items.push(item)

        render.push(item.render())
    }

    function clear(){
        render.forEach((element)=>{
            element.detach()
        })
    }

    function display(){
        let position = 5 * row

        render.slice(position, position + 10).forEach((item)=>{
            body.append(item)
        })

        items.slice(position, position + 10).forEach((card)=>{
            card.visible()
        })

        Controller.collectionSet(body)
        Controller.collectionFocus(render.slice(position, position + 1)[0][0],body)

        Controller.updateSelects()

        let maxrow = Math.ceil(items.length / 5) - 2

        
        if(position / 5 >= maxrow) params.onNext((data)=>{
            data.forEach((item)=>{
                load.push(item)

                append(item)
            })
        })
        
    }

    this.create = function(){
        scroll.append(body)

        scroll.minus(params.info)

        load.forEach(append)

        display()
    }

    this.onDown = function(){
        row++

        row = Math.min(Math.ceil(items.length / 5)-1, row)

        clear()

        display()
    }

    this.onUp = function(){
        row--

        row = Math.max(0,row)

        clear()

        display()
    }

    this.update = function(){
        display()
    }

    this.render = function(){
        return scroll.render()
    }

    this.destroy = function(){

    }
}

export default infinite