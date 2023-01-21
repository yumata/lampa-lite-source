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
import Modal from '../../interaction/modal'
import Template from '../../interaction/template'
import Torrent from '../../interaction/torrent'

function create(data, params = {}){
    let network = new Reguest()
    let scroll  = new Scroll({over:true,step: 250})
    let html    = $('<div class="videos"></div>')
    let plugins = $('<div class="videos__plugins videos__line"></div>')
    let body    = $('<div class="videos__body"></div>')

    let js
    let last
    let started
    let history = []
    let api     = Storage.get('last_event_url','')

    let follow = (e)=>{
        if(e.name == 'events'){
            this.plugins()
        }
    }

    function metaData(url){
        let email = Storage.get('account_email','')

        if(email && url.indexOf('account_email') == -1){
            url = Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email))
            url = Utils.addUrlComponent(url, 'cub_id=' + Utils.hash(email))
        }

        return url
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

        if(data.movie.imdb_id)      query.push('imdb_id='+(data.movie.imdb_id || ''))
        if(data.movie.kinopoisk_id) query.push('kinopoisk_id='+(data.movie.kinopoisk_id || ''))

        query.push('title='+encodeURIComponent(data.movie.title || data.movie.name))
        query.push('original_title='+encodeURIComponent(data.movie.original_title || data.movie.original_name))
        query.push('original_language=' + (data.movie.original_language || ''))
        query.push('serial=' + (data.movie.name ? 1 : 0))
        query.push('year='+((data.movie.release_date || data.movie.first_air_date || '0000') + '').slice(0,4))
        query.push('source=' + Storage.field('source'))
        query.push('uid='+Storage.get('device_uid'))

        if(api){
            started = true
            
            this.get(api + (api.indexOf('?') >= 0 ? '&' : '?') + query.join('&'),true)
        }
    }

    this.plugins = function(){
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
            scroll.update($(this), true)
        })
    }

    this.call = function(target, json){
        if(json.method == 'play'){
            if(target.data('timeline')){
                json.timeline = target.data('timeline')
            }

            Player.play(json)
            Player.playlist([{
                url: json.url,
                title: json.title,
                timeline: json.timeline
            }])

            if(json.subtitles) Player.subtitles(json.subtitles)

            if(data.movie.id) Favorite.add('history', data.movie, 100)
        }
        else if(json.method == 'torrent'){
            json.poster = data.movie.img

            Torrent.start(json, data.movie)
        }
        else if(json.method == 'link' && json.url){
            this.get(json.url,true)
        }
        else if(json.method == 'show' && json.text){
            Noty$1.show(json.text)
        }
        else if(json.method == 'call' && json.url){
            function close(){
                Modal.close()
        
                network.clear()

                Controller.toggle('view_videos')
            }

            Modal.open({
                title: '',
                html: Template.get('modal_loading'),
                size: 'small',
                mask: true,
                onBack: close
            })

            network.silent(metaData(json.url),(result)=>{
                close()

                this.call(target, result)
            },close)
        }
        else if(json.method == 'select'){
            Select.show({
                title: 'Выбрать',
                items: json.items,
                onSelect: (a)=>{
                    this.call(target, a)
                },
                onBack: ()=>{
                    Controller.toggle('view_videos')
                }
            })
        }
    }

    this.parse = function(){
        body.find('.selector').on('hover:focus',function(){
            last = $(this)[0]

            scroll.update($(this), true)
        }).on('hover:enter',(e)=>{
            this.call($(e.target), Arrays.decodeJson($(e.target).attr('data-json'),{}))
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
    }

    this.getQuery = function(link) {
        var s = link,
            p = s.split(/\&/), l = p.length, kv, r = {}

        if (l === 0) {
            return false
        }

        while (l--) {
            kv = p[l].split(/\=/);
            r[kv[0]] = decodeURIComponent(kv[1] || '') || true;
        }

        return r
    }

    this.get = function(link, push_history){
        this.load()

        if(js){
            js.destroy()
            js = false
        }

        if(push_history) history.push(link)

        network.clear()

        network.silent(metaData(link),(result)=>{
            if(result.trim()){
                if(api.split('.').pop() == 'js'){
                    try{
                        js = eval('('+result+')')
                        js = new js({
                            body: body,
                            html: html,
                            object: data,
                            class: this,
                            query: this.getQuery(link.split('?').slice(1).join('?'))
                        })

                        js.start()
                    }
                    catch(e){
                        this.empty('Ошибка запуска скрипта',e.stack)
                    }
                }
                else{
                    body.empty()

                    body.append(result)

                    this.parse()

                    Controller.enable('view_videos')
                }
            }
            else  this.empty('Сервер вернул пустой результат')
        },()=>{
            this.empty()
        },false,{
            dataType: 'html'
        })
    }

    this.empty = function(text,stack){
        body.empty()

        body.append('<div class="videos__repeat selector">Повторить запрос</div><div class="videos__empty">'+(text || 'Нет подключения к сети')+'</div>'+(stack ? '<pre class="videos_stack">'+stack+'</pre>' : ''))

        body.find('.selector').on('hover:enter',()=>{
            this.get(history.pop(),true)
        })

        Controller.enable('view_videos')
    }

    this.load = function(){
        last = false

        body.empty()

        body.append('<div class="videos__loading">Загрузка... <span></span></div>')

        Controller.enable('view_videos')
    }

    this.toggle = function(){
        Controller.add('view_videos',{
            toggle: ()=>{
                Controller.collectionSet(this.render())

                let selectors = $('.selector',body),
                    focused   = body.find('.focused')[0],
                    tabactive = $('.active',plugins),
                    focus     = focused ? focused : selectors.length ? selectors.eq(0)[0] : tabactive.length ? tabactive.eq(0)[0] : false

                Controller.collectionFocus(focus, this.render())
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

        if(js) js.destroy()

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
        js      = null
    }
}

export default create
