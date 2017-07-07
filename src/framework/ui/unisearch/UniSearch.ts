import {Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, ElementRef} from '@angular/core';
import {UniSearchAttr} from './UniSearchAttr';
import html from './UniSearchHtml';
import css from './UniSearchCss';
import {IUniSearchConfig} from './IUniSearchConfig';

declare const module;

@Component({
    selector: 'uni-search',
    template: html,
    styles: [css],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSearch {
    @ViewChild(UniSearchAttr)
    private uniSearchAttr: UniSearchAttr;
    private onBtnClick = () => this.uniSearchAttr.onSearchButtonClick();

    @Input()
    private config: IUniSearchConfig;

    @Input()
    private disabled: boolean;

    @Output()
    private changeEvent: EventEmitter<any> = new EventEmitter<any>();

    private onChangeEvent(event) {
        this.changeEvent.emit(event);
    }
    private getTitle() {
        return (this.uniSearchAttr as any).componentElement.nativeElement.value || '';
    }
}
