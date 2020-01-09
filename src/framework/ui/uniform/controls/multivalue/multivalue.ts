import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
    ChangeDetectorRef,
    ViewChild,
    SimpleChange,
    SimpleChanges, OnChanges, AfterViewInit
} from '@angular/core';
import {FormControl} from '@angular/forms';

import {UniFieldLayout} from '@uni-framework/ui/uniform/interfaces';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';
import {GuidService} from '@app/services/common/guidService';
import {KeyCodes} from '@app/services/common/keyCodes';

@Component({
    selector: 'uni-multivalue-input',
    templateUrl: './multivalue.html'
})
export class UniMultivalueInput extends BaseControl implements OnChanges, AfterViewInit {
    @ViewChild('filterElement', { static: false }) private filterInput: ElementRef;
    @ViewChild('mainInput', { static: true }) private mainInput: ElementRef;

    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);
    @Output() public moveForwardEvent: EventEmitter<any> = new EventEmitter<any>(true);

    public isOpen: boolean;
    private editorIsOpen: boolean;

    public rows: any[] = [];
    public filteredRows: any[] = [];

    public filter: string = '';
    public filterFormControl: FormControl = new FormControl();

    public selectedRow: any;
    public focusedRow: any;
    public emptyRow = {
        isClearSelection: true
    };

    public shortCutMessage: string = 'Hurtigtaster: \n F2 - Rediger markert linje \n F3 - Opprett ny' +
    ' \n ENTER - Velg markert linje \n DEL - Slett markert linje \n ESC - Lukk vinduet';

    constructor(
        public el: ElementRef,
        private cd: ChangeDetectorRef,
        private guidService: GuidService
    ) {
        super();
    }

    public ngOnChanges() {
        this.field.Options = this.field.Options || {};
        this.readOnly$.next(this.field && this.field.ReadOnly);

        // update default option
        if (this.field.Options.storeResultInProperty) {
            if (this.field.Options.listProperty) {
                this.filteredRows = this.rows = _.get(this.model, this.field.Options.listProperty, []);
            } else {
                this.filteredRows = this.rows = _.get(this.model, this.field.Property, []);
            }

            const modelValue = _.get(this.model, this.field.Options.storeResultInProperty);
            const displayValue = this.getDisplayValue(modelValue);

            this.focusedRow = this.selectedRow = this.rows.find(row => {
                if (modelValue && modelValue.ID && modelValue.ID === row.ID) {
                    return true;
                } else if (modelValue && modelValue._createguid && modelValue._createguid === row._createguid) {
                    return true;
                } else {
                    return this.getDisplayValue(row) === displayValue;
                }
            });

            if (this.field.Options.onChange) {
                this.changeEvent.subscribe(value => this.field.Options.onChange(this.selectedRow));
            }
        }
    }

    public ngAfterViewInit() {
        this.filteredRows = this.rows;
        this.filterFormControl.valueChanges
            .debounceTime(150)
            .subscribe((f) => {
                this.filteredRows = this.rows.filter(row => {
                    const value = (this.getDisplayValue(row) || '').toLowerCase();
                    const filterString = (this.filter || '').toLowerCase();
                    return value.includes(filterString);
                });

                this.focusedRow = this.filteredRows[0];
                this.cd.markForCheck();
            });
        this.readyEvent.emit(this);
    }

    public focus() {
        try {
            const input = this.el.nativeElement.querySelector('input');
            input.focus();
            input.select();
            this.cd.markForCheck();
            return this;
        } catch (e) {}
    }

    public emitChange(previousValue, currentValue) {
        const changeValue = new SimpleChange(previousValue, currentValue, false);
        const property = this.field.Options.storeResultInProperty || this.field.Property;
        const change = {};
        change[property] = changeValue;
        this.changeEvent.emit(change);

        change[property]['valid'] = true;
        this.inputEvent.emit(change);

        this.moveForwardEvent.emit({event: null, field: this.field});
    }

    onClick(event) {
        this.toggle();
    }

    public toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            if (this.rows && this.rows.length) {
                this.open();
            } else {
                this.addNew();
            }
        }
    }

    public open() {
        if (this.readOnly$.value) {
            return;
        }

        this.isOpen = true;
        this.filter = '';
        const listProperty = this.field.Options.listProperty || this.field.Property;
        this.rows = this.filteredRows = _.get(this.model, listProperty, []);
        setTimeout(() => this.filterInput.nativeElement.focus());
    }

    public close() {
        if (this.isOpen) {
            this.isOpen = false;
            this.filter = '';
            this.focusedRow = null;
        }
    }

    public clearSelection() {
        const previousValue = _.cloneDeep(this.selectedRow);
        this.focusedRow = this.rows[0];
        this.selectedRow = null;

        _.set(this.model, this.field.Options.storeResultInProperty, null);
        if (this.field.Options.storeIdInProperty) {
            _.set(this.model, this.field.Options.storeIdInProperty, null);
        }

        this.emitChange(previousValue, null);
        this.close();
        this.moveForwardEvent.emit({event: null, field: this.field});
    }

    public selectRow(row: any, forcedSelection?: boolean) {
        if (row && row.Deleted) {
            return;
        }
        this.close();
        if (row === this.selectedRow && !forcedSelection) {
            return;
        }
        const previousValue = _.cloneDeep(this.selectedRow);
        this.focusedRow = this.selectedRow = row || null;

        _.set(this.model, this.field.Options.storeResultInProperty, row);

        if (this.field.Options.storeIdInProperty) {
            const linkValue = !!row
                ? _.get(row, this.field.Options.linkProperty) || null
                : null;

            _.set(this.model, this.field.Options.storeIdInProperty, linkValue);
        }

        this.emitChange(previousValue, row);
        this.moveForwardEvent.emit({event: null, field: this.field});
    }

    public getDisplayValue(row): string {
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

    public edit(row, event?: Event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.editorIsOpen || !row) {
            return;
        }

        const listProperty = this.field.Options.listProperty || this.field.Property;
        this.rows = this.filteredRows = _.get(this.model, listProperty, []);
        const oldRows = this.rows;

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

                    const index = this.rows.findIndex(r => r === row);

                    if (index >= 0) {
                        this.rows[index] = editedEntity;
                        this.selectRow(editedEntity, true);
                    } else {
                        this.rows.push(editedEntity);
                        this.selectRow(editedEntity, true);
                    }

                    this.filteredRows = this.rows;
                    _.set(this.model, listProperty, this.rows);
                    this.emitChange(oldRows, this.rows);
                    this.cd.markForCheck();
                })
                .catch(() => {
                    this.editorIsOpen = false;
                    this.close();
                    this.cd.markForCheck();
                });
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

        const oldrows = [...this.rows];
        // If deleted row was selected row
        if (row === this.selectedRow) {
            if (this.field.Options.storeIdInProperty) {
                _.set(this.model, this.field.Options.storeIdInProperty, null);
            }

            if (this.field.Options.storeResultInProperty) {
                _.set(this.model, this.field.Options.storeResultInProperty, null);
            }

            const listProperty = this.field.Options.listProperty || this.field.Property;
            _.set(this.model, listProperty, this.rows);

            this.selectedRow = null;
            this.focusedRow = undefined;
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

        const oldRows = [...this.rows];
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
                    if (!this.focusedRow && this.field.Options.allowAddValue !== false) {
                        this.addNew(this.filter);
                    } else if (this.focusedRow && !this.focusedRow.isClearSelection) {
                        this.selectRow(this.focusedRow);
                    } else if (this.focusedRow && this.focusedRow.isClearSelection) {
                        this.clearSelection();
                    }
                }
                break;

            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                if (!this.isOpen) {
                    this.open();
                    return;
                }
                const selectedRowIndexDown = this.filteredRows.findIndex(row => row === this.focusedRow);

                // Set focus to "Create new" row
                if (selectedRowIndexDown === this.filteredRows.length - 1) {
                    // If create new is not allowed, to to top
                    if (this.field.Options.allowAddValue !== false) {
                        this.focusedRow = undefined;
                    } else {
                        this.focusedRow = this.emptyRow;
                    }
                // Set focus to "Clear selected"
                } else if (!this.focusedRow) {
                    this.focusedRow = this.emptyRow;
                // Select next item
                } else {
                    this.focusedRow = this.filteredRows[selectedRowIndexDown + 1];
                }
                break;

            case KeyCodes.UP_ARROW:
                event.preventDefault();
                if (!this.isOpen) {
                    this.open();
                    return;
                }
                const selectedRowIndexUp = this.filteredRows.findIndex(row => row === this.focusedRow);

                // Set focus to "Create new" row
                if (selectedRowIndexUp === 0) {
                    this.focusedRow = this.emptyRow;
                // Select next item
                } else if (selectedRowIndexUp > 0) {
                    this.focusedRow = this.filteredRows[selectedRowIndexUp - 1];
                } else {
                    // Select last item in list
                    if (!this.focusedRow || this.field.Options.allowAddValue === false) {
                        this.focusedRow = this.filteredRows[this.filteredRows.length - 1];
                    // Set focus to "Create new" row
                    } else {
                        this.focusedRow = undefined;
                    }
                }
                break;

            case KeyCodes.DELETE:
                if (!this.isOpen) {
                    this.clearSelection();
                } else if (this.focusedRow && !this.focusedRow.isClearSelection) {
                    this.delete(this.focusedRow);
                    this.close();
                }
                break;

            case KeyCodes.F2:
                event.preventDefault();
                if (this.focusedRow && !this.focusedRow.isClearSelection) {
                    this.edit(this.focusedRow);
                }
                break;

            case KeyCodes.F3:
                event.preventDefault();
                if (this.field && this.field.Options && this.field.Options.allowAddValue !== false) {
                    this.addNew(this.filter);
                }
                break;

            case KeyCodes.SPACE:
                if (!this.isOpen) {
                    event.preventDefault();
                    this.toggle();
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

        if (character) {
            if (!this.isOpen) {
                this.open();
            }
            this.filter += character;
            setTimeout(() => this.filterInput.nativeElement.focus());
        }
    }
}
