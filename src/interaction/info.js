import Template from './template'

function create(){
    let html

    this.create = function(){
        html = Template.get('info')
    }

    this.update = function(data){
        html.find('.info__title').text(data.title)
        html.find('.info__title-original').text(((data.release_date || data.first_air_date || '0000') + '').slice(0,4) + ' - ' + data.original_title)

    }

    this.render = function(){
        return html
    }

    this.empty = function(){
        this.update({
            title: 'Еще',
            original_title: 'Показать больше результатов',
            vote_average: 0
        },true)
    }

    this.destroy = function(){
        html.remove()

        html = null
    }
}

export default create