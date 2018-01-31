import {Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, ElementRef} from '@angular/core';
import {UniSearchAttr} from './UniSearchAttr';
import html from './UniSearchHtml';
import {IUniSearchConfig} from './IUniSearchConfig';

declare const module;

@Component({
    selector: 'uni-search',
    template: html,
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

    private onBtnClick = () => this.uniSearchAttr.onSearchButtonClick();

    constructor(private componentElement: ElementRef) {
    }

    private onChangeEvent(event) {
        this.changeEvent.emit(event);
    }
    private getTitle() {
        return (this.uniSearchAttr as any).componentElement.nativeElement.value || '';
    }
    public focus() {
        this.componentElement.nativeElement.querySelector('input').focus();
    }
}
