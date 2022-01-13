import Controller from '../interaction/controller'
import Scroll from '../interaction/scroll'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Select from '../interaction/select'
import Template from '../interaction/template'
import Storage from '../utils/storage'
import Input from './settings/input'

function component(object){
    let scroll  = new Scroll({mask:true,over: true,step: 250})
    let html    = $('<div class="events"></div>')
    let body    = Template.get('events',{})
    let add     = body.find('.events__item--add')
    let events  = Storage.get('events','[]')
    
    let last

    this.create = function(){
        this.activity.loader(false)

        html.append(scroll.render())

        scroll.append(body)

        add.on('hover:enter',()=>{
            this.push()

            last = add.next()[0]

            this.start()
        })

        html.find('.selector').on('hover:focus',function(){
            last = $(this)[0]

            scroll.update($(this), true)
        })

        events.forEach(this.item.bind(this))

        return this.render()
    }

    this.push = function(){
        let event = {
            name: '',
            url: ''
        }

        events.push(event)

        Storage.set('events',events)

        this.item(event)
    }

    this.item = function(data){
        let item = Template.get('events_item',{})

        function update(){
            item.find('.events__item-name').text(data.name || 'Без названия')
            item.find('.events__item-url').text(data.url || '...')
        }

        item.on('hover:enter',()=>{
            Select.show({
                title: 'Действие',
                items: [
                    {
                        title: 'Изменить название',
                        type: 'name'
                    },
                    {
                        title: 'Изменить URL',
                        type: 'url'
                    },
                    {
                        title: 'Удалить',
                        type: 'remove'
                    }
                ],
                onSelect: (a)=>{
                    if(a.type == 'remove'){
                        Arrays.remove(events, data)

                        Storage.set('events',events)

                        last = item.prev()[0]

                        item.remove()

                        Controller.toggle('content')
                    }
                    else{
                        Input.edit({
                            free: true,
                            value: data[a.type]
                        },(new_value)=>{
                            data[a.type] = new_value

                            update()

                            Storage.set('events',events)

                            Controller.toggle('content')
                        })
                    }
                },
                onBack: ()=>{
                    Controller.toggle('content')
                }
            })
        }).on('hover:focus',function(){
            last = $(this)[0]

            scroll.update($(this), true)
        })

        update()

        add.after(item)
    }

    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render())
                Controller.collectionFocus(last,scroll.render())
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            right: ()=>{
                Navigator.move('right')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        scroll.destroy()

        html.remove()
        body.remove()

        last   = null
        html   = null
        body   = null
        events = null
    }
}

export default component