import Template from './template'
import Api from './api'
import Arrays from '../utils/arrays'
import Select from './select'
import Favorite from '../utils/favorite'
import Controller from './controller'

function create(data, params = {}){
    Arrays.extend(data,{
        title: data.name,
        original_title: data.original_name,
    })

    let card  = Template.get('card',data)
    let img   = card.find('img')[0] || {}
    let vote  = parseFloat((data.vote_average || 0) + '')

    if(data.name) card.append('<div class="card__type">TV</div>')
    if(vote > 0)  card.append('<div class="card__vote">'+vote+'</div>')

    this.image = function(){
        img.onload = function(){
            card.addClass('card--loaded')
        }
    
        img.onerror = function(e){
            img.src = './img/img_broken.svg'
        }
    }

    this.addicon = function(name){
        card.find('.card__icons-inner').append('<div class="card__icon icon--'+name+'"></div>')
    }

    this.favorite = function(){
        let status = Favorite.check(data)

        card.find('.card__icon').remove()

        if(status.book) this.addicon('book')
        if(status.like) this.addicon('like')
        if(status.wath) this.addicon('wath')
    }

    this.onMenu = function(target, data){
        let enabled = Controller.enabled().name
        let status  = Favorite.check(data)

        Select.show({
            title: 'Действие',
            items: [
                {
                    title: status.book ? 'Убрать из закладок' : 'В закладки',
                    subtitle: 'Смотрите в меню (Закладки)',
                    where: 'book'
                },
                {
                    title: status.like ? 'Убрать из понравившихся' : 'Нравится',
                    subtitle: 'Смотрите в меню (Нравится)',
                    where: 'like'
                },
                {
                    title: status.wath ? 'Убрать из ожидаемых' : 'Смотреть позже',
                    subtitle: 'Смотрите в меню (Позже)',
                    where: 'wath'
                }
            ],
            onBack: ()=>{
                Controller.toggle(enabled)
            },
            onSelect: (a)=>{
                if(params.object) data.source = params.object.source

                Favorite.toggle(a.where, data)

                this.favorite()

                Controller.toggle(enabled)
            }
        })
    }

    this.create = function(){
        this.favorite()

        card.on('hover:focus',(e)=>{
            this.onFocus(e.target, data)
        }).on('hover:enter',(e)=>{
            this.onEnter(e.target, data)
        }).on('hover:long',(e)=>{
            this.onMenu(e.target, data)
        })

        this.image()
    }

    this.visible = function(){
        if(this.visibled) return

        if(data.poster_path) img.src = Api.img(data.poster_path)
        else if(data.poster) img.src = data.poster
        else if(data.img)    img.src = data.img
        else                 img.src = './img/img_broken.svg'

        this.visibled = true
    }

    this.destroy = function(){
        img.onerror = ()=>{}
        img.onload = ()=>{}

        img.src = ''

        card.remove()

        card = null

        img = null
    }

    this.render = function(){
        return card
    }
}

export default create