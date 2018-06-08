import {Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, ElementRef} from '@angular/core';
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
        </section>`,
    styleUrls: ['./uniSearch.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSearch {
    @ViewChild(UniSearchAttr)
    private uniSearchAttr: UniSearchAttr;

    @Input()
    private config: IUniSearchConfig;

    @Input()
    private disabled: boolean;

    @Output()
    private changeEvent: EventEmitter<any> = new EventEmitter<any>();

    public onBtnClick = () => this.uniSearchAttr.onSearchButtonClick();

    constructor(private componentElement: ElementRef) {
    }

    public onChangeEvent(event) {
        this.changeEvent.emit(event);
    }
    private getTitle() {
        return (this.uniSearchAttr as any).componentElement.nativeElement.value || '';
    }
    public focus() {
        try {
            this.componentElement.nativeElement.querySelector('input').focus();
            this.componentElement.nativeElement.querySelector('input').select();
        } catch (e) {}
    }
}
