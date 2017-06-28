import {
    Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnInit,
    ChangeDetectionStrategy
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {IUniSearchConfig} from '../../unisearch/index';
import {UniSearchAttr} from '../../unisearch/UniSearchAttr';


export interface IUniSearchWrapperOptions {
    uniSearchConfig: IUniSearchConfig;
}

@Component({
    selector: 'unitable-unisearch',
    template: `
        <article class="autocomplete">
            <input #input type="text"
                   class="uniAutocomplete_input"
                   role="combobox"
                   autocomplete="false"
                   aria-autocomplete="inline"
                   [formControl]="inputControl"
                   uni-search-attr
                   [config]="editorOptions.uniSearchConfig"
                   (changeEvent)="onChange($event)"
            />
            <button class="uni-autocomplete-searchBtn"
                    (click)="onButtonClick()"
                    [attr.aria-busy]="busy"
                    type="button"
                    tabindex="-1">
                Search
            </button>
        </article>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSearchWrapper implements OnInit {
    public inputElement: ElementRef;

    @ViewChild(UniSearchAttr)
    private uniSearchComponent: UniSearchAttr;

    @Input()
    private inputControl: FormControl;

    @Input()
    private rowModel: any;

    @Input()
    private column: any;

    @Output()
    private close: EventEmitter<any> = new EventEmitter();

    private onButtonClick = () => this.uniSearchComponent.onSearchButtonClick();

    private editorOptions: IUniSearchWrapperOptions;

    private selectedItem: any;

    constructor(private elementRef: ElementRef) {}

    public ngOnInit() {
        this.inputElement = new ElementRef(this.elementRef.nativeElement.querySelector('input'));

        this.editorOptions = this.column.get('editorOptions');

        if (!this.editorOptions.uniSearchConfig) {
            throw new Error('Tried to initialize UniSearchTableColumn without editorOptions.uniSearchConfig!');
        }

        const model = this.rowModel.get(this.column.get('field'));
        if (model) {
            this.editorOptions.uniSearchConfig.initialItem$.next(model.toJS());
        } else {
            this.editorOptions.uniSearchConfig.initialItem$.next(null);
        }
    }

    private onChange(selectedItem) {
        this.selectedItem = selectedItem;
        this.close.emit(true);
    }

    public getValue() {
        if (this.inputControl.dirty) {
            if (this.inputControl.value) {
                return this.selectedItem || this.uniSearchComponent.changeEvent;
            } else {
                return null;
            }
        }
    }
}
