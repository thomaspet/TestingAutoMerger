import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
    ChangeDetectorRef,
    ViewChild,
    Renderer,
    SimpleChange,
    SimpleChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';
import {GuidService} from '../../../../app/services/common/guidService';
import {KeyCodes} from '../../../../app/services/common/keyCodes';

@Component({
    selector: 'uni-multivalue-input',
    template: `
        <section (clickOutside)="close()"
                class="uni-multivalue-ng"
                (keyup.esc)="close()"
                (keydown)="keyDownHandler($event)"
                [class.-has-values]="rows?.length">

            <input type="text"
                   #mainInput
                   [attr.aria-describedby]="asideGuid"
                   [ngModel]="getDisplayValue(selectedRow)"
                   [class.-has-editor]="field?.Options?.editor"
                   [placeholder]="field?.Placeholder || ''"
                   (focus)="focusHandler()"
                   [title]="control?.value || ''"
                   (keypress)="keyPressHandler($event)"
                   [attr.aria-readonly]="readOnly$ | async"
                   readonly
            />

            <button type="button"
                    #openbtn
                    class="uni-multivalue-moreBtn"
                    (click)="toggle()"
                    tabindex="-1"
                    [disabled]="readOnly$ | async">Ny</button>

            <ul class="uni-multivalue-values" [attr.aria-expanded]="isOpen">
                <li class="multivalue-help">
                    <small>Slett rad (del)</small>
                    <small>Rediger rad (F1)</small>
                    <small><a (click)="addNew(filter)">Legg til (F3)</a></small>
                </li>
                <li>
                    <input type="search"
                           [formControl]="filterFormControl"
                           placeholder="filter"
                           [(ngModel)]="filter"
                           [attr.aria-expanded]="rows?.length > 1"
                           #filterElement
                    />
                </li>

                <li [attr.aria-selected]="!focusedRow"
                    (mouseover)="focusedRow = null"
                    (click)="clearSelection()">
                    Ikke valgt
                </li>

                <ng-template ngFor let-row [ngForOf]="filteredRows">
                    <li [attr.aria-selected]="focusedRow === row"
                        (mouseover)="focusedRow = row"
                        (click)="selectRow(row)">

                        <div *ngIf="!row.Deleted">
                            <span class="uni-multivalue-value">
                                  {{getDisplayValue(row)}}
                            </span>

                            <button type="button"
                                    class="uni-multivalue_edit_action-delete"
                                    (click)="delete(row, $event)">
                                Delete
                            </button>

                            <button type="button"
                                    class="uni-multivalue_edit_action-edit"
                                    (click)="edit(row, $event)">
                                Edit
                            </button>
                        </div>

                        <p *ngIf="row.Deleted" class="uni-multivalue_deleted">
                            Slettet &lsquo;{{getDisplayValue(row)}}&rsquo;.
                            (<a (click)="regretDelete(row, $event)">Angre</a>)
                        </p>
                    </li>
                </ng-template>

                <li *ngIf="field.Options.allowAddValue !== false">
                    <button class="good uni-multivalue-addBtn"
                            #addButton
                            type="button"
                            (click)="addNew(filter)">
                        Legg til ny
                    </button>
                </li>

            </ul>
        </section>
    `
})
export class UniMultivalueInput extends BaseControl {
    @ViewChild('filterElement') private filterInput: ElementRef;
    @ViewChild('mainInput') private mainInput: ElementRef;

    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);
    @Output() public moveForwardEvent: EventEmitter<any> = new EventEmitter<any>(true);

    private isOpen: boolean;
    private editorIsOpen: boolean;

    private displayValue: string = '';
    private rows: any[] = [];
    private filteredRows: any[] = [];

    public filter: string = '';
    public filterFormControl: FormControl = new FormControl();


    private selectedRow: any;
    private focusedRow: any;

    constructor(
        public renderer: Renderer,
        public el: ElementRef,
        private cd: ChangeDetectorRef,
        private guidService: GuidService
    ) {
        super();
    }

    public ngOnChanges() {
        this.field.Options = this.field.Options || {};
        this.displayValue = '';
        this.readOnly$.next(this.field && this.field.ReadOnly);

        // update default option
        if (this.field.Options.storeResultInProperty) {
            if (this.field.Options.listProperty) {
                this.filteredRows = this.rows = _.get(this.model, this.field.Options.listProperty, []);
            } else {
                this.filteredRows = this.rows = _.get(this.model, this.field.Property, []);
            }

            let modelValue = _.get(this.model, this.field.Options.storeResultInProperty);
            this.displayValue = this.getDisplayValue(modelValue);

            this.focusedRow = this.selectedRow = this.rows.find(row => this.getDisplayValue(row) == this.displayValue);

            if (this.field.Options.onChange) {
                this.changeEvent.subscribe(value => this.field.Options.onChange(this.selectedRow));
            }
        }
    }

    public ngAfterViewInit() {
        this.filteredRows = this.rows;
        this.filterFormControl.valueChanges
            .subscribe(() => {
                this.filteredRows = this.rows.filter(row => {
                    if (!!this.filter) {
                        return this.getDisplayValue(row).toLowerCase().startsWith(this.filter.toLowerCase());
                    }
                    return true;
                });
                this.updateFocusedRow();
            });
        this.readyEvent.emit(this);
    }

    private updateFocusedRow() {
        const exactMatch = this.filteredRows.find(row => this.getDisplayValue(row) === this.displayValue);
        const startsWithMatch = this.filteredRows
            .find(row => this.getDisplayValue(row).toLowerCase().startsWith(this.filter.toLowerCase()));

        if (exactMatch >= 0) {
            this.focusedRow = exactMatch;
        } else {
            this.focusedRow = startsWithMatch;
        }
    }

    public focus() {
        const input = this.el.nativeElement.querySelector('input');
        if (input) {
            this.renderer.invokeElementMethod(input, 'focus', []);
            this.renderer.invokeElementMethod(input, 'select', []);
            this.cd.markForCheck();
            return this;
        }
    }

    public emitChange(previousValue, currentValue) {
        let changeValue = new SimpleChange(previousValue, currentValue, false);
        let property = this.field.Options.storeResultInProperty || this.field.Property;
        let change = {};
        change[property] = changeValue;
        this.changeEvent.emit(change);

        change[property]['valid'] = true;
        this.inputEvent.emit(change);

        this.moveForwardEvent.emit({event: null, field: this.field});
    }

    public toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    private open() {
        this.isOpen = true;
        this.filter = "";
        let listProperty = this.field.Options.listProperty || this.field.Property;
        this.rows = this.filteredRows = _.get(this.model, listProperty, []);
        setTimeout(() => this.filterInput.nativeElement.focus());
    }

    private close() {
        this.isOpen = false;
        this.filter = "";
        this.focusedRow = this.selectedRow;
    }

    public clearSelection() {
        let previousValue = _.cloneDeep(this.selectedRow);
        this.focusedRow = this.rows[0];
        this.selectedRow = null;
        this.displayValue = '';

        _.set(this.model, this.field.Options.storeResultInProperty, null);
        if (this.field.Options.storeIdInProperty) {
            _.set(this.model, this.field.Options.storeIdInProperty, null);
        }

        this.emitChange(previousValue, null);
        this.moveForwardEvent.emit({event: null, field: this.field});
    }

    public selectRow(row: any) {
        if (row && row.Deleted) {
            return;
        }
        this.close();
        if (row === this.selectedRow) {
            return;
        }

        let previousValue = _.cloneDeep(this.selectedRow);
        this.focusedRow = this.selectedRow = row || null;
        this.displayValue = this.getDisplayValue(row);

        _.set(this.model, this.field.Options.storeResultInProperty, row);

        if (this.field.Options.storeIdInProperty) {
            let linkValue = !!row
                ? _.get(row, this.field.Options.linkProperty) || null
                : null;

            _.set(this.model, this.field.Options.storeIdInProperty, linkValue);
        }

        this.emitChange(previousValue, row);
        this.moveForwardEvent.emit({event: null, field: this.field});
    }

    private getDisplayValue(row): string {
        if (!row) {
            return '';
        }

        const value = this.field.Options.display
            ? this.field.Options.display(row)
            : _.get(row, this.field.Options.displayValue);

        return value || '';
    }

    public addNew(initValue?: string) {
        this.edit({
            ID: 0,
            _initValue: initValue,
            _createguid: this.guidService.guid()
        });
    }

    private edit(row, event?: Event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.editorIsOpen || !row) {
            return;
        }

        let listProperty = this.field.Options.listProperty || this.field.Property;
        this.rows = this.filteredRows = _.get(this.model, listProperty, []);

        if (this.field.Options.editor) {
            if (!this.editorIsOpen) {
                this.editorIsOpen = true;
                this.close();

                this.field.Options.editor(row).then(editedEntity => {
                    this.editorIsOpen = false;
                    if (!editedEntity) {
                        this.focus();
                        return this.rows;
                    }

                    let index = this.rows.findIndex(r => r === row);
                    if (index >= 0) {
                        this.rows[index] = editedEntity;
                        this.selectRow(editedEntity);
                    } else {
                        this.rows.push(editedEntity);
                        this.selectRow(editedEntity);
                    }
                    return this.rows;
                })
                .then(rows => this.filteredRows = rows)
                .then(rows => {
                    let listProperty = this.field.Options.listProperty || this.field.Property;
                    _.set(this.model, listProperty, rows);
                })
                .catch((err) => {
                    this.editorIsOpen = false;
                    this.close();
                })
                .then(() => this.cd.markForCheck());
            }
        } else {
            console.warn('MultiValue is missing an editor');
        }
    }

    public delete(row, event?: Event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        let oldrows = [...this.rows];

        // If deleted row was selected row
        if (row === this.selectedRow) {
            if (this.field.Options.storeIdInProperty) {
                _.set(this.model, this.field.Options.storeIdInProperty, null);
            }

            if (this.field.Options.storeResultInProperty) {
                _.set(this.model, this.field.Options.storeResultInProperty, null);
            }

            let listProperty = this.field.Options.listProperty || this.field.Property;
            _.set(this.model, listProperty, this.rows);

            this.selectedRow = null;
            this.updateFocusedRow();
        }

        // Delete the row
        if (row.ID) {
            row.Deleted = true;
        } else {
            this.rows.splice(this.rows.indexOf(row), 1);
            this.filteredRows.splice(this.rows.indexOf(row), 1);
        }

        this.emitChange(oldrows, this.rows);
        this.cd.markForCheck();
    }

    public regretDelete(row, event) {
        event.stopPropagation();
        event.preventDefault();

        let oldRows = [...this.rows];
        row.Deleted = false;

        this.emitChange(oldRows, this.rows);
        this.cd.markForCheck();
    }

    public keyDownHandler(event: KeyboardEvent) {
        const keyCode = event.which || event.keyCode;


        switch (keyCode) {
            case KeyCodes.TAB:
            case KeyCodes.ENTER:
                if (this.isOpen) {
                    event.preventDefault();
                    this.selectRow(this.focusedRow);
                }
                break;

            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                if (!this.isOpen) {
                    this.isOpen = true;
                    return;
                }
                let selectedRowIndexDown = this.filteredRows.findIndex(row => row === this.focusedRow);
                selectedRowIndexDown = selectedRowIndexDown === undefined ? 0 : selectedRowIndexDown;
                if (selectedRowIndexDown < this.filteredRows.length -1) {
                    this.focusedRow = this.filteredRows[selectedRowIndexDown + 1];
                }
                break;

            case KeyCodes.UP_ARROW:
                event.preventDefault();
                if (!this.isOpen) {
                    this.isOpen = true;
                    return;
                }
                const selectedRowIndexUp = this.filteredRows.findIndex(row => row === this.focusedRow);
                if (selectedRowIndexUp >= 0) { // allow to go lower than 0 and highlight "not selected" row
                    this.focusedRow = this.filteredRows[selectedRowIndexUp - 1];
                }
                break;

            case KeyCodes.DELETE:
                if (!this.isOpen) {
                    this.clearSelection();
                }
                break;

            case KeyCodes.F1:
                event.preventDefault();
                this.edit(this.focusedRow);
                break;

            case KeyCodes.F3:
                event.preventDefault();
                this.addNew(this.filter);
                break;

            case KeyCodes.SPACE:
                if (!this.isOpen) {
                    event.preventDefault();
                    this.open();
                }
                break;
            case KeyCodes.F4:
                event.preventDefault();
                this.toggle();
                break;
            case KeyCodes.ESCAPE:
                event.preventDefault();
                this.mainInput.nativeElement.focus();
                break;
        }
    }


    public keyPressHandler(event: KeyboardEvent) {
        const ignoredKeyCodes = [KeyCodes.ESCAPE, KeyCodes.TAB];
        const keyCode = event.which || event.keyCode;
        const character = String.fromCharCode(keyCode);

        if (ignoredKeyCodes.indexOf(keyCode) > -1) {
            return;
        }

        if (!this.rows.length && character) {
            this.addNew(character);
        } else if (character) {
            if (!this.isOpen) {
                this.open();
            }
            this.filter = character;
            setTimeout(() => this.filterInput.nativeElement.focus());
        }
    }
}
