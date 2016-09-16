import {Component, Type, ViewChild, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniForm} from '../../../../../framework/uniform';
import {FieldLayout, AltinnReceipt} from '../../../../../app/unientities';
import {AltinnIntegrationService, EmployeeService} from '../../../../../app/services/services';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';

declare var _;
@Component({
    selector: 'tax-card-request-modal-content',
    directives: [UniForm, NgIf],
    providers: [AltinnIntegrationService, EmployeeService],
    templateUrl: 'app/components/salary/employee/modals/taxCardRequestModalContent.html',
    host: { '(document:keydown)': 'checkForEnterSubmit($event)' }
})
export class TaxCardRequestModalContent {
    public title: string = '';
    public exitButton: string = '';
    public busy: boolean;
    public sendAltinnVisible: boolean;
    public error: string = '';
    public isActive: boolean = false;

    @Input('config')
    private config: any;

    public model: { singleEmpChoice: number, multiEmpChoice: number } = { singleEmpChoice: 1, multiEmpChoice: 1 };
    public fields: FieldLayout[] = [];
    public formConfig: any = {};

    @ViewChild(UniForm)
    public uniform: UniForm;

    constructor(
        private _altinnService: AltinnIntegrationService,
        private _employeeService: EmployeeService
    ) {
        this.initialize();

    }

    public checkForEnterSubmit(event) {
        if (this.isActive) {
            if (event.keyCode === 13) {
                this.submit();
            }
        }

    }

    private initialize() {
        this.busy = true;
        this.sendAltinnVisible = true;
        this.title = 'Send forespørsel om skattekort';
        this.exitButton = 'Avbryt';
        this.error = '';
        this.model = { singleEmpChoice: 1, multiEmpChoice: 1 };
        var singleChoice: any = {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: 9,
            Property: 'singleEmpChoice',
            ReadOnly: false,
            Placeholder: 'Select',
            Options: {
                source: [
                    { id: 1, text: 'Gjeldende ansatt' },
                    { id: 2, text: 'For flere ansatte' }
                ],
                labelProperty: 'text',
                valueProperty: 'id'
            },

        };
        var multipleChoice: any = {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: 9,
            Hidden: true,
            Property: 'multiEmpChoice',
            ReadOnly: false,
            Placeholder: 'Select',
            Options: {
                source: [
                    { id: 1, text: 'Alle ansatte (uten sluttdato)' },
                    { id: 2, text: 'Aktive ansatte' },
                    { id: 3, text: 'Endrede skattekort' }
                ],
                labelProperty: 'text',
                valueProperty: 'id'
            }
        };
        this.fields = [singleChoice, multipleChoice];
        this.busy = false;
    }

    public submit() {
        if (this.model.singleEmpChoice === 2) {
            switch (this.model.multiEmpChoice) {
                case 1:
                    this.taxRequest('ALL_EMPS');
                    break;
                case 2:
                    this.taxRequest('ACTIVE_EMPS');
                    break;
                case 3:
                    this.taxRequest('CHANGED_ONLY');
                    break;
            }
        } else {
            this.taxRequest('SINGLE_EMP', this.config.employeeID);
        }
    }

    private taxRequest(option, empId = 0) {
        this.busy = true;
        this.uniform.Hidden = true;
        this.sendAltinnVisible = false;
        this._altinnService.sendTaxRequestAction(option, empId).subscribe((response: AltinnReceipt) => {
            if (response.ErrorText) {
                this.title = 'Feil angående Altinn-forespørsel';
                this.error = 'Feilmelding fra Altinn: ' + response.ErrorText;
            } else {
                this.title = 'Skatteforespørsel er sendt';
            }
            this.exitButton = 'OK';
            this.busy = false;
        },
            error => console.log(error));
    }

    public ready(value) {

    }

    public change(value) {
        this.uniform.Hidden = false;
        if (this.model.singleEmpChoice === 2) {
            this.fields[1].Hidden = false;
        } else {
            this.fields[1].Hidden = true;
        }
        this.fields = _.cloneDeep(this.fields);
    }

    public close() {
        this.initialize();
        this.uniform.Hidden = false;
    }
}

@Component({
    selector: 'tax-card-request-modal',
    directives: [UniModal],
    template: `
        <uni-modal [type]="type" [config]="config"></uni-modal>
    `
})
export class TaxCardRequestModal {
    public type: Type = TaxCardRequestModalContent;
    public config: any = {};
    @ViewChild(UniModal)
    private modal: UniModal;

    private employeeID: number;

    constructor(private rootRouteParams: RootRouteParamsService) {
        this.employeeID = +rootRouteParams.params['id'];
        this.config = {
            hasCancelButton: true,
            cancel: () => {
                this.modal.getContent().then((component: TaxCardRequestModalContent) => {
                    this.modal.close();
                    component.close();
                    component.isActive = false;
                });

            },
            employeeID: this.employeeID
        };
    }

    public openModal() {
        this.modal.getContent().then((modalContent: TaxCardRequestModalContent) => {
            this.modal.open();
            modalContent.isActive = true;
        });
    }


}
