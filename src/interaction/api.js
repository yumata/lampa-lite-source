import Reguest from '../utils/reguest'
import Favorite from '../utils/favorite'
import Status from '../utils/status'
import Utils from '../utils/math'

import TMDB from '../utils/api/tmdb'
import CUB  from '../utils/api/cub'

let sources = {
    tmdb: TMDB,
    cub: CUB
}

let network = new Reguest()

function source(params){
    return params.source ? sources[params.source] : sources.tmdb
}

function main(params = {}, oncomplite, onerror){
    source(params).main(params, oncomplite, onerror)
}

function category(params = {}, oncomplite, onerror){
    source(params).category(params, oncomplite, onerror)
}

function full(params = {}, oncomplite, onerror){
    source(params).full(params, oncomplite, onerror)
}

function search(params = {}, oncomplite, onerror){
    let status = new Status(2)
        status.onComplite = oncomplite

    TMDB.search(params, (json)=>{
        if(json.movie) status.append('movie', json.movie)
        if(json.tv) status.append('tv', json.tv)
    }, status.error.bind(status))
}

function person(params = {}, oncomplite, onerror){
    source(params).person(params, oncomplite, onerror)
}

function genres(params = {}, oncomplite, onerror){
    TMDB.genres(params, oncomplite, onerror)
}

function company(params = {}, oncomplite, onerror){
    TMDB.company(params, oncomplite, onerror)
}

function list(params = {}, oncomplite, onerror){
    source(params).list(params, oncomplite, onerror)
}

function menu(params = {}, oncomplite){
    source(params).menu(params, oncomplite)
}

function seasons(tv, from, oncomplite){
    source(tv).seasons(tv, from, oncomplite)
}

function collections(params, oncomplite, onerror){
    source(params).collections(params, oncomplite, onerror)
}

function favorite(params = {}, oncomplite, onerror){
    let data = {}

    data.results = Favorite.get(params)

    data.total_pages = Math.ceil(data.results.length / 20)
    data.page = Math.min(params.page, data.total_pages)

    let offset = data.page - 1

    data.results = data.results.slice(20 * offset,20 * offset + 20)

    if(data.results.length) oncomplite(data)
    else onerror()
}

function relise(params = {}, oncomplite, onerror){
    network.silent(Utils.protocol() + 'tmdb.cub.watch?sort=releases&results=25&page='+params.page,(json)=>{
        json.results.forEach((item)=>{
            item.tmdbID = item.id
        })

        oncomplite(json.results)
    }, onerror)
}

function clear(){
    TMDB.clear()

    network.clear()
}

export default {
    main,
    img: TMDB.img,
    full,
    list,
    genres,
    category,
    search,
    clear,
    company,
    person,
    favorite,
    seasons: seasons,
    screensavers: TMDB.screensavers,
    relise,
    menu,
    collections
}