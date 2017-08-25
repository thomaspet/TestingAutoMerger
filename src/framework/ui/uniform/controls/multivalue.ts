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
import {UniFieldLayout, KeyCodes} from '../interfaces';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-multivalue-input',
    template: `
        <section (clickOutside)="close()" class="uni-multivalue-ng" (keyup.esc)="close()"
                [class.-has-values]="rows?.length">

            <input type="text" #query
                   [attr.aria-describedby]="asideGuid"
                   [(ngModel)]="currentValue"
                   [class.-has-editor]="field?.Options?.editor"
                   [readonly]="field?.ReadOnly"
                   [placeholder]="field?.Placeholder || ''"
                   (focus)="focusHandler()"
                   [title]="control?.value || ''"
            />

            <button type="button"
                    #openbtn
                    class="uni-multivalue-moreBtn"
                    (click)="showDropdown($event)"
                    tabindex="-1"
                    [disabled]="field?.ReadOnly">Ny</button>

            <ng-content></ng-content>

            <ul class="uni-multivalue-values" [class.-is-active]="listIsVisible$ | async">
                <ng-template ngFor let-row [ngForOf]="rows" let-i = "index">
                    <li [attr.aria-selected]="isSelected(row)">

                        <div *ngIf="!row.Deleted && !row._editMode">
                            <span class="uni-multivalue-value"
                                  (click)="selectRow(row)">
                                  {{showDisplayValue(row)}}
                            </span>
                            <button type="button" class="uni-multivalue_edit_action-delete"
                                *ngIf="field.Options == null || field.Options.allowDeleteValue == null || field.Options.allowDeleteValue === true"
                                (click)="delete(i, $event)">
                                Delete
                            </button>
                            <button type="button" class="uni-multivalue_edit_action-edit"
                                (click)="edit(row, $event)">
                                Rediger {{showDisplayValue(row)}}
                            </button>
                        </div>

                        <input *ngIf="row._editMode"
                                #input
                                class="uni-multivalue_edit"
                                [(ngModel)]="tempValue"
                                (blur)="save(row, input.value, $event)"
                                (keypress)="save(row, input.value, $event)"
                                type="text"
                        />

                        <p *ngIf="row.Deleted" class="uni-multivalue_deleted">
                            Slettet &lsquo;{{showDisplayValue(row)}}&rsquo;.
                            (<a (click)="regretDelete(i, $event)">Angre</a>)
                        </p>

                    </li>
                </ng-template>
                <li [hidden]="field.Options.allowAddValue === false">
                    <button class="uni-multivalue-addBtn"
                            #addButton
                            type="button"
                            (click)="addValue($event)">
                                Legg til&hellip;
                    </button>
                </li>
            </ul>
            <small *ngIf="successMessage" class="good">Lagret.</small>
        </section>
    `
})
export class UniMultivalueInput extends BaseControl {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);
    @Output() public moveForwardEvent: EventEmitter<any> = new EventEmitter<any>(true);

    @ViewChild('openbtn')
    private inputElement: ElementRef;
    @ViewChild('query')
    private queryElement: ElementRef;
    @ViewChild('addButton')
    private addButtonElement: ElementRef;

    private listIsVisible$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private currentValue: string = '';
    private tempValue: string;
    private rows: any[] = [];
    private defaultRow: any;
    private editorIsOpen: boolean = false;
    private isDirty: boolean = false;
    private addButtonHasFocus: boolean = false;
    constructor(public renderer: Renderer, public el: ElementRef, private cd: ChangeDetectorRef) {
        super();
    }

    private createOpenCloseListeners() {
        const target = <any>this.el.nativeElement.children[0].children[0];
        const keyDownEvent = Observable.fromEvent(target, 'keydown');

        keyDownEvent.subscribe((event: KeyboardEvent) => {
            const openKeys = [
              KeyCodes.F4,
              KeyCodes.SPACE,
              KeyCodes.ARROW_UP,
              KeyCodes.ARROW_DOWN
            ];

            const alphanumeric = event.key && event.key.length === 1 && /[A-Za-z0-9]/.test(event.key);

            if (openKeys.some(key => key === event.keyCode)) {
                event.preventDefault();
                event.stopPropagation();
                this.toggle();
            } else if (event.keyCode === KeyCodes.ESC) {
                event.preventDefault();
                event.stopPropagation();
                this.close();
            } else if (alphanumeric && !this.editorIsOpen) {
                this.queryElement.nativeElement.blur();
                this.edit(this.defaultRow, event);
            }
        });
    }

    public createListNavigationListeners() {
        let keydownEvent = Observable.fromEvent(this.queryElement.nativeElement, 'keydown');
        let keydownEvent2 = Observable.fromEvent(this.addButtonElement.nativeElement, 'keydown');
        let keydownEvent3 = Observable.fromEvent(this.inputElement.nativeElement, 'keydown');
        let events = Observable.merge(keydownEvent, keydownEvent2, keydownEvent3);
        let arrowsEvent = events.filter((event: KeyboardEvent) => {
            return (event.keyCode === KeyCodes.ARROW_DOWN || event.keyCode === KeyCodes.ARROW_UP) && !event.altKey;
        });
        keydownEvent.subscribe((event: KeyboardEvent) => {
            if (event.keyCode === KeyCodes.ENTER) {
                if (!this.rows || this.rows.length === 0) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.addValue(event);
                    return;
                }
            }
            if (event.keyCode === KeyCodes.TAB) {
                this.close();
            }
        });
        arrowsEvent.subscribe((event: KeyboardEvent) => {
            event.preventDefault();
            event.stopPropagation();

            let index: number = this.rows.indexOf(this.defaultRow);
            if (this.addButtonHasFocus) {
                index = this.rows.length;
            }
            this.addButtonHasFocus = false;
            switch (event.keyCode) {
                case KeyCodes.ARROW_DOWN:
                    index = index + 1;
                    if (index === this.rows.length && this.listIsVisible$.getValue()) {
                        // set focus on button
                        this.addButtonElement.nativeElement.focus();
                        this.addButtonHasFocus = true;
                    }
                    index = index < this.rows.length ? index : this.rows.length - 1;
                    break;
                case KeyCodes.ARROW_UP:
                    index = index - 1;
                    index = index < 0 ? 0 : index;
                    this.queryElement.nativeElement.focus();
                    break;
            }

            this.defaultRow = this.rows[index];
            this.setAsDefault(this.defaultRow);
        });
    }

    public focus() {
        this.renderer.invokeElementMethod(this.el.nativeElement.children[0].children[0], 'focus', []);
        this.renderer.invokeElementMethod(this.el.nativeElement.children[0].children[0], 'select', []);
        this.cd.markForCheck();
        return this;
    }

    public ngOnChanges() {
        this.field.Options = this.field.Options || {};
        this.currentValue = '';
        this.readOnly$.next(this.field && this.field.ReadOnly);
        // update default option
        if (this.field.Options.storeResultInProperty) {
            if (this.field.Options.listProperty) {
                this.rows = _.get(this.model, this.field.Options.listProperty, []);
            } else {
                this.rows = _.get(this.model, this.field.Property, []);
            }
            let foreignValue = _.get(this.model, this.field.Options.storeResultInProperty);
            foreignValue = this.showDisplayValue(foreignValue);
            if (this.rows) {
                this.rows.forEach((row) => {
                    let value = this.showDisplayValue(row);
                    if (value === foreignValue) {
                        this.setAsDefault(row);
                    }
                });
            }

            if (this.field.Options.onChange) {
                this.changeEvent.subscribe(value => this.field.Options.onChange(this.defaultRow));
            }
        }
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
        this.createOpenCloseListeners();
        this.createListNavigationListeners();
    }

    public emitChange(previousValue, currentValue) {
        let changeValue = new SimpleChange(previousValue, currentValue, false);
        let property = this.field.Options.storeResultInProperty || this.field.Property;
        let change = {};
        change[property] = changeValue;
        this.changeEvent.emit(change);
        change[property]['valid'] = true;
        this.inputEvent.emit(change);
    }

    private shouldStoreID() {
        return !!this.field.Options.storeIdInProperty;
    }

    private showDropdown(event: KeyboardEvent) {
        if (!event || event.keyCode === KeyCodes.ENTER || event.keyCode === KeyCodes.TAB
        || event.keyCode === KeyCodes.F4
        || event.keyCode === KeyCodes.SPACE
        || (event.keyCode === KeyCodes.ARROW_DOWN && event.altKey)
        || (event.keyCode === KeyCodes.ARROW_UP && event.altKey)) {
            return;
        }
        if (this.rows && !this.rows.length) {
            if (!this.editorIsOpen) {
                this.addValue(event);
            }
        }
        if (document.activeElement === event.target) {
            if (event.target === this.inputElement.nativeElement) {
                if (event instanceof MouseEvent) {
                    this.toggle();
                    return;
                }
            }
            if (!this.editorIsOpen) {
                const letterNumber = /^[0-9a-zA-Z]+$/;
                // if it is alphanumeric
                if (event.key.length === 1 && event.key.match(letterNumber)) {
                    this.open();
                    this.isDirty = true;
                }
            }
        }
    }

    private toggle() {
        if (this.listIsVisible$.getValue()) {
            this.close();
        } else {
            this.open();
        }
    }

    private open() {
        if (this.field.ReadOnly) {
            return;
        }
        this.listIsVisible$.next(true);
    }

    private close() {
        if (this.isDirty) {
            this.setAsDefault(this.defaultRow);
            this.isDirty = false;
        }
        this.listIsVisible$.next(false);
    }

    private isSelected(row) {
        return row === this.defaultRow && !this.addButtonHasFocus;
    }

    public selectRow(row) {
        let previousValue = this.defaultRow;
        this.setAsDefault(row);
        let nextValue = this.defaultRow;
        this.emitChange(previousValue, nextValue);
        this.close();
        this.moveForwardEvent.emit({event: null, field: this.field});
        if (this.isDirty) {
            this.isDirty = false;
        }

    }

    private setAsDefault(row) {
        let oldValue = _.get(this.model, this.field.Property);
        let storeResultInProperty = this.field.Options.storeResultInProperty;
        let linkProperty = this.field.Options.linkProperty;
        let currentValue = row;
        let fp = _.get(this.model, storeResultInProperty);
        let lp = row;

        this.defaultRow = row;
        this.currentValue = this.showDisplayValue(row);
        if (fp === lp && oldValue === currentValue) {
            return; // no emit changes since it is not updated;
        }
        _.set(this.model, storeResultInProperty, lp);
        this.cd.markForCheck(); // update input value after update defaultRow;
        this.isDirty = false;
        if (this.shouldStoreID()) {
            let value = _.get(row, linkProperty);
            _.set(this.model, this.field.Options.storeIdInProperty, value || null);
        }
    }

    private showDisplayValue(row) {
        if (!this.field.Options.display) {
            return _.get(row, this.field.Options.displayValue);
        }
        if (!row) {
            return '';
        }
        return this.field.Options.display(row);
    }

    private addValue($event) {
        if ($event instanceof KeyboardEvent) {
            const letterNumber = /^[0-9a-zA-Z]+$/;
            // if it is alphanumeric
            if ($event.key.length === 1 && $event.key.match(letterNumber)) {
                if (!this.isDirty) {
                    this.isDirty = true;
                }
            }
        }

        let newEntity = {ID: 0};
        this.edit(newEntity, $event);
    }

    private edit(row, $event) {
        $event.preventDefault();
        $event.stopPropagation();

        if (this.editorIsOpen) {
            return;
        }

        this.rows.map(x => x._editMode = false);

        if (this.field.Options.editor) {
            if (!this.editorIsOpen) {
                const oldValue = Object.assign({}, row);
                this.editorIsOpen = true;

                this.field.Options.editor(row).then(editedEntity => {
                    this.isDirty = false;
                    this.editorIsOpen = false;
                    if (!editedEntity) {
                        this.focus();
                        return;
                    }

                    const index = this.rows.indexOf(row);
                    if (index >= 0) {
                        this.rows[index] = editedEntity;
                    } else {
                        this.rows.push(editedEntity);
                    }

                    this.close();

                    this.setAsDefault(editedEntity);
                    const newValue = editedEntity;
                    this.emitChange(oldValue, newValue);
                    this.cd.markForCheck();
                    this.moveForwardEvent.emit({event: $event, field: this.field});
                }).catch((err) => {
                    this.isDirty = false;
                    this.editorIsOpen = false;
                    this.close();
                });
            }
        } else {
            this.tempValue = this.showDisplayValue(row);
            row._editMode = true;
            setTimeout(() => {
                this.renderer.invokeElementMethod(document.querySelector('.uni-multivalue_edit'), 'focus', []);
                this.close();
                this.moveForwardEvent.emit({event: $event, field: this.field});
            }, 200);
        }
    }

    private save(row, tempValue, $event) {
        if ($event.which === 27) {
            $event.preventDefault();
            $event.stopPropagation();
            row._editMode = false;
            this.isDirty = false;
            return;
        }
        if ($event.which === 13 || $event.type === 'blur') {
            $event.preventDefault();
            $event.stopPropagation();
            if (_.get(row, this.field.Options.displayValue) === tempValue) {
                row._editMode = false;
                this.isDirty = false;
                return;
            }
            let previousValue = _.get(this.model, this.field.Property);
            _.set(row, this.field.Options.displayValue, tempValue);
            _.set(this.model, this.field.Property, this.rows);
            this.emitChange(previousValue, this.rows);
            row._editMode = false;
            this.isDirty = false;
        }
    }

    public delete(index: number, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        let oldrows = [...this.rows];

        // If deleted row was selected row
        if (this.showDisplayValue(this.rows[index]) === this.currentValue) {
            if (this.field.Options.storeIdInProperty) {
                _.set(this.model, this.field.Options.storeIdInProperty, null);
            }

            if (this.field.Options.storeResultInProperty) {
                _.set(this.model, this.field.Options.storeResultInProperty, null);
            }

            this.defaultRow = null;
            this.currentValue = '';
        }

        // Delete the row
        if (this.rows[index].ID) {
            this.rows[index].Deleted = true;
        } else {
            this.rows.splice(index, 1);
        }

        this.emitChange(oldrows, this.rows);
        this.cd.markForCheck();

    }

    public regretDelete(index: number, $event) {
        $event.stopPropagation();
        $event.preventDefault();

        let oldRows = [...this.rows];
        this.rows[index]._editMode = false;
        this.rows[index].Deleted = false;

        this.emitChange(oldRows, this.rows);
        this.cd.markForCheck();
    }
}
