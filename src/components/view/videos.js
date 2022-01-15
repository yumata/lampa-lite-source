import Controller from '../../interaction/controller'
import Reguest from '../../utils/reguest'
import Scroll from '../../interaction/scroll'
import Arrays from '../../utils/arrays'
import Player from '../../interaction/player'
import Select from '../../interaction/select'
import Activity from '../../interaction/activity'
import Storage from '../../utils/storage'
import Timeline from '../../interaction/timeline'
import Utils from '../../utils/math'
import Favorite from '../../utils/favorite'

function create(data, params = {}){
    let network = new Reguest()
    let scroll  = new Scroll({over:true,step: 250})
    let html    = $('<div class="videos"></div>')
    let plugins = $('<div class="videos__plugins videos__line"></div>')
    let body    = $('<div class="videos__body"></div>')

    let last
    let started
    let history = []
    let api     = Storage.get('last_event_url','')

    let follow = (e)=>{
        if(e.name == 'events'){
            this.plugins()
        }
    }

    this.create = function(){
        html.append(scroll.render())

        scroll.minus()

        scroll.append(plugins)
        scroll.append(body)

        this.plugins()

        this.start()

        Storage.listener.follow('change',follow)
    }

    this.start = function(){
        let query = []

        query.push('id='+data.movie.id)
        query.push('imdb_id='+(data.movie.imdb_id || ''))
        query.push('kinopoisk_id='+(data.movie.kinopoisk_id || ''))
        query.push('title='+encodeURIComponent(data.movie.title || data.movie.name))
        query.push('original_title='+encodeURIComponent(data.movie.original_title || data.movie.original_name))
        query.push('serial='+(data.movie.name ? 1 : 0))
        query.push('year='+((data.movie.release_date || data.movie.first_air_date || '0000') + '').slice(0,4))
        query.push('uid='+Storage.get('device_uid'))
        
        if(Storage.get('account_email','')) query.push('cub_id='+Utils.hash(Storage.get('account_email','')))

        if(api){
            started = true

            this.get(api + (api.indexOf('?') >= 0 ? '&' : '?') + query.join('&'),true)
        }
    }

    this.plugins = function(){
        last = false

        plugins.empty()

        let events = Storage.get('events','[]').filter(e=>e.url)

        if(!events.filter(e=>e.url == api).length) api = ''

        if(events.length && !api){
            api = events[0].url

            Storage.set('last_event_url',api)
        }

        events.forEach((a)=>{
            let plugin = $('<div class="videos__tab selector">'+(a.name || 'Без названия')+'</div>')

            plugin.on('hover:enter',()=>{
                history = []

                api = a.url

                Storage.set('last_event_url',a.url)

                $('>*',plugins).removeClass('active')

                plugin.addClass('active')

                this.start()
            })

            if(api == a.url) plugin.addClass('active')

            plugins.append(plugin)
        })

        let add = $('<div class="videos__button selector">Управлять событиями</div>')

        add.on('hover:enter',()=>{
            Activity.push({
                url: '',
                component: 'events'
            })
        })

        plugins.prepend(add)

        $('>*',plugins).on('hover:focus',function(){
            last = $(this)[0]

            scroll.update($(this), true)
        })
    }

    this.get = function(link, push_history){
        this.load()

        if(push_history) history.push(link)

        network.clear()

        network.silent(link,(result)=>{
            body.empty()

            last = false

            if(result.trim()){
                body.append(result)

                body.find('.selector').on('hover:focus',function(){
                    last = $(this)[0]

                    scroll.update($(this), true)
                }).on('hover:enter',(e)=>{
                    let json = Arrays.decodeJson($(e.target).attr('data-json'),{})

                    if(json.method == 'play'){
                        if($(e.target).data('timeline')){
                            json.timeline = $(e.target).data('timeline')
                        }

                        Player.play(json)
                        Player.playlist([json.url])

                        if(data.movie.id) Favorite.add('history', data.movie, 100)
                    }
                    else if(json.method == 'link' && json.url){
                        this.get(json.url,true)
                    }
                    else if(json.method == 'select'){
                        Select.show({
                            title: 'Выбрать',
                            items: json.items,
                            onSelect: (a)=>{
                                if(a.method == 'play'){
                                    Player.play(a)
                                    Player.playlist([a.url])
                                } 
                                else if(a.method == 'link' && a.url) this.get(a.url,true)
                            },
                            onBack: ()=>{
                                Controller.toggle('view_videos')
                            }
                        })
                    }
                })

                body.find('[media]').each(function(){
                    let media = $(this)

                    let season  = parseInt(media.attr('s') || '1'),
                        episode = parseInt(media.attr('e') || '1')

                    let hash = Utils.hash(data.movie.name ? [season,episode,data.movie.original_title].join('') : data.movie.original_title)
                    let view = Timeline.view(hash)

                    media.data('timeline',view)

                    media.append(Timeline.render(view))
                })

                Controller.enable('view_videos')
            }
            else  this.empty('Сервер вернул пустой результат')
        },()=>{
            this.empty()
        },false,{
            dataType: 'html'
        })
    }

    this.empty = function(text){
        last = false

        body.empty()

        body.append('<div class="videos__repeat selector">Повторить запрос</div><div class="videos__empty">'+(text || 'Нет подключения к сети')+'</div>')

        body.find('.selector').on('hover:enter',()=>{
            this.get(history.pop(),true)
        })

        Controller.enable('view_videos')
    }

    this.load = function(){
        last = false

        body.empty()

        body.append('<div class="videos__loading selector">Загрузка... <span></span></div>')

        Controller.enable('view_videos')
    }

    this.toggle = function(){
        Controller.add('view_videos',{
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last || body.find('.focused')[0], this.render())
            },
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            down:()=>{
                Navigator.move('down')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else this.onUp()
            },
            gone: ()=>{

            },
            back: ()=>{
                if(history.length > 1){
                    history.pop()

                    this.get(history[history.length-1],false)
                }
                else this.onBack()
            }
        })

        Controller.toggle('view_videos')

        if(!started) this.start()
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        network.clear()

        scroll.destroy()

        Storage.listener.remove('change',follow)

        html.remove()
        body.remove()
        plugins.remove()

        last    = null
        network = null
        scroll  = null
        html    = null
        body    = null
        plugins = null
        history = null
    }
}

export default create