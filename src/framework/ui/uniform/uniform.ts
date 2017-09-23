import {
    Component, EventEmitter, Input, Output, HostBinding, ViewChildren, QueryList, ElementRef,
    ChangeDetectorRef, Pipe, PipeTransform, SimpleChanges
} from '@angular/core';
import {UniComponentLayout, UniFieldLayout} from './interfaces';
import {UniField} from './unifield';
import {UniSection} from './unisection';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import * as _ from 'lodash';
import {KeyCodes} from '../../../app/services/common/keyCodes';

@Pipe({
    name: 'sectionIndexes',
    pure: false
})
export class SectionIndexesPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[]): number[] {
        let indexes: number[] = [];
        fields.forEach((f: UniFieldLayout) => {
            if (indexes.indexOf(f.Section) === -1) {
                indexes.push(f.Section);
            }
        });
        return indexes;
    }
}
@Pipe({
    name: 'bySection',
    pure: false
})
export class BySectionPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[], section: number): UniFieldLayout[] {
        let filteredFields: UniFieldLayout[] = [];
        fields.forEach((f: UniFieldLayout) => {
            if (f.Section === section) {
                filteredFields.push(f);
            }
        });
        return filteredFields;
    }
}
/**
 * Form component that wraps form elements
 */
@Component({
    selector: 'uni-form',
    template: `
        <form (submit)="submit($event)" autocomplete="off">
            <ng-template ngFor let-item [ngForOf]="_layout?.Fields | sectionIndexes" let-i="index">
                <uni-section
                    [fields]="_layout?.Fields | bySection:item"
                    [model]="_model"
                    [formConfig]="_config"
                    (readyEvent)="onReadyHandler($event)"
                    (changeEvent)="onChangeHandler($event)"
                    (inputEvent)="onInputHandler($event)"
                    (toggleEvent)="onToggleHandler($event)"
                    (focusEvent)="onFocusHandler($event)"
                    (moveForwardEvent)="onMoveForward($event)"
                    (moveBackwardEvent)="onMoveBackward($event)"
                >
                </uni-section>
            </ng-template>
            <button *ngIf="_config?.submitText" type="submit" [disabled]="!controls?.valid">{{_config?.submitText}}</button>
        </form>
    `
})
export class UniForm {

    @Input() public config: any;
    @Input() public layout: Observable<UniComponentLayout>;
    @Input() public fields: Observable<UniFieldLayout[]>;
    @Input() public model: Observable<any>;

    @Output() public submitEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public readyEvent: EventEmitter<UniForm> = new EventEmitter<UniForm>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public toggleEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public focusEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public moveForwardEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public moveBackwardEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public moveOutEvent: EventEmitter<Object> = new EventEmitter<Object>(true);

    @ViewChildren(UniSection) public sectionElements: QueryList<UniSection>;

    private _layout: UniComponentLayout;
    private _model: any;
    private _config: any;

    private readyFields: number;
    private hidden: boolean = false;
    public currentComponent: UniField;
    public lastLayout: UniComponentLayout = null;

    @HostBinding('hidden')
    public get Hidden() {
        return this.hidden;
    }

    public set Hidden(value: boolean) {
        this.hidden = value;
    }

    constructor(
        private elementRef: ElementRef,
        public changeDetector: ChangeDetectorRef) {
    }
    public ngOnChanges() {
        if (this.config && !this.config.subscribe) {
            this._config = this.config;
        }
        if (this.model && !this.config.subscribe) {
            this._model = this.model;
        }
        if (this.layout && !this.layout.subscribe) {
            this.changesLayout(this.layout);
        }
        if (this.fields && !this.fields.subscribe) {
            this.changesFields(this.fields);
        }
    }
    public ngOnInit() {
        if (this.config) {
            if (!this.config.subscribe) {
                this._config = this.config;
            } else {
                this.config.subscribe(config => {
                    this._config = _.cloneDeep(config);
                    this.changeDetector.markForCheck();
                });
            }
        }
        if (this.model) {
            if (!this.model.subscribe) {
                this._model = this.model;
            } else {
                this.model.subscribe(model => {
                    const currentModel = _.cloneDeep(model);
                    this._model = currentModel;
                    setTimeout(() => {
                        this._model = model;
                    });
                });
            }
        }
        if (this.layout) {
            if (!this.layout.subscribe) {
                this.changesLayout(this.layout);
                this.changeDetector.markForCheck();
            } else {
                this.layout.subscribe(layout => {
                    this.changesLayout(layout);
                    this.changeDetector.markForCheck();
                });
            }
        }
        if (this.fields) {
            if (!this.fields.subscribe) {
                this.changesFields(this.fields);
                this.changeDetector.markForCheck();
            } else {
                this.fields.subscribe(fields => {
                    this.changesFields(fields);
                    this.changeDetector.markForCheck();
                });
            }
        }
        this.addSectionEvents();
        this.addNavigationEvents();
    }

    private changesFields(fields) {
        if (!this._layout) {
            this._layout = new UniComponentLayout();
            this._layout.Fields = _.cloneDeep(fields);
            this.lastLayout = this._layout;
        } else {
            _.forEach(fields, (item, index) => {
                if (!_.isEqual(item, this.lastLayout.Fields[index])) {
                    this._layout.Fields[index] = _.cloneDeep(item);
                }
            });
            this.lastLayout = _.cloneDeep(this.lastLayout);
        }
        setTimeout(() => {
            if (this.currentComponent) {
                this.currentComponent = this.field(this.currentComponent.field.Property);
                if (this.currentComponent) {
                    this.currentComponent.focus();
                } else {
                    this.focusFirstElement();
                }
            }
        });
    }

    private changesLayout(layout) {
        this._layout = _.cloneDeep(layout);
        setTimeout(() => {
            if (this.currentComponent) {
                setTimeout(() => {
                    this.currentComponent = this.field(this.currentComponent.field.Property);
                    if (this.currentComponent) {
                        this.currentComponent.focus();
                    } else {
                        this.focusFirstElement();
                    }
                }, 200);
            }
        });
    }

    public ngAfterViewInit() {
        this.readyFields = 0;
    }

    public onFocusHandler(event) {
        this.currentComponent = event;
        this.focusEvent.emit(event);
    }

    public focusFirstElement() {
        if (this._config && !this._config.autofocus) {
            return;
        }
        if (!this._layout.Fields || this._layout.Fields.length <= 0) {
            return;
        }
        if (this.currentComponent) {
            return;
        }
        const f: UniField = this.findFirstNotHiddenComponent();
        if (f) {
            this.currentComponent = f;
            setTimeout(() => f.focus());
        }
    }

    public onReadyHandler(item: UniSection) {
        this.readyFields++;
        if (this.readyFields === this.countElements()) {
            this.readyEvent.emit(this);
            this.focusFirstElement();
        }
    }

    public countElements() {
        let sections = this.sectionElements.toArray();
        let all = [].concat(sections);
        return all.length;
    }

    public onChangeHandler(model: any) {
        this.changeEvent.emit(model);
    }

    public onInputHandler(model: any) {
        this.inputEvent.emit(model);
    }

    public onToggleHandler(section: any) {
        this.toggleEvent.emit(section);
    }

    public readMode() {
        this.sectionElements.forEach((section: UniSection) => {
            section.readMode();
        });
    }

    public onMoveForward(action) {
        const field = action.field;
        const event = action.event;
        let index = this._layout.Fields.indexOf(field);
        if (index === this._layout.Fields.length - 1) {
            this.moveOutEvent.emit({
                event: event,
                movingForward: true,
                movingBackward: false
            });
            return;
        }
        index = index + 1;
        let nextField = this._layout.Fields[index];
        while (nextField.Hidden === true) {
            index = index + 1;
            if (index >= this._layout.Fields.length) {
                this.moveOutEvent.emit({
                    event: event,
                    movingForward: true,
                    movingBackward: false
                });
                return;
            }
            nextField = this._layout.Fields[index];
        }
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // hack to get correct property in multivalue
        let property = nextField.Property;
        let isMultivalue = false;
        if (nextField.Options && nextField.Options.storeResultInProperty) {
            property = nextField.Options.storeResultInProperty;
            isMultivalue = true;
        }

        const component = this.field(property, isMultivalue);
        if (field.Section !== nextField.Section) {
            const section = this.section(nextField.Section);
            if (!section.isOpen) {
                section.toggle();
            }
            // wait for section to open;
            setTimeout(() => {
                component.focus();
            }, 200);
        } else {
            component.focus();
        }
        this.moveForwardEvent.emit({
            event: event,
            prev: field,
            next: nextField
        });
    }

    public onMoveBackward(action) {
        const field = action.field;
        const event = action.event;
        let index = this._layout.Fields.indexOf(field);
        if (index === 0) {
            this.moveOutEvent.emit({
                event: event,
                movingForward: false,
                movingBackward: true
            });
            return;
        }
        index = index - 1;
        let nextField = this._layout.Fields[index - 1];
        while (nextField.Hidden === true) {
            index = index - 1;
            if (index < 0) {
                this.moveOutEvent.emit({
                    event: event,
                    movingForward: false,
                    movingBackward: true
                });
                return;
            }
            nextField = this._layout.Fields[index - 1];
        }
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // hack to get correct property in multivalue
        let property = nextField.Property;
        let isMultivalue = false;
        if (nextField.Options && nextField.Options.storeResultInProperty) {
            property = nextField.Options.storeResultInProperty;
            isMultivalue = true;
        }

        const component = this.field(property, isMultivalue);
        if (field.Section !== nextField.Section) {
            const section = this.section(nextField.Section);
            if (!section.isOpen) {
                section.toggle();
            }
            // wait for section to open;
            setTimeout(() => {
                component.focus();
            }, 200);
        } else {
            component.focus();
        }
        this.moveBackwardEvent.emit({
            event: event,
            prev: field,
            next: nextField
        });
    }

    public editMode() {
        this.sectionElements.forEach((section: UniSection) => {
            section.editMode();
        });
    }

    public section(id: number): UniSection {
        const section: UniSection = this.sectionElements.find((s: UniSection) => {
                return s.sectionId === id;
        });
        return section;

    }

    public field(property: string, isMultivalue?: boolean): UniField {
        const fieldLayout: UniFieldLayout = this._layout.Fields.find((f: UniFieldLayout) => {
                if (isMultivalue) {
                    if (f.Options && f.Options.storeResultInProperty) {
                        return f.Options.storeResultInProperty === property;
                    }
                }
                return f.Property === property;
        });
        if (fieldLayout) {
            const section: UniSection = this.section(fieldLayout.Section);
            if (section) {
                return section.field(property, isMultivalue);
            }
        }
    }

    private submit(event) {
        event.preventDefault();
        this.submitEvent.emit(this._model);
    }

    private findFirstNotHiddenComponent() {
        const f = this._layout.Fields.find(x => !x.Hidden);
        return this.field(f.Property);
    }

    private addNavigationEvents() {
        /*const target = this.elementRef.nativeElement;
        const enterEvent = Observable.fromEvent(target, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ENTER)
            .filter((event: KeyboardEvent) => !this.hasEvent('enter'));
        const tabEvent = Observable.fromEvent(target, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === KeyCodes.TAB && !event.shiftKey)
            .filter((event: KeyboardEvent) => !this.hasEvent('tab'));

        const tabAndEnterEvent = Observable.merge(enterEvent, tabEvent);
        tabAndEnterEvent.subscribe((event: KeyboardEvent) => {
            const field: UniField = this.findNextElementFormLastFocusedComponent();
            if (field) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (field && field.field.Section > 0) {
                const section = this.section(field.field.Section)
                if (!section.isOpen) {
                    section.toggle();
                }
                // wait for section to open;
                setTimeout(() => {
                    field.focus();
                }, 200);
            } else {
                if (field) {
                    field.focus();
                }
            }
        });*/
    }

    private hasEvent(event: string) {
        const cmp = this.currentComponent;
        if (!cmp.field.Options) {
            return false;
        }
        const options = cmp.field.Options;
        if (options.events) {
            if (options.events[event]) {
                return true;
            }
        }
        return false;
    }

    private findNextElementFormLastFocusedComponent() {
        const cmp: UniField = this.currentComponent;
        let index = this._layout.Fields.indexOf(cmp.field);
        if (index < 0) {
            return;
        }
        while (this._layout.Fields[index + 1] && this._layout.Fields[index + 1].Hidden) {
            index++;
        }
        if (index >= this._layout.Fields.length - 1) {
            return;
        }
        return this.field(this._layout.Fields[index + 1].Property);
    }

    private addSectionEvents() {
        const target = this.elementRef.nativeElement;
        const keyUpEvent = Observable.fromEvent(target, 'keydown');
        const ctrlEvent = keyUpEvent.filter((event: KeyboardEvent) => {
            return event.shiftKey;
        });
        const ctrlArrow = ctrlEvent.filter((event: KeyboardEvent) => {
            return event.keyCode === KeyCodes.UP_ARROW || event.keyCode === KeyCodes.DOWN_ARROW;
        });

        ctrlArrow.subscribe((event: KeyboardEvent) => {
            event.preventDefault();
            event.stopPropagation();

            let nextSectionID: number;
            const cmp: UniField = this.currentComponent;
            if (event.keyCode === KeyCodes.UP_ARROW) {
                nextSectionID = cmp.field.Section - 1;
            } else {
                nextSectionID = cmp.field.Section + 1;
            }
            if (!nextSectionID) {
                const f: UniField = this.field(this._layout.Fields[0].Property);
                f.focus();
                return;
            }
            const section: UniSection = this.section(nextSectionID);
            if (!section) {
                return;
            }
            const fieldData = section.fields[0];
            if (!section.isOpen) {
                section.toggle();
            }
            const field: UniField = section.field(fieldData.Property);
            // we need some time to open the section
            setTimeout(() => field.focus());
        });
    };
}
