import {
    Component,
    ViewChild,
    ApplicationRef,
    Output,
    Renderer,
    EventEmitter,
    ComponentRef,
    ViewContainerRef,
    ElementRef,
    ComponentFactoryResolver,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniTableColumnType} from '../config/unitableColumn';
import {IEditorData} from '../config/unitableConfig';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import * as moment from 'moment';
import * as Immutable from 'immutable';
import {LocalDate} from '../../../../app/unientities';

export interface IEditorChangeEvent {
    rowModel: any;
    field: string;
    newValue: any;
}

@Component({
    selector: 'unitable-editor',
    template: `
        <span
            [ngClass]="{hidden: !isOpen}"
            [ngStyle]="{'top': position.top, 'left': position.left, 'height': position.height, 'width': position.width}"
            (keydown)="onKeyDown($event)"
            class="unitable-editor-span">
            <span #editor></span>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'checkForClickOutside($event)'
    },
})
export class UnitableEditor {
    @ViewChild('editor', {read: ViewContainerRef})
    private editorContainer: ViewContainerRef;

    @Output()
    public valueChange: EventEmitter<any> = new EventEmitter();

    @Output()
    public copyFromAbove: EventEmitter<any> = new EventEmitter();

    public static parentModule: any;
    public isOpen: boolean = false;

    private initValue: string | LocalDate;
    private columnType: UniTableColumnType;
    private editor: ComponentRef<any>;
    private inputControl: FormControl = new FormControl();
    private column: any;
    private rowModel: any;
    private position: any = {
        top: '0px',
        left: '0px',
        height: '0px',
        width: '0px'
    };

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private renderer: Renderer,
        private el: ElementRef,
        private cdr: ChangeDetectorRef
    ) {}

    public openEditor(position, column, rowModel, initValue, initAsDirty) {
        this.columnType = column.get('type');

        // Update editor info
        this.position = position;
        this.column = column;
        this.rowModel = rowModel;
        this.initValue = initValue;

        // Create and load editor
        let editorClass = this.column.get('editor');
        let factory = this.componentFactoryResolver.resolveComponentFactory(editorClass);
        this.editor = this.editorContainer.createComponent(factory);
        let component = this.editor.instance;

        this.inputControl = new FormControl(initValue || '');
        if (initAsDirty) {
            this.inputControl.markAsDirty();
        }

        component.inputControl = this.inputControl;
        component.column = this.column;
        component.rowModel = this.rowModel;

        // Focus input and select text
        setTimeout(() => {
            try {
                this.renderer.invokeElementMethod(component.inputElement.nativeElement, 'focus', []);
            } catch (e) {}

            try {
                if (this.columnType !== UniTableColumnType.Select) {
                    this.renderer.invokeElementMethod(component.inputElement.nativeElement, 'select', []);
                }
            } catch (e) {}
        });

        this.isOpen = true;
        this.cdr.markForCheck();
    }

    public emitAndClose(): Promise<IEditorChangeEvent> {
        return new Promise((resolve, reject) => {
            this.getChangeObject(true).subscribe((change) => {
                if (change) {
                    this.valueChange.emit(change);
                }

                resolve(change);
            });
        });
    }

    public getChangeObject(closeEditor: boolean): Observable<IEditorChangeEvent> {
        if (!this.editor) {
            return Observable.of(undefined);
        }

        let rowModel = this.rowModel;
        let field = this.column.get('field');
        let value = this.editor.instance.getValue();
        let valueObservable;

        if (closeEditor) {
            this.close();
        }

        if (value && value.then && typeof value.then === 'function') {
            // Value is a promise
            valueObservable =  Observable.fromPromise(value);
        } else if (value && value.subscribe && typeof value.subscribe === 'function') {
            // Value is an observable
            valueObservable = value;
        } else {
            valueObservable = Observable.of(value);
        }

        return valueObservable.switchMap((res) => {
            if (res === undefined) {
                return Observable.of(undefined);
            }

            // If newValue is a plain object, convert it to Immutable
            if (typeof res === 'object' && !Immutable.Map.isMap(res)) {
                res = Immutable.fromJS(res);
            }

            let newRowModel = rowModel.set(field, res);
            newRowModel = newRowModel.set('_isEmpty', false);

            return Observable.of({
                rowModel: newRowModel,
                field: field,
                newValue: res
            });
        });
    }

    private close() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = undefined;
        }

        this.isOpen = false;
        this.cdr.markForCheck();
    }

    public checkForClickOutside(event) {
        if (!this.isOpen) {
            return;
        }

        if (event.target.tagName !== 'TABLE' && event.target.tagName !== 'TD' && !this.el.nativeElement.contains(event.target)) {
            this.emitAndClose();
            this.close();
        }
    }

    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        const inputElement = this.editor.instance.inputElement.nativeElement;

        switch (key) {
            case 13:
                // Request copy from cell above if cell is empty and unchanged
                if (!this.initValue && this.editor.instance.getValue() === undefined) {
                    if (this.columnType === UniTableColumnType.Select) {
                        let value = this.editor.instance.getValue();
                        if (!value || (typeof value === 'string' && !value.length)) {
                            this.copyFromAbove.emit(true);
                            this.close();
                        }
                    } else if (!this.inputControl.dirty) {
                        this.copyFromAbove.emit(true);
                        this.close();
                    }
                }
            break;
            case 27:
                this.close();
            break;
            // Prevent up/down navigation on expanded editors
            case 38:
            case 40:
                if (this.editor.instance.expanded) {
                    event.stopPropagation();
                }
            break;
            // Prevent left navigation unless we're at start of string
            case 36:
            case 37:
                if (!this.canMoveLeft(inputElement)) {
                    event.stopPropagation();
                }
            break;
            // Prevent right navigation unless we're at end of string
            case 35:
            case 39:
                if (!this.canMoveRight(inputElement)) {
                    event.stopPropagation();
                }
            break;
        }
    }

    private canMoveLeft(inputElement): boolean {
        if (this.columnType === UniTableColumnType.Select) {
            return true;
        }
        return (inputElement.selectionStart === inputElement.selectionEnd
               && inputElement.selectionStart === 0);
    }

    private canMoveRight(inputElement): boolean {
        if (this.columnType === UniTableColumnType.Select) {
            return true;
        }
        return (inputElement.selectionStart === inputElement.selectionEnd
                && inputElement.selectionStart === inputElement.value.length);
    }
}
