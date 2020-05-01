import {
    Component, Input, Output, HostBinding, EventEmitter, QueryList, ViewChildren, ChangeDetectorRef,
    ChangeDetectionStrategy, SimpleChange, SimpleChanges,
} from '@angular/core';
import {UniFieldLayout} from '../interfaces';
import {UniField} from '../unifield/unifield';

@Component({
    selector: 'uni-section',
    templateUrl: './unisection.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSection {
    @Input() public fields: UniFieldLayout[];
    @Input() public model: any;
    @Input() public formConfig: any;

    @Output() public readyEvent: EventEmitter<UniSection> = new EventEmitter<UniSection>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public toggleEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public focusEvent: EventEmitter<UniSection> = new EventEmitter<UniSection>(true);
    @Output() public moveForwardEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public errorEvent: EventEmitter<Object> = new EventEmitter<Object>(true);

    @ViewChildren(UniField) public fieldElements: QueryList<UniField>;

    public sectionId: number;
    public isOpen: boolean = false;

    public groupedFields: any;
    public config: any = {};
    private readyFields: number;
    private hidden: boolean = false;

    @HostBinding('hidden') public get Hidden() { return this.hidden; }

    public set Hidden(value: boolean) {
        this.hidden = value;
        this.cd.markForCheck();
    }

    constructor(private cd: ChangeDetectorRef) { }

    public toggle() {
        this.isOpen = !this.isOpen;
        this.formConfig.sections[this.sectionId].isOpen = this.isOpen;
        this.cd.markForCheck();
        this.toggleEvent.emit({sectionId: this.sectionId, isOpen: this.isOpen});
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['fields']) {
            if (this.fields && this.fields.length > 0) {
                this.sectionId = this.fields[0].Section;
                this.config.Sectionheader = this.fields[0].Sectionheader;
                if (this.formConfig) {
                    if (!this.formConfig.sections) {
                        this.formConfig.sections = {};
                    }
                    if (!this.formConfig.sections[this.sectionId]) {
                        this.formConfig.sections[this.sectionId] = {
                            isOpen: (this.sectionId === 0 || !this.sectionId)
                        };

                    }
                    this.isOpen = this.formConfig.sections[this.sectionId].isOpen;
                }

            }
            this.groupedFields = this.fields;
        }
    }

    public ngAfterViewInit() {
        this.readyFields = 0;
    }

    public onReadyHandler(item: UniField) {
        this.readyFields++;
        if (this.readyFields === this.countElements()) {
            this.readyEvent.emit(this);
        }
    }

    public onFocusHandler(event) {
        this.focusEvent.emit(event);
    }

    public countElements() {
        let fields = this.fieldElements.toArray();
        let all = [].concat(fields);

        return all.length;
    }

    public onChangeHandler(model: any) {
        this.changeEvent.emit(model);
    }

    public onInputHandler(model: any) {
        this.inputEvent.emit(model);
    }

    public readMode() {
        this.fieldElements.forEach((f: UniField) => f.readMode());
        this.cd.markForCheck();
    }

    public editMode() {
        this.fieldElements.forEach((f: UniField) => f.editMode());
        this.cd.markForCheck();
    }

    public field(property: string, label?: string): UniField {
        return this.fieldElements.find((field: UniField) => {
            const labelCheck = !label ? true : label === field.field.Label;
            if (field.field.Options && (field.field.Options.storeResultInProperty || field.field.Options.storeIdInProperty)) {
                return (field.field.Options.storeResultInProperty === property || field.field.Options.storeIdInProperty === property) && labelCheck;
            }
            return field.field.Property === property && labelCheck;
        });
    }

    public onError(event) {
        this.errorEvent.emit(event);
    }

    public hasLineBreak(item: UniFieldLayout) {
        return item.LineBreak;
    }
}
