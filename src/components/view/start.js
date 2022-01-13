import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Utils from '../../utils/math'
import Api from '../../interaction/api'
import Arrays from '../../utils/arrays'
import Favorite from '../../utils/favorite'

function create(data, params = {}){
    let html
    
    Arrays.extend(data.movie,{
        title: data.movie.name,
        original_title: data.movie.original_name,
        runtime: 0,
        img: data.movie.poster_path ? Api.img(data.movie.poster_path) : 'img/img_broken.svg',
        release_date: data.movie.first_air_date 
    })

    this.create = function(){
        let genres = (data.movie.genres || ['---']).slice(0,3).map((a)=>{
            return Utils.capitalizeFirstLetter(a.name)
        }).join(', ')

        let vote = parseFloat((data.movie.vote_average || 0) + '')


        html = Template.get('view',{
            title: data.movie.title,
            original_title: data.movie.original_title,
            descr: Utils.substr(data.movie.overview || 'Без описания.', 420),
            img: data.movie.img,
            time: Utils.secondsToTime(data.movie.runtime * 60,true),
            genres: genres,
            vote: vote,
            seasons: data.movie.number_of_seasons,
            episodes: data.movie.number_of_episodes,
            year: ((data.movie.release_date || '0000') + '').slice(0,4)
        })

        if(data.movie.number_of_seasons){
            html.find('.is--serial').removeClass('hide')
        }

        html.find('.info__icon').on('hover:enter',(e)=>{
            let type = $(e.target).data('type')

            params.object.card        = data.movie
            params.object.card.source = params.object.source

            Favorite.toggle(type, params.object.card)

            this.favorite()
        })

        this.favorite()
    }

    
    this.favorite = function(){
        let status = Favorite.check(params.object.card)

        $('.view__favorite > *',html).removeClass('active')

        $('[data-name="book"]',html).toggleClass('active',status.book)
        $('[data-name="like"]',html).toggleClass('active',status.like)
        $('[data-name="wath"]',html).toggleClass('active',status.wath)
    }

    this.toggle = function(){
        Controller.add('view_start',{
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(false, this.render())
            },
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            down:this.onDown,
            up: this.onUp,
            gone: ()=>{

            },
            back: this.onBack
        })

        Controller.toggle('view_start')
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        html.remove()
    }
}

export default create