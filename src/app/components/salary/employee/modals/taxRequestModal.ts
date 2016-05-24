import {Component, Type, ViewChild, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router-deprecated';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniForm, UniFormBuilder, UniFieldBuilder} from '../../../../../framework/forms';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/unitable';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {FieldType, PayrollRun, SalaryTransaction, FieldLayout} from '../../../../../app/unientities';
import {AltinnService, EmployeeService} from '../../../../../app/services/services';
import {Observable} from 'rxjs/Observable';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';

declare var _;
@Component({
    selector: 'tax-request-modal-content',
    directives: [UniForm, NgIf],
    providers: [],
    templateUrl: 'app/components/salary/employee/modals/taxrequestmodalcontent.html'
})
export class TaxRequestModalContent {
    @Input('config')
    private config: any;
    
    public model: {formChoice: number} = { formChoice: 1 };
    public fields: any[] = [];
    public formConfig: any = {};
    
    @ViewChild(UniForm)
    public uniform: UniForm;
    
    constructor() {
        var singleEmpChoice: FieldLayout = {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: 9,
            Label: 'Send forespørsel om skattekort for en ansatt',
            Property: 'formChoice',
            ReadOnly: false,
            Placeholder: 'Select',
            Options: {
                source: [
                    { id: 1, text: 'Be om skattekort kun for aktuell ansatt(den en står på)'},
                    { id: 2, text: 'Gå videre til menyvalg for å hente skattekort for flere'}
                ],
                labelProperty: 'text',
                valueProperty: 'id'
            }
        };
        this.fields = [singleEmpChoice, ...this.fields];
        this.formConfig = {
            submitText: 'Enviar'
        };
        
    }
    
    public submit(value) {
        console.log('Submit:', value);
    }

    public ready(value) {
        console.log('Ready:', value);
    }

    public change(value) {
        console.log('Change:', value);
    }
}

@Component({
    selector: 'tax-request-modal',
    directives: [UniModal],
    template: `
        <button type="button" (click)="openModal()">Send forespørsel om skattekort</button>
        <uni-modal [type]="type" [config]="config"></uni-modal>
    `
})
export class TaxRequestModal {
    public type: Type = TaxRequestModalContent;
    public config: any = {};
    @ViewChild(UniModal)
    private modal: UniModal;
    
    private employeeID: number;
    
    constructor(private rootRouteParams: RootRouteParamsService) {
        this.employeeID = +rootRouteParams.params.get('id');
        
        this.config = {
            title: '',
            hasCancelButton: true,
            cancel: () => {
                this.modal.close();
            }
        };
    }
    
    public openModal() {
        this.modal.getContent().then((modalContent: TaxRequestModalContent) => {
            this.modal.open();
        });
    }
    
    
}
