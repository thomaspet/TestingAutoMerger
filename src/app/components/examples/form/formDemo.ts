import {Component, ComponentRef, ViewChild} from 'angular2/core';
import {UniHttp} from '../../../../framework/core/http';
import {Observable} from 'rxjs/Observable';
import {Operator} from '../../../../framework/interfaces/interfaces';
import {OperationType} from '../../../../framework/interfaces/interfaces';
import {ValidationLevel} from '../../../../framework/interfaces/interfaces';
import {EmployeeModel} from '../../../../framework/models/employee';
import {UniFormBuilder} from '../../../../framework/forms/builders/uniFormBuilder';
import {UniFormLayoutBuilder} from '../../../../framework/forms/builders/uniFormLayoutBuilder';
import {UniForm} from '../../../../framework/forms/uniForm';
import {UniComponentLoader} from '../../../../framework/core/componentLoader';
import {EmployeeService} from '../../../services/Salary/Employee/EmployeeService';

@Component({
    selector: 'uni-form-demo',
    directives: [UniComponentLoader],
    providers: [EmployeeService],
    template: `
        <div class='application employee'>
            <uni-component-loader></uni-component-loader>
        </div>
    `
})
export class UniFormDemo {

    Model: EmployeeModel;
    FormConfig: UniFormBuilder;
    Instance: UniForm;

    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;

    constructor(public http: UniHttp, public api: EmployeeService) {
        this.api.setRelativeUrl('employees');
    }

    ngOnInit() {
        var self = this;
        this.getData().subscribe((results: any[]) => {
            var [layout,employee] = results;

            layout = self.addValidators(layout);

            self.setModel(employee);

            self.setLayout(layout, self.Model);

            self.loadForm();
        });
    }


    // private methods
    private loadForm() {
        var self = this;
        return this.UniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
            cmp.instance.config = self.FormConfig;
            setTimeout(() => {
                self.Instance = cmp.instance;
            }, 100);
        });
    }

    private setLayout(layout, model) {
        this.FormConfig = new UniFormLayoutBuilder().build(layout, model);
    }

    private setModel(model) {
        this.Model = EmployeeModel.createFromObject(model);
    }

    private getData() {
        var sources = [this.getLayout(), this.getEmployee(1)];
        return Observable.forkJoin(sources);
    }

    private getLayout() {
        return this.http
            .asGET()
            .usingMetadataDomain()
            .withEndPoint('/layout/EmployeePersonalDetailsForm')
            .send();
    }

    private getEmployee(id: number) {
        return this.api.Get(id);
    }

    private addValidators(layout) {
        layout.Fields[0].Validators = [{
            'EntityType': 'BusinessRelation',
            'PropertyName': 'BusinessRelationInfo.Name',
            'Operator': Operator.Required,
            'Operation': OperationType.CreateAndUpdate, // not used now. Operation is applied in all levels
            'Level': ValidationLevel.Error, // not used now. All messages are errors
            'Value': null,
            'ErrorMessage': 'Employee name is required',
            'ID': 1,
            'Deleted': false
        }];
        /*
        layout.Fields[1].Validators = [{
            'EntityType': 'Employee',
            'PropertyName': 'SocialSecurityNumber',
            'Operator': Operator.RegExp,
            'Operation': OperationType.CreateAndUpdate, // not used now. Operation is applied in all levels
            'Level': ValidationLevel.Error, // not used now. All messages are errors
            'Value': "^[0-9]{11}$",
            'ErrorMessage': 'Employee fødselsnummer should have 11 numbers',
            'ID': 1,
            'Deleted': false
        }];
        */
        return layout;
    }
}