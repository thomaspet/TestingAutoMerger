import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
    ChangeDetectorRef,
    ViewChild,
    Renderer
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout, KeyCodes} from '../interfaces';
import {Observable} from 'rxjs/Observable';

declare var _; // lodash

@Component({
    selector: 'uni-multivalue-input',
    template: `
        <section (clickOutside)="close()" class="uni-multivalue-ng" (keyup.esc)="close()"
                [class.-has-values]="rows?.length">

            <input type="text"
                    [(ngModel)]="currentValue"
                    [class.-has-editor]="field?.Options?.editor"
                    [readonly]="field?.ReadOnly"
                    [placeholder]="field?.Placeholder || ''"
                    (keypress)="showDropdown($event)"
                    (focus)="focusHandler()"
            />

            <button type="button" #openbtn class="uni-multivalue-moreBtn" (click)="showDropdown($event)" tabindex="-1" [disabled]="field?.ReadOnly">Ny</button>

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
    public readyEvent: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);

    @Output()
    public changeEvent: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public focusEvent: EventEmitter<UniMultivalueInput> = new EventEmitter<UniMultivalueInput>(true);

    @ViewChild('openbtn')
    private inputElement: ElementRef;

    private listIsVisible: boolean = false;
    private currentValue: string = '';
    private tempValue: string;
    private rows: any[] = [];
    private defaultRow: any;

    constructor(public renderer: Renderer, public el: ElementRef, private cd: ChangeDetectorRef) {
    }

    private createOpenCloseListeners() {
        const target = this.el.nativeElement.children[0].children[0];
        const keyDownEvent = Observable.fromEvent(target, 'keydown');
        const f4AndSpaceEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return event.keyCode === KeyCodes.F4 || event.keyCode === KeyCodes.SPACE;
        });
        const arrowDownEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return (event.keyCode === KeyCodes.ARROW_UP
                || event.keyCode === KeyCodes.ARROW_DOWN)
                && event.altKey;
        });

        Observable.merge(f4AndSpaceEvent, arrowDownEvent)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.toggle();
            });

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ESC)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.close();
            });
    }

    private createTabAndEnterListener() {
        const keyDownEvent = Observable.fromEvent(this.el.nativeElement, 'keydown');
        const tabEvent = keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.TAB);
        const enterEvent = keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ENTER);
        const tabAndEnterEvents = Observable.merge(tabEvent, enterEvent);
        tabAndEnterEvents.subscribe((event: KeyboardEvent) => {
            this.close();
        });
    }

    public createListNavigationListeners() {
        let keydownEvent = Observable.fromEvent(this.el.nativeElement, 'keydown');
        let arrowsEvent = keydownEvent.filter((event: KeyboardEvent) => {
            return event.keyCode === KeyCodes.ARROW_DOWN || event.keyCode === KeyCodes.ARROW_UP;
        });
        arrowsEvent.subscribe((event: KeyboardEvent) => {

            event.preventDefault();
            event.stopPropagation();

            let index: number = 0;
            index = this.rows.indexOf(this.defaultRow);
            switch (event.keyCode) {
                case KeyCodes.ARROW_DOWN:
                    index = index + 1;
                    index = index < this.rows.length ? index : this.rows.length - 1;
                    break;
                case KeyCodes.ARROW_UP:
                    index = index - 1;
                    index = index < 0 ? 0 : index;
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

    public focusHandler() {
        this.focusEvent.emit(this);
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
                this.changeEvent.subscribe(value => this.field.Options.onChange(this.defaultRow));
            }
        }
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
        this.createOpenCloseListeners();
        this.createListNavigationListeners();
        this.createTabAndEnterListener();
    }

    private showDropdown(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.ENTER || event.keyCode === KeyCodes.TAB) {
            return;
        }
        if (!this.rows.length) {
            this.addValue(event);
        }
        if (document.activeElement === event.target) {
            this.toggle();
        }
    }

    private toggle() {
        if (this.listIsVisible) {
            this.close();
        } else {
            this.open();
        }
    }

    private open() {
        if (this.field.ReadOnly) {
            return;
        }
        this.listIsVisible = true;
        this.cd.markForCheck();
    }

    private close() {
        this.listIsVisible = false;
        this.cd.markForCheck();
    }

    private isSelected(row) {
        return row === this.defaultRow;
    }

    public selectRow(row) {
        this.setAsDefault(row);
        this.changeEvent.emit(this.model);
        this.close();
        this.setFocusOnNextField();
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
            this.changeEvent.emit(this.model);
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
                self.changeEvent.emit(self.model);
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
                self.changeEvent.emit(self.model);

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
            this.changeEvent.emit(this.model);
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
                this.changeEvent.emit(this.model);
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
        let nextUniField = uniFieldParent.nextElementSibling;
        if (nextUniField) {
            if (nextUniField.tagName === 'UNI-LINEBREAK') {
                nextUniField = nextUniField.nextElementSibling;
            }
            const input = <HTMLInputElement>nextUniField.querySelector('input,textarea,select,button');
            if (input) {
                input.focus();
                input.select();
            }
        }
    }

    private setFocusOnPrevField() {
        const uniFieldParent = this.findAncestor(this.inputElement.nativeElement, 'uni-field');
        let nextUniField = uniFieldParent.previousElementSibling;
        if (nextUniField) {
            if (nextUniField.tagName === 'UNI-LINEBREAK') {
                nextUniField = nextUniField.previousElementSibling;
            }
            const input = <HTMLInputElement>nextUniField.querySelector('input,textarea,select,button');
            if (input) {
                input.focus();
                input.select();
            }
        }
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
