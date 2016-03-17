import {Component, ComponentRef, ViewChild} from 'angular2/core';
import {UniHttp} from '../../../../framework/core/http/http';
import {Operator} from '../../../unientities';
import {OperationType} from '../../../unientities';
import {ValidationLevel} from '../../../unientities';
import {EmployeeModel} from '../../../models/employee';
import {UniFormBuilder} from '../../../../framework/forms/builders/uniFormBuilder';
import {UniFormLayoutBuilder} from '../../../../framework/forms/builders/uniFormLayoutBuilder';
import {UniForm} from '../../../../framework/forms/uniForm';
import {UniComponentLoader} from '../../../../framework/core/componentLoader';
import {EmployeeService} from '../../../services/Salary/Employee/EmployeeService';
import {Employee} from '../../../unientities';
import {UniFieldBuilder} from '../../../../framework/forms/builders/uniFieldBuilder';
import {ComponentLayout} from '../../../unientities';
import {UniElementFinder} from "../../../../framework/forms/shared/UniElementFinder";
import {UniSectionBuilder} from "../../../../framework/forms/builders/uniSectionBuilder";
import {UniTextInput} from "../../../../framework/controls/text/text";
import {UNI_CONTROL_DIRECTIVES} from "../../../../framework/controls";
import {FieldType} from "../../../unientities";

@Component({
    selector: 'uni-form-demo',
    directives: [UniComponentLoader],
    providers: [EmployeeService],
    template: `
        <div class='application usertest'>
            <uni-component-loader></uni-component-loader>
        </div>
    `
})
export class UniFormDemo {

    private Model:EmployeeModel;
    private FormConfig:UniFormBuilder;

    @ViewChild(UniComponentLoader)
    UniCmpLoader:UniComponentLoader;

    private email = [
        {
            id: 1,
            value: "audhild@unimicro.no",
            main: false,

        },
        {
            id: 2,
            value: "audhild.grieg@gmail.com",
            main: true
        },
        {
            id: 3,
            value: "nsync4eva@hotmail.com",
            main: false
        }
    ];

    constructor(private Http:UniHttp,
                private Api:EmployeeService) {
        this.Api.setRelativeUrl('employees');
    }

    ngOnInit() {
        var self = this;
        this.Api.GetLayoutAndEntity('EmployeePersonalDetailsForm', 1).subscribe((results:any[]) => {
            var view:ComponentLayout = results[0];
            var model:Employee = results[1];
            self.startApp(view, model);
        });
    }


    // private methods
    private startApp(view:any, model:Employee) {
        // We can extend layout before form config creation
        view = this.extendLayoutConfig(view);

        this.createModel(model);
        this.buildFormConfig(view, model);

        // We can extend the form config after the LayoutBuilder has created the layout
        this.extendFormConfig();
        this.addMultiValue();

        this.loadForm();
    }

    private loadForm() {
        var self = this;
        return this.UniCmpLoader.load(UniForm).then((cmp:ComponentRef) => {
            cmp.instance.config = self.FormConfig;
            cmp.instance.getEventEmitter().subscribe(self.submit(self));
        });
    }

    private buildFormConfig(layout:ComponentLayout, model:Employee) {
        console.log(layout);
        this.FormConfig = new UniFormLayoutBuilder().build(layout, model);
    }

    private createModel(model:Employee) {
        this.Model = EmployeeModel.createFromObject(model);
    }

    private addMultiValue() {
        var field = new UniFieldBuilder();
        field
            .setLabel("Epostadresser")
            .setType(UNI_CONTROL_DIRECTIVES[14])
     /*       .setKendoOptions({
                dataTextField: 'Name',
                dataValueField: 'ID',
                dataSource: [
                    {ID: 150101, Name: "Telefon"},
                    {ID: 150102, Name: "Mobil" },
                    {ID: 150103, Name: "Fax"}
                ]
            })*/
        //    .control
         
        this.FormConfig.addUniElement(field);
    }

    private extendFormConfig() {
        var field:UniFieldBuilder = this.FormConfig.find('Sex');
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
        field = this.FormConfig.find('SocialSecurityNumber');
        field.setKendoOptions({
            mask: '000000 00000',
            promptChar: '_'
        });

        var section = UniElementFinder.findUniSection(1, this.FormConfig.fields);
        var newSection = new UniSectionBuilder();
        newSection.legend = 'New Section';
        var elem = new UniFieldBuilder();
        elem.fieldType = UniTextInput;
        elem.setModel(this.Model).setModelField('Name').setLabel('New Field');
        newSection.addUniElement(elem);
        section.addUniElement(newSection);
    }

    private extendLayoutConfig(layout:any) {
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

    private submit(context:UniFormDemo) {
        return () => {
            context.Api.Post(context.Model).subscribe((result:any) => {
                alert(JSON.stringify(result));
            });
        };
    }
}