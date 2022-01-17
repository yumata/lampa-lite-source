import Bazon from './component'

const button = `<div class="videos__button selector">Bazon</div>`

Lampa.Listener.follow('view',(e)=>{
    if(e.type == 'complite'){
        let btn = $(button)

        btn.on('hover:enter',()=>{
            Bazon.search(e.object.activity, e.data, e.object.activity.render())
        })

        e.object.activity.render().find('.videos__plugins .videos__button').after(btn)
    }

    if(e.type == 'destroy'){
        Bazon.clear()
    }
})