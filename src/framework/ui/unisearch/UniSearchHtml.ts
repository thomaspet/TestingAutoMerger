export default `<section class="uni_search">
    <input class="input"
           role="combobox"
           autocomplete="false"
           aria-autocomplete="inline"
           uni-search-attr
           (changeEvent)="onChangeEvent($event)"
           [config]="config"
           [disabled]="disabled"
           [title]="getTitle()"
           tabindex="-1"
    />

    <button class="searchBtn"
            [disabled]="disabled"
            (click)="onBtnClick()"
            (keydown.esc)="onKeydown($event)"
            [attr.aria-busy]="uniSearchAttr.busy"
            type="button"
            tabindex="-1">
        Search
    </button>  
</section>`;
