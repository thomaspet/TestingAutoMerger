import {Component, Type, ViewChild, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniForm} from '../../../../../framework/uniform';
import {FieldLayout, Employee, AltinnReceipt} from '../../../../../app/unientities';
import {AltinnService, EmployeeService} from '../../../../../app/services/services';
import {Observable} from 'rxjs/Observable';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';

declare var _;
@Component({
    selector: 'tax-request-modal-content',
    directives: [UniForm, NgIf],
    providers: [AltinnService, EmployeeService],
    templateUrl: 'app/components/salary/employee/modals/taxrequestmodalcontent.html'
})
export class TaxRequestModalContent {
    public title: string = '';
    public exitButton: string = '';
    public busy: boolean;
    public sendAltinnVisible: boolean;
    public error: string = '';

    @Input('config')
    private config: any;

    public model: { singleEmpChoice: number, multiEmpChoice: number } = { singleEmpChoice: 1, multiEmpChoice: 1 };
    public fields: FieldLayout[] = [];
    public formConfig: any = {};

    @ViewChild(UniForm)
    public uniform: UniForm;

    constructor(
        private _altinnService: AltinnService,
        private _employeeService: EmployeeService
    ) {
        this.initialize();

    }

    private initialize() {
        this.sendAltinnVisible = true;
        this.title = 'Send forespørsel om skattekort';
        this.exitButton = 'Avbryt';
        this.error = '';
        this.model = { singleEmpChoice: 1, multiEmpChoice: 1 };
        var singleChoice: FieldLayout = {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: 9,
            Property: 'singleEmpChoice',
            ReadOnly: false,
            Placeholder: 'Select',
            Options: {
                source: [
                    { id: 1, text: 'Kun for valgt ansatt (den du står på)' },
                    { id: 2, text: 'For flere ansatte' }
                ],
                labelProperty: 'text',
                valueProperty: 'id'
            }
        };
        var multipleChoice: FieldLayout = {
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
                    this.taxRequest(1);
                    break;
                case 2:
                    this.taxRequest(2);
                    break;
                case 3:
                    this.taxRequest(3);
                    break;
            }
        } else {
            this.taxRequest(0, this.config.employeeID);
        }
    }

    private taxRequest(option, empId = 0) {
        this.busy = true;
        this.uniform.Hidden = true;
        this.sendAltinnVisible = false;
        this._altinnService.sendTaxRequestAction(option, empId).subscribe((response: AltinnReceipt) => {
            if (response.ErrorText) {
                this.title = 'Feil angående Altinn forespørsel';
                this.error = 'feilmelding fra altinn: ' + response.ErrorText;
                this.exitButton = 'OK';
                this.busy = false;
            } else {
                this.title = 'Skatteforespørsel er sendt';
                this.exitButton = 'OK';
                this.busy = false;
            }

            console.log('response from taxRequestAction: ' + JSON.stringify(response));
        },
            error => console.log(error));
    }

    public ready(value) {
        console.log('Form ready');
    }

    public change(value) {
        this.uniform.Hidden = false;
        if (this.model.singleEmpChoice === 2) {
            this.fields[1].Hidden = false;
            this.fields = _.cloneDeep(this.fields);
        } else {
            this.fields[1].Hidden = true;
            this.fields = _.cloneDeep(this.fields);
        }

    }

    public close() {
        this.busy = true;
        this.initialize();
        this.uniform.Hidden = false;
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
        var self = this;
        this.config = {
            hasCancelButton: true,
            cancel: () => {
                this.modal.getContent().then((component: TaxRequestModalContent) => {
                    this.modal.close();
                    component.close();
                });

            },
            employeeID: this.employeeID
    };
}

    public openModal() {
    this.modal.getContent().then((modalContent: TaxRequestModalContent) => {
        this.modal.open();
    });
}


}
