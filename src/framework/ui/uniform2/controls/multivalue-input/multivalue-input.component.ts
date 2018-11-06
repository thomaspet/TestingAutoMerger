import {
    Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef,
    ChangeDetectionStrategy
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { KeyCodes } from '@app/services/common/keyCodes';
import { GuidService } from '@app/services/common/guidService';
import * as _ from 'lodash';
import { hasParent } from '@uni-framework/ui/uniform2/unform2.helpers';

@Component({
    selector: 'uni-multivalue-input2',
    templateUrl: './multivalue-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: MultivalueComponent, multi: true },
    ]
})
export class MultivalueComponent implements OnInit, ControlValueAccessor {

    @Input() config;
    @Input() source;
    @Input() guid;
    @Input() formControl: FormControl;
    @Output() sourceChange: EventEmitter<any> = new EventEmitter();
    @Output() focus: EventEmitter<MultivalueComponent> = new EventEmitter();
    @Output() blur: EventEmitter<MultivalueComponent> = new EventEmitter();
    @ViewChild('filterElement') private filterInput: ElementRef;
    @ViewChild('mainInput') private mainInput: ElementRef;
    mainInputControl: FormControl = new FormControl('');
    filterInputControl: FormControl = new FormControl('');
    onChange: (value: string) => void;
    onTouched: () => void;

    isOpen = false;
    editorIsOpen = false;
    filteredRows: any[] = [];
    selectedRow;
    focusedRow;
    filter;

    constructor(private guidService: GuidService) { }

    ngOnInit() {
        this.filteredRows = this.source || [];
    }

    // used to initialize the component with the control value
    writeValue(value: any) {
        this.focusedRow = value;
        if (this.config && this.config.Options.valueProperty) {
            const fn = x => _.get(x, this.config.Options.valueProperty) === _.get(value, this.config.Options.valueProperty);
            this.selectedRow = this.source.find(fn) || null;
        } else {
            this.selectedRow = this.source.find((x => _.isEqual(value, x)));
        }
        this.mainInputControl.setValue(this.config.Options.templateFn(value));
    }

    // this function is always this way.
    registerOnChange(onChange: (value: string) => void) {
        this.onChange = onChange;
    }

    // this function is alwas this way
    registerOnTouched(onTouched) {
        this.onTouched = onTouched;
    }

    onFocus() {
        this.focus.emit(this);
    }

    onBlur() {
        if (!hasParent(document.activeElement, 'uni-multivalue-input2')) {
            this.onTouched();
            this.blur.emit(this);
        }
    }

    onFilterChange(value) {
        this.filteredRows = this.filterRows(this.source, value);
    }

    filterRows(rows, filter) {
        if (filter === '') {
            return rows;
        }
        return rows.filter(row => {
            if (this.config.Options.templateFn(row).indexOf(filter) > -1) {
                return true;
            }
            return false;
        });
    }

    close() {
        this.isOpen = false;
        this.focusedRow = this.selectedRow;
        this.onTouched();
    }

    open() {
        this.isOpen = true;
        this.filterInputControl.setValue('');
        this.filteredRows = this.source;
        setTimeout(() => this.filterInput.nativeElement.focus());
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    keyPressHandler(event: KeyboardEvent) {
        const ignoredKeyCodes = [KeyCodes.ESCAPE, KeyCodes.TAB];
        const keyCode = event.which || event.keyCode;
        const character = String.fromCharCode(keyCode);

        if (ignoredKeyCodes.indexOf(keyCode) > -1) {
            return;
        }

        if (!this.source.length && character) {
            this.addNew(character);
        } else if (character) {
            if (!this.isOpen) {
                this.open();
            }
            this.filterInputControl.setValue(character);
            setTimeout(() => this.filterInput.nativeElement.focus());
        }
    }

    keyDownHandler(event: KeyboardEvent) {
        const keyCode = event.which || event.keyCode;


        switch (keyCode) {
            case KeyCodes.TAB:
            case KeyCodes.ENTER:
                if (this.isOpen) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.selectRow(this.focusedRow);
                }
                break;

            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                event.stopPropagation();
                if (!this.isOpen) {
                    this.isOpen = true;
                    return;
                }
                this.moveToNextItem();
                break;

            case KeyCodes.UP_ARROW:
                event.preventDefault();
                event.stopPropagation();
                if (!this.isOpen) {
                    this.isOpen = true;
                    return;
                }
                this.moveToPreviousItem();
                break;

            case KeyCodes.DELETE:
                event.preventDefault();
                event.stopPropagation();
                this.clearSelection();
                break;
            case KeyCodes.F1:
                event.preventDefault();
                event.stopPropagation();
                this.edit(this.focusedRow);
                break;

            case KeyCodes.F3:
                event.preventDefault();
                event.stopPropagation();
                this.addNew(this.filterInputControl.value);
                break;

            case KeyCodes.SPACE:
                if (!this.isOpen) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.open();
                }
                break;
            case KeyCodes.F4:
                event.preventDefault();
                event.stopPropagation();
                this.toggle();
                break;
            case KeyCodes.ESCAPE:
                event.preventDefault();
                event.stopPropagation();
                this.mainInput.nativeElement.focus();
                break;
        }
    }

    addNew(initValue?: string) {
        this.edit({
            ID: 0,
            _initValue: initValue,
            _createguid: this.guidService.guid()
        });
    }

    edit(row, event?: Event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.editorIsOpen || !row) {
            return;
        }

        if (this.config.Options.editor) {
            if (!this.editorIsOpen) {
                this.editorIsOpen = true;
                this.close();

                this.config.Options.editor(row).then(editedEntity => {
                    this.editorIsOpen = false;
                    if (!editedEntity) {
                        this.mainInput.nativeElement.focus();
                        return this.source;
                    }

                    const index = this.source.findIndex(r => r === row);
                    if (index >= 0) {
                        this.source[index] = editedEntity;
                        this.selectRow(editedEntity);
                    } else {
                        this.source.push(editedEntity);
                        this.selectRow(editedEntity);
                    }
                    return this.source;
                })
                .then(rows => {
                    // let listProperty = this.field.Options.listProperty || this.field.Property;
                    this.sourceChange.emit(rows);
                })
                .catch((err) => {
                    console.error(err);
                    this.editorIsOpen = false;
                    this.close();
                });
            }
        } else {
            console.warn('MultiValue is missing an editor');
        }
    }

    selectRow(row: any) {
        if (row && row.Deleted) {
            return;
        }
        this.close();
        if (row === this.selectedRow) {
            return;
        }
        this.selectedRow = row;
        this.focusedRow = row;
        this.mainInputControl.setValue(this.config.Options.templateFn(this.selectedRow));
        if (this.config && this.config.Options.valueProperty) {
            this.onChange(_.get(row, this.config.Options.valueProperty));
        } else {
            this.onChange(row);
        }
    }

    delete(row, event?: Event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        // If deleted row was selected row
        if (row === this.selectedRow) {
            this.onChange(null);
            this.selectedRow = null;
        }
        // Delete the row
        if (row.ID) {
            row.Deleted = true;
        } else {
            this.source.splice(this.source.indexOf(row), 1);
            this.filteredRows.splice(this.filteredRows.indexOf(row), 1);
        }
        this.sourceChange.emit(this.source);
    }

    regretDelete(row, event) {
        event.stopPropagation();
        event.preventDefault();

        row.Deleted = false;
        this.sourceChange.emit(this.source);
    }

    clearSelection() {
        this.focusedRow = this.filteredRows[0];
        this.selectedRow = null;
        this.mainInputControl.setValue('');
        this.onChange(null);
    }

    moveToNextItem() {
        const index = this.filteredRows.findIndex(row => this.focusedRow === row) || 0;
        const nextIndex = index + 1;
        if (nextIndex < this.filteredRows.length) {
            this.focusedRow = this.filteredRows[nextIndex];
        }
    }

    moveToPreviousItem() {
        const index = this.filteredRows.findIndex(row => this.focusedRow === row) || 0;
        const nextIndex = index - 1;
        if (nextIndex === -1) {
            this.focusedRow = null;
        } else if (nextIndex > -1) {
            this.focusedRow = this.filteredRows[nextIndex];
        }
    }

    focusInput() {
        setTimeout(() => this.mainInput.nativeElement.focus());
    }
}
