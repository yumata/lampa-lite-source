import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Scroll from '../interaction/scroll'
import Start from '../components/view/start'
import Videos from '../components/view/videos'
import Api from '../interaction/api'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Empty from '../interaction/empty'

let components = {
    start: Start,
    videos: Videos,
}

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true,step:400,scroll_by_item:true})
    let items   = []
    let active  = 0

    scroll.render().addClass('layer--wheight')

    this.create = function(){
        this.activity.loader(true)

        Api.full(object,(data)=>{
            this.activity.loader(false)

            if(data.movie){
                Lampa.Listener.send('view',{type:'start',object,data})

                this.build('start', data)
                this.build('videos', data)

                Lampa.Listener.send('view',{type:'complite',object,data})

                this.activity.toggle()
            }
            else{
                this.empty()
            }
        },this.empty.bind(this))

        return this.render()
    }

    this.empty = function(){
        let empty = new Empty()

        scroll.append(empty.render())

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.build = function(name, data, params){
        let item = new components[name](data, {object: object, nomore: true, ...params})

        item.onDown = this.down
        item.onUp   = this.up
        item.onBack = this.back

        item.create()

        items.push(item)

        Lampa.Listener.send('view',{type:'build',name: name, body: item.render()})

        scroll.append(item.render())
    }

    this.down = function(){
        active++

        active = Math.min(active, items.length - 1)

        items[active].toggle()

        scroll.update(items[active].render())
    }

    this.up = function(){
        active--

        if(active < 0){
            active = 0
        }
        else{
            items[active].toggle()
        }

        scroll.update(items[active].render())
    }

    this.back = function(){
        Activity.backward()
    }

    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                if(items.length){
                    items[active].toggle()
                }
            }
        })

        Controller.toggle('content')
    }

    this.parse = function(){
        if(items.length){
            items[1].parse()
        }
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return scroll.render()
    }

    this.destroy = function(){
        Lampa.Listener.send('view',{type:'destroy',object})

        network.clear()

        Arrays.destroy(items)

        scroll.destroy()

        items = null
        network = null
    }
}

export default component