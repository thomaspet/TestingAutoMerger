import {
    Component, EventEmitter, Input, Output, HostBinding, ViewChildren, QueryList, ElementRef,
    ChangeDetectorRef, SimpleChanges, OnChanges, OnInit
} from '@angular/core';
import {UniComponentLayout, UniFieldLayout} from '../interfaces/index';
import {UniFormError} from '@uni-framework/ui/uniform';
import {UniField} from '../unifield/unifield';
import {UniSection} from '../unisection/unisection';
import {Observable} from 'rxjs';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import {KeyCodes} from '../../../../app/services/common/keyCodes';
import * as _ from 'lodash';
import {FeaturePermissionService} from '@app/featurePermissionService';

@Component({
    selector: 'uni-form',
    templateUrl: './uniform.html'
})
export class UniForm implements OnChanges, OnInit {

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
    @Output() public errorEvent: EventEmitter<Object> = new EventEmitter<Object>(true);

    @ViewChildren(UniSection) public sectionElements: QueryList<UniSection>;

    public _layout: UniComponentLayout;
    public _model: any;
    public _config: any;

    public readyFields: number;
    public hidden: boolean = false;
    public currentComponent: UniField;
    public lastLayout: UniComponentLayout = null;
    public errorList: {[id: string]: UniFormError[]} = {};
    public propertyKeys: any = Object.keys;
    public valid = true;

    @HostBinding('hidden')
    public get Hidden() {
        return this.hidden;
    }

    public set Hidden(value: boolean) {
        this.hidden = value;
    }

    constructor(
        public elementRef: ElementRef,
        public changeDetector: ChangeDetectorRef,
        private featurePermissionService: FeaturePermissionService,
    ) {}

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
            this.changesFields(<any> this.fields);
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
                this.changesFields(<any> this.fields);
                this.changeDetector.markForCheck();
            } else {
                this.fields.subscribe(fields => {
                    this.changesFields(fields);
                    this.changeDetector.markForCheck();
                });
            }
        }
        this.addSectionEvents();
    }

    public changesFields(fields: UniFieldLayout[]) {
        const sectionMap = {};
        fields.forEach(field => {
            const sectionIndex = field.Section || 0;
            if (!sectionMap[sectionIndex]) {
                sectionMap[sectionIndex] = [];
            }

            sectionMap[sectionIndex].push(field);
        });

        const sections = Object.keys(sectionMap)
            .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
            .map(key => sectionMap[key]);

        const filteredFields = [];

        sections.forEach(section => {
            // const fieldWithSectionHeader = section.find(field => field.Sectionheader);

            const fieldsWithoutFieldset = [];
            let fieldSets = [];

            section.forEach(field => {
                // Add section header to all fields in case the filtering later
                // removed the field containing the section header.
                // field.Sectionheader = fieldWithSectionHeader?.Sectionheader;

                if (field.FieldSet) {
                    if (!fieldSets[field.FieldSet]) {
                        fieldSets[field.FieldSet] = [];
                    }

                    fieldSets[field.FieldSet].push(field);
                } else {
                    fieldsWithoutFieldset.push(field);
                }
            });

            filteredFields.push(...fieldsWithoutFieldset.filter(field => this.featurePermissionService.canShowFormField(field)));

            fieldSets = fieldSets.map(fieldSet => {
                const fieldWithLegend = fieldSet.find(f => f.Legend);
                fieldSet.forEach(field => field.Legend = fieldWithLegend?.Legend);
                return fieldSet.filter(field => this.featurePermissionService.canShowFormField(field));
            });

            // Remove empty fieldsets, update fieldset indexes, and finally
            // push the fields back into a one dimensional field array.
            fieldSets.filter(fieldSet => fieldSet.length > 0);
            fieldSets.forEach((fieldset, index) => {
                fieldset.forEach(field => {
                    field.FieldSet = index;
                    filteredFields.push(field);
                });
            });
        });

        if (!this._layout) {
            this._layout = new UniComponentLayout();
            this._layout.Fields = _.cloneDeep(filteredFields);
            this.lastLayout = this._layout;
        } else {
            filteredFields.forEach((item, index) => {
                if (!_.isEqual(item, this.lastLayout.Fields[index])) {
                    this._layout.Fields[index] = _.cloneDeep(item);
                }
            });

            this.lastLayout = _.cloneDeep(this._layout);
        }
        setTimeout(() => {
            if (this.currentComponent) {
                this.currentComponent = this.field(this.currentComponent.field.Property, this.currentComponent.field.Label);
                if (this.currentComponent) {
                    this.currentComponent.focus();
                } else {
                    this.focusFirstElement();
                }
            }
        });
    }

    public changesLayout(layout) {
        this._layout = _.cloneDeep(layout);
        setTimeout(() => {
            if (this.currentComponent) {
                setTimeout(() => {
                    this.currentComponent = this.field(this.currentComponent.field.Property, this.currentComponent.field.Label);
                    if (this.currentComponent) {
                        this.currentComponent.focus();
                    } else {
                        this.focusFirstElement();
                    }
                }, 200);
            }
        });
    }

    public updateField(name: string, field: any) {
        let indexToUpdate: number;
        const fieldToUpdate = this._layout.Fields.find((item: UniFieldLayout, index: number) => {
            if (item.Property === name) {
                indexToUpdate = index;
                return true;
            }
            return false;
        });
        if (fieldToUpdate) {
           this._layout.Fields[indexToUpdate] = _.cloneDeep(_.assign({}, this._layout.Fields[indexToUpdate], field));
           this.lastLayout = _.cloneDeep(this._layout);
        } else {
            console.warn(`Uniform warning: there is no field with property: ${name}`);
        }
        return this;
    }

    public ngAfterViewInit() {
        this.readyFields = 0;
    }

    public onFocusHandler(event) {
        this.currentComponent = event;
        this.focusEvent.emit(event);
    }

    focus() {
        try {
            const field = this.findFirstNotHiddenComponent();
            if (field) {
                this.currentComponent = field;
                field.focus();
            }
        } catch (e) {}
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
        const sections = this.sectionElements.toArray();
        const all = [].concat(sections);
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
        let index = this._layout.Fields.findIndex(item => item.Property === field.Property && item.Label === field.Label);
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

        const component = this.field(property, nextField.Label);
        this.currentComponent = component;
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

    onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        if (key === KeyCodes.TAB && event.shiftKey) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    public onMoveBackward(action) {
        const field = action.field;
        const event = action.event;
        let index = this._layout.Fields.findIndex(item => item.Property === field.Property);
        if (index === 0) {
            this.moveOutEvent.emit({
                event: event,
                movingForward: false,
                movingBackward: true
            });
            return;
        }
        index = index - 1;
        let nextField = this._layout.Fields[index];
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

        const component = this.field(property, nextField.Label);
        this.currentComponent = component;
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

    public field(property: string, label?: string): UniField {
        const fieldLayout: UniFieldLayout = this._layout.Fields.find((f: UniFieldLayout) => {
            const labelCheck = !label ? true : label === f.Label;
            if (f.Options && (f.Options.storeResultInProperty || f.Options.storeIdInProperty)) {
                return (f.Options.storeResultInProperty === property || f.Options.storeIdInProperty === property) && labelCheck;
            }
            return f.Property === property && labelCheck;
        });
        if (fieldLayout) {
            const section: UniSection = this.section(fieldLayout.Section);
            if (section) {
                return section.field(property, label);
            }
        }
    }

    public justHasWarning(errorList) {
        let hasWarnings = false;
        let hasError = false;
        if (Array.isArray(errorList)) {
            for (const index in errorList) {
                if (!hasWarnings) {
                    hasWarnings = errorList[index].isWarning;
                }
                if (!hasError && !errorList[index].isWarning) {
                    hasError = true;
                }
            }
        }
        return hasWarnings && !hasError;

    }

    public onError(event) {
        this.valid = true;
        _.assign(this.errorList, event);
        for (const error in this.errorList) {
            if (this.errorList[error].length > 0 && !this.justHasWarning(this.errorList[error])) {
                this.valid = false;
            }
        }
        const eventWithValid = Object.assign({isFormValid: this.valid}, event || {});
        this.errorEvent.emit(eventWithValid);
    }

    public submit(event) {
        event.preventDefault();
        this.submitEvent.emit(this._model);
    }

    public findFirstNotHiddenComponent() {
        const f = this._layout.Fields.find(x => !x.Hidden);
        return this.field(f.Property, f.Label);
    }

    public addSectionEvents() {
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
                if (f) {
                    f.focus();
                }
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
    }

    public validateForm() {
        this.sectionElements.forEach((section: UniSection) => {
            section.fieldElements.forEach((field: UniField) => {
                if (field.touched) {
                    const value = _.get(field.model, field.field.Property);
                    field.validateModel(value);
                }
            });
        });
    }

    public forceValidation() {
        this.sectionElements.forEach((section: UniSection) => {
            section.fieldElements.forEach((field: UniField) => {
                const value = _.get(field.model, field.field.Property);
                field.validateModel(value);
            });
        });
    }
}
