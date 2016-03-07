import {Component, ComponentRef, ViewChild} from 'angular2/core';
import {UniHttp} from '../../../../framework/core/http/http';
import {Operator} from '../../../../framework/interfaces/interfaces';
import {OperationType} from '../../../../framework/interfaces/interfaces';
import {ValidationLevel} from '../../../../framework/interfaces/interfaces';
import {EmployeeModel} from '../../../../framework/models/employee';
import {UniFormBuilder} from '../../../../framework/forms/builders/uniFormBuilder';
import {UniFormLayoutBuilder} from '../../../../framework/forms/builders/uniFormLayoutBuilder';
import {UniForm} from '../../../../framework/forms/uniForm';
import {UniComponentLoader} from '../../../../framework/core/componentLoader';
import {EmployeeService} from '../../../services/Salary/Employee/EmployeeService';
import {IEmployee} from '../../../../framework/interfaces/interfaces';
import {UniFieldBuilder} from '../../../../framework/forms/builders/uniFieldBuilder';
import {IComponentLayout} from '../../../../framework/interfaces/interfaces';

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

    private Model: EmployeeModel;
    private FormConfig: UniFormBuilder;

    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;

    constructor(
        private Http: UniHttp,
        private Api: EmployeeService
    ) {
        this.Api.setRelativeUrl('employees');
    }

    ngOnInit() {
        var self = this;
        this.Api.GetLayoutAndEntity('EmployeePersonalDetailsForm',1).subscribe((results: any[]) => {
            var view: IComponentLayout = results[0];
            var model: IEmployee = results[1];
            self.startApp(view, model);
        });
    }


    // private methods
    private startApp(view: any, model: IEmployee) {
        // We can extend layout before form config creation
        view = this.extendLayoutConfig(view);

        this.createModel(model);
        this.buildFormConfig(view, model);

        // We can extend the form config after the LayoutBuilder has created the layout
        this.extendFormConfig();

        this.loadForm();
    }

    private loadForm() {
        var self = this;
        return this.UniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
            cmp.instance.config = self.FormConfig;
            cmp.instance.getEventEmitter().subscribe(self.submit(self));
        });
    }

    private buildFormConfig(layout: IComponentLayout, model: IEmployee) {
        this.FormConfig = new UniFormLayoutBuilder().build(layout, model);
    }

    private createModel(model: IEmployee) {
        this.Model = EmployeeModel.createFromObject(model);
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
        field = this.FormConfig.find('SocialSecurityNumber');
        field.setKendoOptions({
            mask: '000000 00000',
            promptChar: '_'
        });
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

    private submit(context: UniFormDemo) {
        return () => {
            context.Api.Post(context.Model).subscribe((result: any) => {
                alert(JSON.stringify(result));
            });
        };
    }
}