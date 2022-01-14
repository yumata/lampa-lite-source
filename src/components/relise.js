import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Card from '../interaction/card'
import Scroll from '../interaction/scroll'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Empty from '../interaction/empty'
import Api from '../interaction/api'
import Info from '../interaction/info'
import Storage from '../utils/storage'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true,step: 250})
    let items   = []
    let html    = $('<div></div>')
    let body    = $('<div class="category-full"></div>')
    let info
    let last
    
    
    this.create = function(){
        this.activity.loader(true)

        Api.relise({page:object.page},this.build.bind(this),()=>{
            let empty = new Empty()

            html.append(empty.render())

            this.start = empty.start

            this.activity.loader(false)

            this.activity.toggle()
        })

        return this.render()
    }


    this.append = function(data){
        data.forEach(element => {

            let card = new Card(element, {card_category: true, card_type: true})
                card.create()
                card.onFocus = (target, card_data)=>{
                    last = target

                    scroll.update(card.render(), true)

                    info.update(card_data)
                }

                card.onEnter = (target, card_data)=>{
                    card_data.id = card_data.tmdbID
                    
                    Activity.push({
                        url: '',
                        component: 'full',
                        id: card_data.tmdbID,
                        method: card_data.name ? 'tv' : 'movie',
                        card: card_data,
                        source: Storage.field('source')
                    })
                }

                card.onMenu = ()=>{

                }

                card.visible()

                body.append(card.render())

            items.push(card)
        })
    }

    this.build = function(data){
        info = new Info()

        info.create()

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
        let more = $('<div class="category-full__more selector"><span>Еще</span></div>')

        more.on('hover:enter',()=>{
            let next = Arrays.clone(object)

            delete next.activity

            next.page++

            Activity.push(next)
        }).on('hover:focus',(e)=>{
            last = e.target
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

        Api.clear()

        html.remove()
        body.remove()

        if(info) info.destroy()

        network = null
        items   = null
        html    = null
        body    = null
        info    = null
    }
}

export default component