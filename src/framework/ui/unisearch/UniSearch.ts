import {
    Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, ElementRef,
    ChangeDetectorRef
} from '@angular/core';
import {UniSearchAttr} from './UniSearchAttr';
import {IUniSearchConfig} from './IUniSearchConfig';

@Component({
    selector: 'uni-search',
    template: `
        <section class="uni_search">
            <input class="input"
                role="combobox"
                autocomplete="false"
                aria-autocomplete="inline"
                uni-search-attr
                (clickOutside)="onClickOutside()"
                (changeEvent)="onChangeEvent($event)"
                [config]="config"
                [disabled]="disabled"
                [title]="getTitle()"
                tabindex="-1"
                (focus)="onFocus($event)"
            />

            <button class="searchBtn"
                    [disabled]="disabled"
                    (click)="onBtnClick()"
                    [attr.aria-busy]="uniSearchAttr.busy"
                    type="button"
                    tabindex="-1">
                Search
            </button>
        </section>`,
    styleUrls: ['./uniSearch.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSearch {
    @ViewChild(UniSearchAttr)
    public uniSearchAttr: UniSearchAttr;

    @Input()
    public config: IUniSearchConfig;

    @Input()
    public disabled: boolean;

    @Output()
    private changeEvent: EventEmitter<any> = new EventEmitter<any>();

    public onBtnClick = () => this.uniSearchAttr.onSearchButtonClick();

    get NativeInput() {
        if (!this.componentElement) {
            console.error('[DEV ERROR] UniSearch: NativeInput is null.');
            return null;
        }
        return this.componentElement.nativeElement.querySelector('input');
    }

    constructor(private componentElement: ElementRef, private cd: ChangeDetectorRef) {
    }

    onFocus(event) {
        try {
            event.target.select();
        } catch (e) {}
    }

    onClickOutside() {
        this.uniSearchAttr.closeSearchResult();
    }

    public setValue(value) {
        this.NativeInput.value = value;
        this.cd.detectChanges();
    }

    public onChangeEvent(event) {
        this.changeEvent.emit(event);
    }
    public getTitle() {
        return (this.uniSearchAttr as any).componentElement.nativeElement.value || '';
    }
    public focus() {
        try {
            this.NativeInput.focus();
            this.NativeInput.select();
        } catch (e) {}
    }
}
