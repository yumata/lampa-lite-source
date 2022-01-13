let html = `<div class="menu">

    <img class="menu__logo" src="./img/logo.svg" />
    
    <div class="menu__case">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="search">
                <div class="menu__ico"><img src="./img/icons/menu/browse.svg" /></div>
                <div class="menu__text">Найти</div>
            </li>

            <li class="menu__item selector" data-action="movie">
                <div class="menu__ico"><img src="./img/icons/menu/movie.svg" /></div>
                <div class="menu__text">Фильмы</div>
            </li>
            <li class="menu__item selector" data-action="tv">
                <div class="menu__ico"><img src="./img/icons/menu/tv.svg" /></div>
                <div class="menu__text">Сериалы</div>
            </li>
            <li class="menu__item selector" data-action="catalog">
                <div class="menu__ico"><img src="./img/icons/menu/catalog.svg" /></div>
                <div class="menu__text">Каталог</div>
            </li>
            <li class="menu__item selector" data-action="relise">
                <div class="menu__ico"><img src="./img/icons/menu/relise.svg" /></div>
                <div class="menu__text">Релизы</div>
            </li>
        </ul>
    </div>

    <div class="menu__split"></div>

    <div class="menu__case">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="favorite" data-type="book">
                <div class="menu__ico"><img src="./img/icons/menu/bookmark.svg" /></div>
                <div class="menu__text">Закладки</div>
            </li>
            <li class="menu__item selector" data-action="favorite" data-type="like">
                <div class="menu__ico"><img src="./img/icons/menu/like.svg" /></div>
                <div class="menu__text">Нравится</div>
            </li>
            <li class="menu__item selector" data-action="favorite" data-type="wath">
                <div class="menu__ico"><img src="./img/icons/menu/time.svg" /></div>
                <div class="menu__text">Позже</div>
            </li>
            <li class="menu__item selector" data-action="favorite" data-type="history">
                <div class="menu__ico"><img src="./img/icons/menu/history.svg" /></div>
                <div class="menu__text">История</div>
            </li>

        </ul>
    </div>

    <div class="menu__split"></div>

    <div class="menu__case">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="settings">
                <div class="menu__ico"><img src="./img/icons/menu/settings.svg" /></div>
                <div class="menu__text">Настройки</div>
            </li>

            <li class="menu__item selector" data-action="about">
                <div class="menu__ico"><img src="./img/icons/menu/info.svg" /></div>
                <div class="menu__text">О лампе</div>
            </li>
        </ul>
    </div>
</div>`

export default html