import Subscribe from '../../utils/subscribe'
import Scroll from '../../interaction/scroll'
import Controller from '../../interaction/controller'
import Api from '../../interaction/api'
import Arrays from '../../utils/arrays'
import Line from '../../interaction/items/line'
import Activity from '../../interaction/activity'

function create(){
    let scroll,
        timer,
        items  = [],
        active = 0,
        query

    this.listener = Subscribe()

    this.create = function(){
        scroll = new Scroll({over: true})
    }

    this.search = function(value){
        clearTimeout(timer)

        query = value

        Api.clear()

        if(value.length >= 3){
            timer = setTimeout(()=>{
                Api.search({query: encodeURIComponent(value)},(data)=>{
                    this.clear()

                    if(data.movie && data.movie.results.length)   this.build(data.movie,'movie')
                    if(data.tv && data.tv.results.length)         this.build(data.tv,'tv')

                    const name = Controller.enabled().name

                    if(name == 'items_line' || name == 'search_results') Controller.toggle('search_results')
                })
            },1000)
        }
        else{
            this.clear()
        }
    }

    this.build = function(data, type){
        data.noimage = true
        
        let params = {
            align_left: true,
            object: {
                source: 'cub'
            }
        }

        let item = new Line(data,params)

        item.onDown = this.down
        item.onUp   = this.up
        item.onBack = this.back.bind(this)
        item.onLeft = ()=>{
            this.listener.send('left')
        }

        item.onEnter = ()=>{
            this.listener.send('enter')
        }

        item.onMore = (e, element)=>{
            Activity.push({
                url: 'search/' + type,
                title: 'Поиск - ' + query,
                component: 'category_full',
                page: 2,
                query: encodeURIComponent(query),
                source: 'tmdb'
            })
        }

        item.create()

        items.push(item)

        scroll.append(item.render())
    }

    this.back = function(){
        this.listener.send('back')
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

    this.any = function(){
        return items.length
    }

    this.clear = function(){
        scroll.reset()
        scroll.append('<div class="selector" style="opacity: 0"></div>')

        active = 0

        Arrays.destroy(items)

        items = []
    }

    this.toggle = function(){
        Controller.add('search_results',{
            invisible: true,
            toggle: ()=>{
                Controller.collectionSet(scroll.render())

                if(items.length){
                    items[active].toggle()
                } 
            },
            back: ()=>{
                this.listener.send('back')
            },
            left: ()=>{
                this.listener.send('left')
            }
        })

        Controller.toggle('search_results')
    }

    this.render = function(){
        return scroll.render()
    }

    this.destroy = function(){
        clearTimeout(timer)

        Api.clear()

        this.clear()

        scroll.destroy()

        this.listener.destroy()
    }
}

export default create