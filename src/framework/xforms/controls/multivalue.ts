import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild} from '@angular/core';
import {Control} from '@angular/common';
import {UniFieldLayout} from '../unifieldlayout';
import {UniComponentLoader} from '../../core/componentLoader';

declare var _, jQuery; // jquery and lodash

@Component({
    selector: 'uni-multivalue-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="uni-multivalue-ng">
            <input type="text" [(ngModel)]="currentValue" [readonly]="field?.ReadOnly" [placeholder]="field?.Placeholder || ''">
            <button class="uni-multivalue-moreBtn" (click)="showDropdown($event)">Ny</button>

            <ul class="uni-multivalue-values" [class.-is-active]="listIsVisible">
                <template ngFor let-row [ngForOf]="rows" let-i = "index">
                    <li [class.-is-main]="isSelected(row)">
                        
                        <div *ngIf="!row.mode">
                            <span class="uni-multivalue-value" 
                                  (click)="setAsDefault(row)">
                                  {{showDisplayValue(row)}}
                            </span>
                            <button class="uni-multivalue_edit_action-delete" 
                                (click)="remove(row, $event)">
                                Delete
                            </button>
                            <button class="setEditBtn" 
                                (click)="edit(row, $event)">
                                Rediger {{showDisplayValue(row)}}
                            </button>                    
                        </div>
                        
                        <input *ngIf="row.mode === 1" 
                                #input
                                class="uni-multivalue_edit" 
                                [(ngModel)]="tempValue" 
                                (blur)="save(row, input.value, $event)" 
                                (keyup)="save(row, input.value, $event)" 
                                type="text" 
                        />
                                
                        <p *ngIf="row.mode === 2" class="uni-multivalue_deleted">
                            Slettet &lsquo;{{showDisplayValue(row)}}&rsquo;. 
                            (<a (click)="putBack(row, $event)">Angre</a>)
                        </p>
                                
                    </li>             
                </template>
                <li>
                    <button class="uni-multivalue-addBtn" 
                            (click)="addValue($event)">
                                Legg til&hellip;
                    </button>
                </li>
            </ul>
            <small *ngIf="successMessage" class="good">Lagret.</small>
        </section>
    `
})
export class UniMultivalueInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);
    
    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);
   
   
    private listIsVisible: boolean = false;
    private currentValue: string = '';
    private tempValue: string;
    private rows: any[] = [];
    private defaultRow: any;
    
    constructor(public el: ElementRef, private cd: ChangeDetectorRef) {
        var self = this;                                     
        document.addEventListener('click', function (event) {
            var $el = jQuery(el.nativeElement);
            if (!jQuery(event.target).closest($el).length) {
                self.listIsVisible = false;
            }
        });
    }

    public focus() {
        jQuery(this.el.nativeElement)
            .find('input')
            .first()
            .focus();
        this.cd.markForCheck();
        return this;
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.cd.markForCheck();
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.cd.markForCheck();
    }

    public ngOnChanges() {
        this.field.Options = this.field.Options || {};
        
        // update default option
        if (this.field.Options.foreignProperty) {
            this.rows = _.get(this.model, this.field.Property);
            var foreignValue = _.get(this.model, this.field.Options.foreignProperty);
            this.rows.forEach((row) => {
                if (_.get(row, this.field.Options.linkProperty) === foreignValue) {
                    this.setAsDefault(row);
                }    
            });
        }
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }
    
    private showDropdown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.listIsVisible = !this.listIsVisible;
    }
    
    private isSelected(row) {
        return row === this.defaultRow;
    }
    
    private setAsDefault(row) {
        this.defaultRow = row;
        if (!this.field.Options.foreignProperty) {
            return;
        }
        var foreignProperty = this.field.Options.foreignProperty;
        var linkProperty = this.field.Options.linkProperty;
        var fp = _.get(this.model, foreignProperty);
        var lp = _.get(row, linkProperty);
        if (fp === lp) {
            return; // no emit changes since it is not updated;
        }
        _.set(this.model, foreignProperty, lp);
        this.onChange.emit(this.model);
    }
    
    private showDisplayValue(row) {
        if (!this.field.Options.display) {
            return _.get(row, this.field.Options.displayValue);
        }
        return this.field.Options.display(row);
    }
    
    private addValue() {
        var self = this;
        if (!this.field.Options.editor) {
            var entity = this.field.Options.entity;
            var tmp = new entity();
            _.set(tmp, this.field.Options.displayValue, this.currentValue);
            this.rows = [].concat(this.rows, tmp);
            _.set(this.model, this.field.Property, this.rows);
            this.currentValue = '';
            this.onChange.emit(this.model);
        } else {
            this.field.Options.editor(this.currentValue).then(newEntity => {
                self.rows = [].concat(self.rows, newEntity);
                self.currentValue = '';
                _.set(self.model, self.field.Property, self.rows);
                self.onChange.emit(self.model);        
            });
        }
    }
    
    private edit(row, $event) {
        var self = this;
        this.rows.forEach(x => x.mode = 0);
        $event.preventDefault();
        if (this.field.Options.editor) {
            this.field.Options.editor(this.showDisplayValue(row)).then(editedEntity => {
                var index = self.rows.indexOf(row);
                var part1 = self.rows.slice(0, index);
                var part2 = self.rows.slice(index + 1);
                self.rows = [
                    ...part1,
                    editedEntity,
                    ...part2
                ];
                _.set(self.model, self.field.Property, self.rows);
                self.onChange.emit(self.model);
                self.listIsVisible = true;            
            });
        } else {
            this.tempValue = this.showDisplayValue(row);
            row.mode = 1;
            setTimeout(() => jQuery($event.path[2].children[0]).focus(), 200);
            this.listIsVisible = true;
        }
    }
    
    private save(row, tempValue, $event) {
        if ($event.which === 27) {
            $event.preventDefault();
            row.mode = 0;
            this.listIsVisible = true;
            return;
        }
        if ($event.which === 13 || $event.type === 'blur') {
            $event.preventDefault();
            if (_.get(row, this.field.Options.displayValue) === tempValue) {
                this.listIsVisible = true;
                return;
            }
            _.set(row, this.field.Options.displayValue, tempValue);
            _.set(this.model, this.field.Property, this.rows);
            this.onChange.emit(this.model);
            row.mode = 0;
            this.listIsVisible = true;
        }
    }
    
    private remove(row, $event) {
        $event.preventDefault();
        row.mode = 2;
        setTimeout(() => {
            if (row.mode === 2) {
                var index = this.rows.indexOf(row);
                this.rows = this.rows.slice(0, index).concat(this.rows.slice(index + 1));
                _.set(this.model, this.field.Property, this.rows);
                this.onChange.emit(this.model);
                this.cd.markForCheck();
                this.listIsVisible = true;
            }  
        }, 5000);
        this.listIsVisible = true;
    }
    
    private putBack(row, $event) {
        $event.preventDefault();
        row.mode = 0;
        this.listIsVisible = true;
    }
}