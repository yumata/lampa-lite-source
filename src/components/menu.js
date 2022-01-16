import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Select from '../interaction/select'
import Api from '../interaction/api'
import Activity from '../interaction/activity'
import Modal from '../interaction/modal'
import Scroll from '../interaction/scroll'
import Storage from '../utils/storage'

let html
let last
let scroll

function init(){
    html   = Template.get('menu')
    scroll = new Scroll({mask: true, over: true})

    Lampa.Listener.send('menu',{type:'start',body: html})

    $('body').on('mouseup',()=>{
        if($('body').hasClass('menu--open')){
            $('body').toggleClass('menu--open',false)

            Controller.toggle('content')
        }
    })

    scroll.minus()
    scroll.append(html)

    Lampa.Listener.send('menu',{type:'end'})

    Controller.add('menu',{
        toggle: ()=>{
            Controller.collectionSet(html)
            Controller.collectionFocus(last,html)
    
            $('body').toggleClass('menu--open',true)
        },
        right: ()=>{
            Controller.toggle('content')
        },
        up: ()=>{
            if(Navigator.canmove('up')) Navigator.move('up')
        },
        down: ()=>{
            Navigator.move('down')
        },
        gone: ()=>{
            $('body').toggleClass('menu--open',false)
        },
        back: ()=>{
            Activity.backward()
        }
    })
}

function ready(){
    html.find('.selector').on('hover:enter',(e)=>{
        let action = $(e.target).data('action')
        let type   = $(e.target).data('type')

        if(action == 'catalog') catalog()

        if(action == 'movie' || action == 'tv' || action == 'anime'){
            Activity.push({
                url: Storage.field('source') == 'cub' ? '?cat='+action+'&sort=top&results=25' : action + '/popular',
                title: (action == 'movie' ? 'Фильмы' : action == 'anime' ? 'Аниме' : 'Сериалы') + ' - ' + Storage.field('source').toUpperCase(),
                component: 'category_full',
                source: action == 'anime' ? 'cub' : Storage.field('source'),
                page: 1
            })
        }

        if(action == 'main'){
            Activity.push({
                url: '',
                title: 'Главная - ' + Storage.field('source').toUpperCase(),
                component: 'main',
                source: Storage.field('source')
            })
        }

        if(action == 'search')   Controller.toggle('search')
        if(action == 'settings') Controller.toggle('settings')
        if(action == 'about'){
            Modal.open({
                title: 'О приложении',
                html: Template.get('about'),
                size: 'medium',
                onBack: ()=>{
                    Modal.close()

                    Controller.toggle('content')
                }
            })
        }

        if(action == 'favorite'){
            Activity.push({
                url: '',
                title: type == 'book' ? 'Закладки' : type == 'like' ? 'Нравится' : type == 'history' ? 'История просмотров' : 'Позже',
                component: 'favorite',
                type: type,
                page: 1
            })
        }

        if(action == 'relise'){
            Activity.push({
                url: '',
                title: 'Цифровые релизы',
                component: 'relise',
                page: 1
            })
        }

        html.find('.selector').removeClass('active')

        $(e.target).addClass('active')
    }).on('hover:focus',(e)=>{
        last = e.target

        scroll.update($(e.target),true)
    })
}

function catalog(){
    Api.menu({
        source: Storage.field('source')
    },(menu)=>{
        Select.show({
            title: 'Каталог',
            items: menu,
            onSelect: (a)=>{
                Activity.push({
                    url: Storage.field('source') == 'cub' ? '?sort=top&results=25' : 'movie/popular',
                    title: 'Каталог - ' + a.title,
                    component: 'category_full',
                    genres: a.id,
                    id: a.id,
                    source: Storage.field('source'),
                    page: 1
                })
            },
            onBack: ()=>{
                Controller.toggle('menu')
            }
        })
    })
}

function render(){
    return scroll.render()
}

export default {
    render,
    init,
    ready
}