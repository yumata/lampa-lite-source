import wrap from '../templates/wrap'
import menu from '../templates/menu'
import activitys from '../templates/activitys'
import activity from '../templates/activity'
import scroll from '../templates/scroll'
import settings from '../templates/settings'
import settings_main from '../templates/settings/main'
import settings_interface from '../templates/settings/interface'
import settings_player from '../templates/settings/player'
import settings_more from '../templates/settings/more'
import settings_plugins from '../templates/settings/plugins'
import settings_cloud from '../templates/settings/cloud'
import settings_account from '../templates/settings/account'
import items_line from '../templates/items/line'
import card from '../templates/card'
import player from '../templates/player'
import player_panel from '../templates/player/panel'
import player_video from '../templates/player/video'
import player_info from '../templates/player/info'
import selectbox from '../templates/selectbox/box'
import selectbox_item from '../templates/selectbox/item'
import info from '../templates/info'
import filter from '../templates/filter'
import more from '../templates/more'
import search from '../templates/search/main'
import settings_input from '../templates/settings/input'
import modal from '../templates/modal'
import modal_loading from '../templates/modal_loading'
import modal_pending from '../templates/modal_pending'
import empty from '../templates/empty'
import about from '../templates/about'
import error from '../templates/error'
import search_box from '../templates/search'
import console from '../templates/console'
import icon_star from '../templates/icons/star'
import timeline from '../templates/timeline'
import list_empty from '../templates/list_empty'
import screensaver from "../templates/screensaver";
import view from "../templates/view";
import events from "../templates/events";
import events_item from "../templates/events_item";

let templates = {
    wrap,
    menu,
    activitys,
    activity,
    settings,
    settings_main,
    settings_interface,
    settings_player,
    settings_more,
    settings_plugins,
    settings_cloud,
    settings_account,
    scroll,
    items_line,
    card,
    player,
    player_panel,
    player_video,
    player_info,
    selectbox,
    selectbox_item,
    info,
    more,
    search,
    settings_input,
    modal,
    modal_loading,
    modal_pending,
    empty,
    about,
    error,
    filter,
    search_box,
    console,
    icon_star,
    timeline,
    list_empty,
    screensaver,
    view,
    events,
    events_item
}

function get(name, vars = {}, like_static = false){
    var tpl = templates[name];

    if(!tpl) throw 'Шаблон: '+name+' не найден!'

    for(var n in vars){
        tpl = tpl.replace(new RegExp('{'+n+'}','g'),vars[n]);
    }

    tpl = tpl.replace(/{\@([a-z_-]+)}/g, function(e,s){
        return templates[s] || '';
    })

    return like_static ? tpl : $(tpl);
}

function add(name, html){
    templates[name] = html
}

function all(){
    return templates
}

export default {
    get,
    add,
    all
}