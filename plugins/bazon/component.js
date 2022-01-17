const network = new Lampa.Reguest()

let object
let html
let activity

function search(_activity, _object,_html){
    activity = _activity
    object   = _object
    html     = _html

    html.find('.videos__body').empty().append('<div class="videos__loading selector">Загрузка... <span></span></div>')

    if(object.movie.kinopoisk_id){
        find(object.movie.kinopoisk_id)
    }
    else{
        getId(find)
    }
}

function find(id){
    let url = 'https://ab-ze.xyz/api/hls/movle.m3u8?type='+(object.movie.number_of_seasons ? 'tv-se' : 'film')
        url = Lampa.Utils.addUrlComponent(url, 'kp=' + id + '&access_token=&quality=&translation=Дубляж')

    network.silent(url,(str)=>{
        let json

        try{
            let links = str.match(/https?:\/\/\S+/g)
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
            error()
        }
        
        if(json) append(json)

    },error,false,{
        dataType: 'text'
    })
}

function error(){
    html.find('.videos__body').empty().append('<div class="videos__line"><div class="videos__empty">Нет подключения к сети или ошибка парсинга</div></div>')
}

function append(data){
    html.find('.videos__body').empty()
    
    let line = $('<div class="videos__line"></div>')

    let item = $(`<div class="videos__item videos__movie selector" media="">
        <div class="videos__item-imgbox videos__movie-imgbox"></div>
        <div class="videos__item-title">Дублированный</div>
    </div>`)

    let media = {},
        first

    data.media.forEach((m)=>{
        media[m.quality] = m.url

        if(m.quality == 'Full HD') first = m.url
    })

    if(!first) first = data.media[0].url

    item.attr('data-json',JSON.stringify({
        method: 'play',
        url: first,
        title: (object.movie.title || object.movie.name) + ' / Дублированный',
        quality: media
    }))

    line.append(item)

    html.find('.videos__body').append(line)

    activity.component().parse()

    activity.toggle()
}

function getId(){
    let year = object.movie.number_of_seasons ? object.movie.first_air_date : object.movie.release_date,
        keys = object.original_name || object.original_title

    if(year) year = year.slice(0,4)

    network.silent('https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword='+encodeURIComponent(keys)+' '+year,(data)=>{

    },error,false,{
        headers: {
            'X-API-KEY': '2d55adfd-019d-4567-bbf7-67d503f61b5a'
        }
    })
}

function clear(){
    network.clear()
}


export default {
    search,
    clear
}