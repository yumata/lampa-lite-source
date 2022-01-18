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
        var url = 'https://ab-ze.xyz/api/hls/movle.m3u8?type='+(params.object.movie.number_of_seasons ? 'tv-se' : 'film')
            url = Lampa.Utils.addUrlComponent(url, 'kp=' + id + '&access_token=&quality=&translation=Дубляж')

        var _self = this
    
        network.silent(url,function(str){
            var json
    
            try{
                var links = str.match(/https?:\/\/\S+/g)
                    links = links.join(",")
                    links = links.replace(/http/g, '{"url":"http')
                    links = links.replace(/mp4,/g, 'mp4"},')
                    links = links.replace(/2160.mp4"}/g, '2160.mp4","quality":"4K UltraHD"}')
                    links = links.replace(/1080.mp4"}/g, '1080.mp4","quality":"Full HD"}')
                    links = links.replace(/720.mp4"}/g, '720.mp4","quality":"720p"}')
                    links = links.replace(/480.mp4"}/g, '480.mp4","quality":"480p"}')
                    links = links.replace(/360.mp4"}/g, '360.mp4","quality":"360p"}')
                    links = (links + 'pp')
                    links = links.replace(/1080.mp4pp/g, '1080.mp4","quality":"Full HD"}')
                    links = links.replace(/720.mp4pp/g, '720.mp4","quality":"720p"}')
                    links = links.replace(/480.mp4pp/g, '480.mp4","quality":"480p"}')
                    links = links.replace(/360.mp4pp/g, '360.mp4","quality":"360p"}')
                    links = links.replace(/"}/g, '","title":"Дублированный / Русский"}')
                    links = ('{"content_type":"movie","media":[' + links + '],"translation":"Перевод"}')
    
                json = JSON.parse(links)
            }
            catch(e){
                _self.error()
            }
            
            if(json) _self.append(json)
    
        },this.error.bind(this),false,{
            dataType: 'text'
        })
    }

    this.append = function(data){
        params.body.empty()
    
        var line = $('<div class="videos__line"></div>')
    
        var item = $('<div class="videos__item videos__movie selector" media=""><div class="videos__item-imgbox videos__movie-imgbox"></div><div class="videos__item-title">Дублированный</div></div>')
    
        var media = {},
            first

        for(var i = 0; i < data.media.length; i++){
            var m = data.media[i]

            media[m.quality] = m.url
    
            if(m.quality == 'Full HD') first = m.url
        }
    
        if(!first) first = data.media[0].url
    
        item.attr('data-json',JSON.stringify({
            method: 'play',
            url: first,
            title: (params.object.movie.title || params.object.movie.name) + ' / Дублированный',
            quality: media
        }))
    
        line.append(item)
    
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