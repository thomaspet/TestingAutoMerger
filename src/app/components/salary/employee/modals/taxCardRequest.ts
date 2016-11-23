import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {UniForm} from 'uniform-ng2/main';
import {FieldLayout, AltinnReceipt, FieldType} from '../../../../../app/unientities';
import {AltinnIntegrationService} from '../../../../../app/services/services';
import {ErrorService} from '../../../../services/common/ErrorService';

declare var _;
@Component({
    selector: 'tax-card-request',
    templateUrl: 'app/components/salary/employee/modals/taxCardRequest.html',
    host: { '(document:keydown)': 'checkForEnterSubmit($event)' }
    
})
export class TaxCardRequest {
    public title: string = '';
    public exitButton: string = '';
    public busy: boolean;
    public sendAltinnVisible: boolean;
    public error: string = '';
    public isActive: boolean = false;

    @Input()
    private employeeID: number;

    @Output()
    public newReceipt: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    public model: { singleEmpChoice: number, multiEmpChoice: number } = { singleEmpChoice: 1, multiEmpChoice: 1 };
    public fields: FieldLayout[] = [];
    public formConfig: any = {};

    @ViewChild(UniForm)
    public uniform: UniForm;

    constructor(
        private _altinnService: AltinnIntegrationService,
        private errorService: ErrorService
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

    public initialize() {
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
            FieldType: FieldType.RADIOGROUP,
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
            FieldType: FieldType.RADIOGROUP,
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
            this.taxRequest('SINGLE_EMP', this.employeeID);
        }
    }

    private taxRequest(option, empId = 0) {
        this.busy = true;
        this._altinnService.sendTaxRequestAction(option, empId).subscribe((response: AltinnReceipt) => {
            if (response.ErrorText) {
                this.title = 'Feil angående Altinn-forespørsel';
                if (response.ErrorText === 'An error occurred') {
                    this.error = 
                    ` Feilmelding fra Altinn: ${response.ErrorText}`
                    + '\n Forslag:' 
                    + '\n\t 1. Sjekk at systempålogging stemmer' 
                    + '\n\t     (trykk "sjekk login info" på innstillinger under Altinn)'
                    + '\n'
                    + '\n\t 2. Gå til innstillinger og sjekk at orgnr stemmer overens'
                    + '\n\t     med Altinn systempålogging';
                } else {
                    this.error = 'Feilmelding fra Altinn: ' + response.ErrorText;
                }
            } else {
                this.title = 'Skatteforespørsel er sendt';
                this.newReceipt.emit(true);
            }
            this.exitButton = 'OK';
            this.busy = false;
        },
            this.errorService.handle);
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
