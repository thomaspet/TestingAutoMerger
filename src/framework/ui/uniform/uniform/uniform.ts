import {
    Component, EventEmitter, Input, Output, HostBinding, ViewChildren, QueryList, ElementRef,
    ChangeDetectorRef, SimpleChanges, OnChanges, OnInit
} from '@angular/core';
import {UniComponentLayout, UniFieldLayout} from '../interfaces/index';
import {UniFormError} from '@uni-framework/ui/uniform';
import {UniField} from '../unifield/unifield';
import {UniSection} from '../unisection/unisection';
import {Observable} from 'rxjs';
import {KeyCodes} from '../../../../app/services/common/keyCodes';
import * as _ from 'lodash';
import {FeaturePermissionService} from '@app/featurePermissionService';

@Component({
    selector: 'uni-form',
    templateUrl: './uniform.html'
})
export class UniForm implements OnChanges, OnInit {

    @Input() config: any;
    @Input() layout: Observable<UniComponentLayout>;
    @Input() fields: Observable<UniFieldLayout[]>;
    @Input() model: Observable<any>;

    @Output() submitEvent = new EventEmitter<Object>(true);
    @Output() readyEvent = new EventEmitter<UniForm>(true);
    @Output() changeEvent = new EventEmitter<SimpleChanges>();
    @Output() inputEvent = new EventEmitter<SimpleChanges>();
    @Output() toggleEvent = new EventEmitter<Object>(true);
    @Output() focusEvent = new EventEmitter<UniField>(true);
    @Output() errorEvent = new EventEmitter<Object>(true);

    @ViewChildren(UniSection) sectionElements: QueryList<UniSection>;

    public _layout: UniComponentLayout;
    public _model: any;
    public _config: any;

    public readyFields: number;
    public hidden: boolean = false;
    public activeFieldComponent: UniField;
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
    }

    public changesLayout(layout) {
        this._layout = _.cloneDeep(layout);
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

    public onFocusHandler(field: UniField) {
        this.activeFieldComponent = field;
        this.focusEvent.emit(field);
    }

    focus() {
        try {
            const field = this.findFirstNotHiddenComponent();
            if (field) {
                this.activeFieldComponent = field;
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
        if (this.activeFieldComponent) {
            return;
        }

        const field = this.findFirstNotHiddenComponent();
        if (field) {
            this.activeFieldComponent = field;
            setTimeout(() => field.focus());
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

    onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        // Jump to next/prev section on page up/down
        if (key === KeyCodes.PAGE_DOWN || key === KeyCodes.PAGE_UP) {
            event.preventDefault();
            event.stopPropagation();

            const currentSectionIndex = this.activeFieldComponent?.field?.Section || 0;
            const nextSectionIndex = key === KeyCodes.PAGE_DOWN ? currentSectionIndex + 1 : currentSectionIndex - 1;

            const section = this.section(nextSectionIndex);
            if (section) {
                if (!section.isOpen) {
                    section.toggle();
                }

                setTimeout(() => {
                    const property = section.fields[0] && section.fields[0].Property;
                    section.field(property)?.focus();
                });
            } else {
                const field = this.field(this._layout.Fields[0].Property);
                field?.focus();
            }
        }
    }

    public goToNextField(action) {
        const field = action.field;
        let index = this._layout.Fields.findIndex(item => item.Property === field.Property && item.Label === field.Label);
        if (index === this._layout.Fields.length - 1) {
            return;
        }
        index = index + 1;
        let nextField = this._layout.Fields[index];
        while (nextField.Hidden === true) {
            index = index + 1;
            if (index >= this._layout.Fields.length) {
                return;
            }
            nextField = this._layout.Fields[index];
        }

        let fieldProperty = nextField.Property;

        // For multivalue fields we need to lookup on storeResultInProperty instead /shrug
        if (nextField.Options && nextField.Options.storeResultInProperty) {
            fieldProperty = nextField.Options.storeResultInProperty;
        }

        const fieldComponent = this.field(fieldProperty, nextField.Label);
        this.activeFieldComponent = fieldComponent;
        if (field.Section !== nextField.Section) {
            const section = this.section(nextField.Section);
            if (section && !section.isOpen) {
                section.toggle();
            }

            setTimeout(() => fieldComponent?.focus());
        } else {
            fieldComponent?.focus();
        }
    }

    public editMode() {
        this.sectionElements.forEach((section: UniSection) => {
            section.editMode();
        });
    }

    public section(id: number): UniSection {
        return this.sectionElements.find((s => s.sectionId === id));
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
