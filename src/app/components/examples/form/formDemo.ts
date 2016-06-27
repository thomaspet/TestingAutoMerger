import {Component, ComponentRef, ViewChild, HostBinding} from "@angular/core";
import {
    Operator,
    OperationType,
    ValidationLevel,
    Employee,
    ComponentLayout,
    BusinessRelation,
    Phone
} from "../../../unientities";
import {EmployeeModel} from "../../../models/employee";
import {UniFormBuilder} from "../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniForm} from "../../../../framework/forms/uniForm";
import {UniComponentLoader} from "../../../../framework/core/componentLoader";
import {EmployeeService} from "../../../services/Salary/Employee/EmployeeService";
import {UniFieldBuilder} from "../../../../framework/forms/builders/uniFieldBuilder";
import {UniElementFinder} from "../../../../framework/forms/shared/UniElementFinder";
import {UniSectionBuilder} from "../../../../framework/forms/builders/uniSectionBuilder";
import {UniTextInput} from "../../../../framework/controls/text/text";
import {UNI_CONTROL_DIRECTIVES} from "../../../../framework/controls";
import {PhoneModal} from "../../common/modals/modals";
import {BusinessRelationService, PhoneService} from "../../../services/services";
import {UniState} from "../../../../framework/core/UniState";
import {Observable} from 'rxjs/Observable';
import {UniAutocompleteConfig} from "../../../../framework/controls/autocomplete/autocomplete";

declare var _;

@Component({
    selector: 'uni-form-demo',
    directives: [UniComponentLoader, PhoneModal],
    providers: [EmployeeService, BusinessRelationService, PhoneService],
    template: `
        <uni-component-loader></uni-component-loader>
    `
})
export class UniFormDemo {
    @HostBinding('attr.aria-busy')
    get busy() { return !this.FormIsReady};
    private FormIsReady = false;
    private Model: EmployeeModel;
    private CurrentState: any;
    private LastFormValue: any;
    private BusinessModel: BusinessRelation;
    private FormConfig: UniFormBuilder;
    private EmptyPhone: Phone;

    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;

    constructor(private Api: EmployeeService,
                private businessRelationService: BusinessRelationService,
                private phoneService: PhoneService,
                private state: UniState) {

        this.CurrentState = this.state.getState();

        if(this.CurrentState) {
            this.LastFormValue = this.CurrentState.form;
            this.FormConfig = this.CurrentState.config;
        }

        this.Api.setRelativeUrl('employees');
        this.createPhoneModel();
    }

    public buildState() {
        var component: UniForm = this.UniCmpLoader.component;
        return {
            form: component.form.value,
            config: component.config
        };
    }

    public ngAfterViewInit() {
        var self = this;
        this.Api.GetLayoutAndEntity('EmployeePersonalDetailsForm', 1).subscribe((results: any[]) => {
            var view: ComponentLayout = results[0];
            var model: Employee = results[1];

            self.startApp(view, model);
        });
    }

    public ngOnDestroy() {
        this.state.saveState(this.buildState());
    }

    // private methods
    private startApp(view: any, model: Employee) {
        // We can extend layout before form config creation
        this.buildFormConfig(view, model);
        return this.loadForm();
    }

    private loadForm() {
        return this.UniCmpLoader.load(UniForm).then(((cmp: ComponentRef<any>) => {
            cmp.instance.config = this.FormConfig;
            cmp.instance.submit.subscribe(this.submit.bind(this));
            cmp.instance.ready.subscribe(((component: UniForm) => {
                component.Model  = this.Model;
                component.Value = this.LastFormValue;
                component.find('Sex').setFocus();
                component.find('BusinessRelationInfo.Name').change$.subscribe((item)=>console.log(item));
                this.FormIsReady = true;
            }).bind(this));
            return cmp;
        }).bind(this));
    }

    private buildFormConfig(layout: ComponentLayout, model: Employee) {
        layout = this.extendLayoutConfig(layout);
        this.createModel(model);
        this.FormConfig = this.FormConfig || new UniFormLayoutBuilder().build(layout, model);
        // We can extend the form config after the LayoutBuilder has created the layout
        this.extendFormConfig();
        //this.addMultiValue();
    }


    private createModel(model: Employee) {
        this.Model = EmployeeModel.createFromObject(model);
    }

    private createPhoneModel() {
        var self = this;
        this.businessRelationService.GetNewEntity().subscribe(bm => {
            this.BusinessModel = bm;
            this.BusinessModel.DefaultPhoneID = 1;
            this.BusinessModel.Phones = [];
            this.BusinessModel.Phones.push({
                ID: 1,
                CountryCode: 'NO',
                Number: '+4791334697',
                Description: 'privat mobiltelefon',
                Type: 150102,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null,
                BusinessRelationID: 1,
                StatusCode: 0
            });
            this.BusinessModel.Phones.push({
                ID: 2,
                CountryCode: 'NO',
                Number: '+4722222222',
                Description: 'fax',
                Type: 150103,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null,
                BusinessRelationID: 1,
                StatusCode: 0
            });
            this.phoneService.GetNewEntity().subscribe(phone => {
                self.EmptyPhone = phone;
            });
        });
    }

    private addMultiValue() {
        var field = new UniFieldBuilder();
        field
            .setLabel('Telefonnummer')
            .setType(UNI_CONTROL_DIRECTIVES[14])
            .setKendoOptions({
                dataTextField: 'Number',
                dataValueField: 'ID'
            })
            .setModel(this.BusinessModel)
            .setModelField('Phones')
            .setModelDefaultField('DefaultPhoneID')
            .setPlaceholder(this.EmptyPhone)
            .setEditor(PhoneModal);

        this.FormConfig.addUniElement(field);
    }

    private extendFormConfig() {
        var field: UniFieldBuilder = this.FormConfig.find('Sex');
        field.setKendoOptions({
            dataTextField: 'text',
            dataValueField: 'id',
            dataSource: [{
                'id': 1,
                'text': 'mann'
            }, {
                'id': 2,
                'text': 'kvinne'
            }]
        });

        var field2: UniFieldBuilder = this.FormConfig.find('SocialSecurityNumber');
        field2.setKendoOptions({
            mask: '000000 00000',
            promptChar: '_'
        })
        ;

        //////////////////////////////////
        // add section inside a section
        //////////////////////////////////
        var elem = new UniFieldBuilder();
        elem.fieldType = UniTextInput;
        elem
            .setModel(this.Model)
            .setModelField('Name')
            .setLabel('New Field');

        var newSection = new UniSectionBuilder();
        newSection.legend = 'New Section';
        newSection.addUniElement(elem);

        var section = UniElementFinder.findUniSection(1, this.FormConfig.fields);
        section.addUniElement(newSection);
        //////////////////////////////////
    }

    private extendLayoutConfig(layout: any) {
        layout.Fields[0].Validators = [{
            'EntityType': 'BusinessRelation',
            'PropertyName': 'Name',
            'Operator': Operator.Required,
            'Operation': OperationType.CreateAndUpdate, // not used now. Operation is applied in all levels
            'Level': ValidationLevel.Error, // not used now. All messages are errors
            'Value': null,
            'ErrorMessage': 'Employee name is required',
            'ID': 1,
            'Deleted': false
        }];

        //autocomplte
        layout.Fields[0].FieldType = 0;
        layout.Fields[0].kendoOptions = UniAutocompleteConfig.build({
            source: this.Api,
            valueKey: 'BusinessRelationInfo.Name',
            template: (obj:Employee) => `${obj.ID} - ${obj.BusinessRelationInfo.Name}`,
            minLength: 2,
            debounceTime: 300,
            //search: (query:string) => Observable.fromArray([{ID:1,BusinessRelationInfo: { Name: "Jorge"}}])
        });
        layout.Fields[1].Validators = [{
            'EntityType': 'Employee',
            'PropertyName': 'SocialSecurityNumber',
            'Operator': Operator.RegExp,
            'Operation': OperationType.CreateAndUpdate, // not used now. Operation is applied in all levels
            'Level': ValidationLevel.Error, // not used now. All messages are errors
            'Value': '^[0-9]{11}$',
            'ErrorMessage': 'Employee fødselsnummer should have 11 numbers',
            'ID': 1,
            'Deleted': false
        }];
        return layout;
    }

    private submit() {
        console.log(this,"Submit");
        //this.Api.Post(this.Model).subscribe((result: any) => {
        //    alert(JSON.stringify(result));
        //});
    }
}
