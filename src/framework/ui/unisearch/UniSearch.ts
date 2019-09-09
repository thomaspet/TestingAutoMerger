import {
    Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, ElementRef,
    ChangeDetectorRef
} from '@angular/core';
import {UniSearchAttr} from './UniSearchAttr';
import {IUniSearchConfig} from './IUniSearchConfig';

@Component({
    selector: 'uni-search',
    template: `
        <section class="uni_search" (clickOutside)="onClickOutside()">
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
                placeholder="{{ config && config.placeholder ? config.placeholder : '' }}"
                (focus)="onFocus($event)"
                (blur)="onBlur()"
            />

            <button *ngIf="!config?.disableSearchButton" class="searchBtn"
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
    @ViewChild(UniSearchAttr) uniSearchAttr: UniSearchAttr;

    @Input() config: IUniSearchConfig;
    @Input() disabled: boolean;

    @Output() private changeEvent = new EventEmitter<any>();
    @Output() private blurEvent = new EventEmitter<any>();

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

    onBlur() {
        this.blurEvent.emit();
    }

    onFocus(event) {
        try {
            event.target.select();
        } catch (e) {}
    }

    onClickOutside() {
        this.uniSearchAttr.closeSearchResult();
    }

    setValue(value) {
        this.NativeInput.value = value;
        this.cd.detectChanges();
    }

    onChangeEvent(event) {
        this.changeEvent.emit(event);
    }

    getTitle() {
        return (this.uniSearchAttr as any).componentElement.nativeElement.value || '';
    }

    focus() {
        try {
            this.NativeInput.focus();
            this.NativeInput.select();
        } catch (e) {}
    }
}
