function Bazon(params){
    var network = new Lampa.Reguest()

    this.start = function(){
        if(params.object.movie.kinopoisk_id){
            this.find(params.object.movie.kinopoisk_id)
        }
        else{
            this.getId(this.find.bind(this))
        }
    }

    this.find = function(id){
        var url = 'https://ab-ze.xyz/api/hls/alloha?type='+(params.object.movie.number_of_seasons ? 'tv-se' : 'film')
            url = Lampa.Utils.addUrlComponent(url, 'kp=' + id + '&access_token=&quality=&translation=Дублированный')

        var _self = this
    
        network.silent(url,function(json){
            _self.append(json)
        },this.error.bind(this),false,{
            dataType: 'json'
        })
    }

    this.append = function(data){
        params.body.empty()
    
        var line = $('<div class="videos__line"></div>')
        
        for(var i = 0; i < data.length; i++){
            var media = data[i]
            var item  = $('<div class="videos__item videos__movie selector" media=""><div class="videos__item-imgbox videos__movie-imgbox"></div><div class="videos__item-title">'+media.translation+'</div></div>')

            item.attr('data-json',JSON.stringify({
                method: 'play',
                url: media.link,
                title: (params.object.movie.title || params.object.movie.name) + ' / ' + media.translation
            }))
            
            if(i == 0) item.addClass('focused')
        
            line.append(item)
        }
    
        params.body.append(line)
    
        params.class.parse()
    
        Lampa.Controller.enable('view_videos')
    }

    this.getId = function(call){
        var year = params.object.movie.number_of_seasons ? params.object.movie.first_air_date : params.object.movie.release_date,
            keys = params.object.movie.original_name || params.object.movie.original_title
    
        if(year) year = year.slice(0,4)

        var _self = this
    
        network.silent('https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword='+encodeURIComponent(keys)+' '+year,function(data){
            if(data.films.length) call(data.films[0].filmId)
            else _self.error()
        },this.error.bind(this),false,{
            headers: {
                'X-API-KEY': '2d55adfd-019d-4567-bbf7-67d503f61b5a'
            }
        })
    }

    this.error = function(){
        params.body.empty().append('<div class="videos__line"><div class="videos__empty">Нет подключения к сети или ошибка парсинга</div></div>')
    }

    this.destroy = function(){
        network.clear()

        network = null
    }
}