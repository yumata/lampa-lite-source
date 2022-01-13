let html = `<div class="view">
    <div class="view__body">
        <div class="view__title">{title}</div>
        <div class="view__details">
            <span>{year}</span>
            <span>{time}</span>
            <span>{genres}</span>
        </div>
        <div class="view__descr">{descr}</div>

        <div class="view__favorite">
            <div data-name="book" class="selector"></div>
            <div data-name="like" class="selector"></div>
            <div data-name="wath" class="selector"></div>
        </div>
    </div>

    <div class="view__right">
        <div class="card__view">
            <img class="card__img" src="{img}" />

            <div class="card__vote">{vote}</div>
        </div>
    </div>
</div>`

export default html