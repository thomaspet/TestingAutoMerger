import {Component, ElementRef, Input, Output, EventEmitter} from 'angular2/core';
import {NgIf, NgFor, Control} from 'angular2/common';
import {UniComponentLoader} from '../../../framework/core/componentLoader';
import {FieldLayout} from '../../../app/unientities';

declare var jQuery;
declare var _;

export class MultiValueItem {
    public ID: number;
    public index: number;
    public value: any;
    public mode: number = 0;
    public selected: boolean = false;
}

@Component({
    selector: 'uni-multivalue',
    // templateUrl: 'framework/controls/multivalue/multivalue.html',
    template: `
        <section class="uni-multivalue-ng">
            <input type="text" [(ngModel)]="itemValue" [readonly]="field?.ReadOnly" [placeholder]="field?.Placeholder"/>
            <button class="uni-multivalue-moreBtn" (click)="showDropdown($event)">Ny</button>

            <ul class="uni-multivalue-values" [class.-is-active]="rowListIsVisible">
                <template ngFor let-row [ngForOf]="rows" let-i = "index">
                    <li [class.-is-main]="row.selected" *ngIf="row.mode < 3">
                        <div *ngIf="row.mode === 0">
                            <span class="uni-multivalue-value" (click)="select(row, $event)">{{row.value}}</span>
                            <button class="uni-multivalue_edit_action-delete" (click)="remove(row, $event)">Delete</button>
                            <button class="setEditBtn" (click)="edit(row, $event)">Rediger {{row.value}}</button>                    
                        </div>
                        <input *ngIf="row.mode === 1" 
                                class="uni-multivalue_edit" 
                                [(ngModel)]="row.value" 
                                (blur)="save(row, $event)" 
                                (keyup.enter)="save(row, $event)" 
                                type="text" />
                        <p *ngIf="row.mode === 2" class="uni-multivalue_deleted">
                            Slettet &lsquo;{{row.value}}&rsquo;. (<a (click)="putBack(row, $event)">Angre</a>)
                        </p>
                                
                    </li>             
                </template>
                <li><button class="uni-multivalue-addBtn" (click)="add($event)">Legg til&hellip;</button></li>
            </ul>
            
            <uni-component-loader></uni-component-loader>

            <small *ngIf="showSaveMessage" class="good">Lagret.</small>

        </section> 
    `,
    directives: [NgIf, NgFor, UniComponentLoader]
})
export class UniMultiValue {
    @Input()
    public control: Control;

    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;

    @Output()
    public onReady: EventEmitter<any> = new EventEmitter<any>(true);
    public isReady: boolean = true;

    @Output()
    public onAddItem: EventEmitter<any> = new EventEmitter<any>(true);
    @Output()
    public onEditItem: EventEmitter<any> = new EventEmitter<any>(true);
    @Output()
    public onDeleteItem: EventEmitter<any> = new EventEmitter<any>(true);
    @Output()
    public onSelectItem: EventEmitter<any> = new EventEmitter<any>(true);

    get OnValueChanges() {
        return this.control.valueChanges;
    }

    get FormControl() {
        return this.control;
    }

    private itemValue: string;
    private showSaveMessage: boolean = false;
    private rows: MultiValueItem[] = [];
    private element: any;
    private rowListIsVisible: boolean = false;

    constructor(private el: ElementRef) {
        var self = this;
        this.element = el.nativeElement;                                
        document.addEventListener('click', function (event) {
            var $el = jQuery(el.nativeElement);
            if (!jQuery(event.target).closest($el).length) {
                self.rowListIsVisible = false;
            }
        });
    }

    public setFocus() {
        jQuery(this.el.nativeElement).find('input').first().focus();
        return this;
    }

    public editMode() {
        this.field.ReadOnly = false;
    }

    public readMode() {
        this.field.ReadOnly = true;
    }

    public ngOnChanges(changes) {
        console.log(changes);
        if (changes['model'] && changes['field']) {
            // set rows
            this.rows = [];
            let list = _.get(this.model, this.field.Property) || [];
            list.forEach((element, i) => {
                var row = new MultiValueItem();
                row.ID = i;
                row.index = element.ID;
                row.mode = 0;
                row.value = element[this.field.Options.valueProperty];
                this.rows.push(row);
            });

            // current row
            var value;
            if (this.field.Options.defaultProperty) {
                value = _.get(this.model, this.field.Options.defaultProperty);
            }
            if (value !== null && value !== undefined) {
                this.rows.forEach(row => {
                    if (row.index === value) {
                        this.itemValue = row.value;
                        row.selected = true;
                    }
                });
            } else {
                this.itemValue = '';
            }

        }
    }

    private showDropdown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.rowListIsVisible = !this.rowListIsVisible;
    }

    private add(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.exists(this.itemValue)) {
            return;
        }
        var self = this;
        var row = new MultiValueItem();
        row.ID = this.rows.length;
        row.mode = 0;
        row.value = this.itemValue;
        if (!this.field.Options.editor) {
            this.rows.push(row);
            this.select(row, event);
            this.onAddItem.emit(this.itemValue);
        } else {
            this.field.Options.editor(row).then((result) => {
                self.rows.push(row);
                self.select(row, event);
                self.onAddItem.emit(this.itemValue);
            });
        }
    }

    private edit(item, event) {
        event.preventDefault();
        event.stopPropagation();
        var self = this;
        if (!this.field.Options.editor) {
            item.mode = 1;
        } else {
            this.field.Options.editor(item).then((result) => {
                item = result;
                self.save(item, event);
            });
        }
    }

    private save(item, event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.exists(item)) {
            return;
        }
        item.mode = 0;
        this.onEditItem.emit(item);
        this.showSaveMessage = true;
        setTimeout(() => this.showSaveMessage = false, 2000);
    }


    private remove(item, event) {
        event.preventDefault();
        event.stopPropagation();
        var row = new MultiValueItem();
        item.mode = 2;

        var self = this;
        setTimeout(() => {
            var index = self.rows.indexOf(item);
            var clone = _.cloneDeep(item);
            self.rows = self.rows.slice(0, index).concat(self.rows.slice(index + 1));
            self.onDeleteItem.emit(clone);
        }, 5000);
    }

    private select(item, event) {
        event.preventDefault();
        event.stopPropagation();
        this.itemValue = item.value;
        this.rows.forEach((row) => {
            row.selected = item.ID === row.ID ? true : false;
        });
        this.onSelectItem.emit(this.itemValue);
    }

    private putBack(item, event) {
        event.preventDefault();
        event.stopPropagation();
        item.mode = 0;
    }
    
    private exists(value) {
        var items = this.rows.filter((item) => item.value === value);
        return items.length > 0;
    }
}