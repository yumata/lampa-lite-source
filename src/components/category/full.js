import Controller from '../../interaction/controller'
import Reguest from '../../utils/reguest'
import Card from '../../interaction/card'
import Scroll from '../../interaction/scroll'
import Api from '../../interaction/api'
import Info from '../../interaction/info'
import Activity from '../../interaction/activity'
import Arrays from '../../utils/arrays'
import Empty from '../../interaction/empty'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true,step:250})
    let items   = []
    let html    = $('<div></div>')
    let body    = $('<div class="category-full"></div>')
    let total_pages = 0
    let info
    let last
    
    
    this.create = function(){
        this.activity.loader(true)

        Api.list(object,this.build.bind(this),()=>{
            let empty = new Empty()

            html.append(empty.render())

            this.start = empty.start

            this.activity.loader(false)

            this.activity.toggle()
        })

        return this.render()
    }

    this.append = function(data){
        data.results.forEach(element => {
            let card = new Card(element, {
                card_category: true,
                object: object
            })
            
            card.create()
            card.onFocus = (target, card_data)=>{
                last = target

                scroll.update(card.render(), false)

                info.update(card_data)
            }

            card.onEnter = (target, card_data)=>{
                Activity.push({
                    url: card_data.url,
                    component: 'full',
                    id: element.id,
                    method: card_data.name ? 'tv' : 'movie',
                    card: element,
                    source: object.source
                })
            }

            card.visible()

            body.append(card.render())

            items.push(card)
        })
    }

    this.build = function(data){
        total_pages = data.total_pages

        info = new Info()

        info.create()

        scroll.render()
        scroll.minus(info.render())

        html.append(info.render())
        html.append(scroll.render())

        this.append(data)

        this.more()

        scroll.append(body)

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.more = function(){
        let more = $('<div class="category-full__more selector"><span>Показать еще</span></div>')

        more.on('hover:focus',(e)=>{
            Controller.collectionFocus(last || false,scroll.render())

            let next = Arrays.clone(object)

            delete next.activity

            next.page++

            Activity.push(next)
        })

        body.append(more)
    }


    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render())
                Controller.collectionFocus(last || false,scroll.render())
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            right: ()=>{
                Navigator.move('right')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        network.clear()

        Arrays.destroy(items)

        scroll.destroy()
        
        if(info) info.destroy()

        Api.clear()

        html.remove()
        body.remove()

        network = null
        items   = null
        html    = null
        body    = null
        info    = null
    }
}

export default component