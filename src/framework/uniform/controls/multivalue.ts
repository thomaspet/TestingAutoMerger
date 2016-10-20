import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectorRef, ViewChild, Renderer, HostListener} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';

declare var _; // lodash

@Component({
    selector: 'uni-multivalue-input',
    template: `
        <section (clickOutside)="close()" class="uni-multivalue-ng" (keyup.esc)="close()"
                [class.-has-values]="rows?.length">

            <input type="text"
                    [(ngModel)]="currentValue"
                    [class.-has-editor]="field?.Options?.editor"
                    [readonly]="field?.Options?.editor || field?.ReadOnly"
                    [placeholder]="field?.Placeholder || ''"
                    (keypress)="showDropdown($event)"
                    (focus)="focusHandler()"
            />

            <button type="button" #openbtn class="uni-multivalue-moreBtn" (click)="showDropdown($event)" tabindex="-1">Ny</button>

            <ul class="uni-multivalue-values" [class.-is-active]="listIsVisible">
                <template ngFor let-row [ngForOf]="rows" let-i = "index">
                    <li [attr.aria-selected]="isSelected(row)">

                        <div *ngIf="!row._mode">
                            <span class="uni-multivalue-value"
                                  (click)="selectRow(row)">
                                  {{showDisplayValue(row)}}
                            </span>
                            <button type="button" class="uni-multivalue_edit_action-delete"
                                *ngIf="field.Options == null || field.Options.allowDeleteValue == null || field.Options.allowDeleteValue === true"
                                (click)="remove(row, $event)">
                                Delete
                            </button>
                            <button type="button" class="uni-multivalue_edit_action-edit"
                                (click)="edit(row, $event)">
                                Rediger {{showDisplayValue(row)}}
                            </button>
                        </div>

                        <input *ngIf="row._mode === 1"
                                #input
                                class="uni-multivalue_edit"
                                [(ngModel)]="tempValue"
                                (blur)="save(row, input.value, $event)"
                                (keypress)="save(row, input.value, $event)"
                                type="text"
                        />

                        <p *ngIf="row._mode === 2" class="uni-multivalue_deleted">
                            Slettet &lsquo;{{showDisplayValue(row)}}&rsquo;.
                            (<a (click)="putBack(row, $event)">Angre</a>)
                        </p>

                    </li>
                </template>
                <li *ngIf="field.Options == null || field.Options.allowAddValue == null || field.Options.allowAddValue === true">
                    <button class="uni-multivalue-addBtn"
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
export class UniMultivalueInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public onReady: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public onFocus: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);

    @ViewChild('openbtn')
    private inputElement: ElementRef;

    private listIsVisible: boolean = false;
    private currentValue: string = '';
    private tempValue: string;
    private rows: any[] = [];
    private defaultRow: any;

    constructor(public renderer: Renderer, public el: ElementRef, private cd: ChangeDetectorRef) {
        this.onChange.subscribe(() => this.setFocusOnNextField());
    }

    public focus() {
        this.renderer.invokeElementMethod(this.el.nativeElement.children[0].children[0], 'focus', []);
        this.cd.markForCheck();
        return this;
    }

    public focusHandler() {
        this.onFocus.emit(this);
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
        this.currentValue = '';

        // update default option
        if (this.field.Options.storeResultInProperty) {
            if (this.field.Options.listProperty) {
                this.rows = _.get(this.model, this.field.Options.listProperty);
            } else {
                this.rows = _.get(this.model, this.field.Property);
            }

            var foreignValue = _.get(this.model, this.field.Options.storeResultInProperty);

            if (this.rows) {
                this.rows.forEach((row) => {
                    let id = _.get(row, this.field.Options.linkProperty);
                    if (id === foreignValue) {
                        this.setAsDefault(row);
                    }
                });
            }

            if (this.field.Options.onChange) {
                this.onChange.subscribe(value => this.field.Options.onChange(this.defaultRow));
            }
        }
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }

    private showDropdown(event) {
        if (!this.rows.length) {
            this.addValue(event);
        }

        if (document.activeElement === event.target) {
            this.listIsVisible = !this.listIsVisible;
        }
    }

    private close() {
        setTimeout(() => {
            this.listIsVisible = false;
            this.cd.markForCheck();
        });
    }

    private isSelected(row) {
        return row === this.defaultRow;
    }

    public selectRow(row) {
        this.setAsDefault(row);
        this.onChange.emit(this.model);
        this.close();
    }

    private setAsDefault(row) {
        let oldProperty = _.get(this.model, this.field.Property);

        _.set(this.model, this.field.Property, row);
        this.defaultRow = row;
        this.currentValue = this.showDisplayValue(row);

        if (!this.field.Options.storeResultInProperty) {
            return;
        }
        var storeResultInProperty = this.field.Options.storeResultInProperty;
        var linkProperty = this.field.Options.linkProperty;
        var fp = _.get(this.model, storeResultInProperty);
        var lp = _.get(row, linkProperty);
        if (fp === lp && oldProperty === row) {
            return; // no emit changes since it is not updated;
        }

        _.set(this.model, storeResultInProperty, lp);
        this.cd.markForCheck();
    }

    private showDisplayValue(row) {
        if (!this.field.Options.display) {
            return _.get(row, this.field.Options.displayValue);
        }
        return this.field.Options.display(row);
    }

    private addValue($event) {
        var self = this;
        if (!this.field.Options.editor) {
            var entity = this.field.Options.entity;
            var tmp = new entity();
            _.set(tmp, this.field.Options.displayValue, this.currentValue);
            this.rows = [].concat(this.rows, tmp);
            _.set(this.model, this.field.Property, this.rows);
            this.currentValue = '';
            let row = this.rows[this.rows.length - 1];
            this.edit(row, $event);
            this.onChange.emit(this.model);
        } else {
            this.field.Options.editor(null).then(newEntity => {
                self.rows = [].concat(self.rows, newEntity);
                self.currentValue = '';
                if (self.field.Options.listProperty) {
                    _.set(self.model, self.field.Options.listProperty, self.rows);
                } else {
                    _.set(self.model, self.field.Property, self.rows);
                }
                self.setAsDefault(newEntity);
                self.cd.markForCheck();
                self.onChange.emit(self.model);
            });
        }
    }

    private edit(row, $event) {
        var self = this;
        this.rows.forEach(x => x._mode = 0);
        $event.preventDefault();
        $event.stopPropagation();
        if (this.field.Options.editor) {
            this.field.Options.editor(row).then(editedEntity => {
                var index = self.rows.indexOf(row);
                var part1 = self.rows.slice(0, index);
                var part2 = self.rows.slice(index + 1);
                self.rows = [
                    ...part1,
                    editedEntity,
                    ...part2
                ];

                if (self.field.Options.listProperty) {
                    _.set(self.model, self.field.Options.listProperty, self.rows);
                } else {
                    _.set(self.model, self.field.Property, self.rows);
                }
                self.setAsDefault(editedEntity);
                self.onChange.emit(self.model);

                self.cd.markForCheck();
            });
        } else {
            this.tempValue = this.showDisplayValue(row);
            row._mode = 1;
            setTimeout(() => {
                this.renderer.invokeElementMethod(document.querySelector('.uni-multivalue_edit'), 'focus', []);
            }, 200);
        }
    }

    private save(row, tempValue, $event) {
        if ($event.which === 27) {
            $event.preventDefault();
            $event.stopPropagation();
            row._mode = 0;
            return;
        }
        if ($event.which === 13 || $event.type === 'blur') {
            $event.preventDefault();
            $event.stopPropagation();
            if (_.get(row, this.field.Options.displayValue) === tempValue) {
                row._mode = 0;
                return;
            }
            _.set(row, this.field.Options.displayValue, tempValue);
            _.set(this.model, this.field.Property, this.rows);
            this.onChange.emit(this.model);
            row._mode = 0;
        }
    }

    private remove(row, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        row._mode = 2;
        setTimeout(() => {
            if (row._mode === 2) {
                var index = this.rows.indexOf(row);
                this.rows = this.rows.slice(0, index).concat(this.rows.slice(index + 1));
                _.set(this.model, this.field.Property, this.rows);
                this.onChange.emit(this.model);
                this.cd.markForCheck();
            }
        }, 5000);
        this.cd.markForCheck();
    }

    private putBack(row, $event) {
        $event.stopPropagation();
        $event.preventDefault();
        row._mode = 0;
    }

    private setFocusOnNextField() {
        const uniFieldParent = this.findAncestor(this.el.nativeElement, 'uni-field');
        const nextUniField = uniFieldParent.nextElementSibling;
        const input = <HTMLElement>nextUniField.querySelector('input,textarea,select,button');
        input.focus();
    }

    private findAncestor(element: HTMLElement, selector: string): HTMLElement {
        element = element.parentElement;
        while (element) {
            if (element.matches(selector)) {
                return element;
            }
            element = element.parentElement;
        }
    }
}
