import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {UniForm, FieldType} from 'uniform-ng2/main';
import {FieldLayout, AltinnReceipt} from '../../../../../app/unientities';
import {AltinnIntegrationService, ErrorService} from '../../../../../app/services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
declare const _;

type TaxRequestModel = {
    singleEmpChoice: number,
    multiEmpChoice: number,
    empsAndChanged: boolean
};

@Component({
    selector: 'tax-card-request',
    templateUrl: './taxCardRequest.html',
    host: { '(document:keydown)': 'checkForEnterSubmit($event)' }

})
export class TaxCardRequest {
    public title: string = '';
    public exitButton: string = '';
    public busy: boolean;
    public sendAltinnVisible: boolean;
    public error: string = '';
    public isActive: boolean = false;

    @Input() private employeeID: number;

    @Output() public newReceipt: EventEmitter<boolean> = new EventEmitter<boolean>(true);

    public model$: BehaviorSubject<TaxRequestModel> = new BehaviorSubject<TaxRequestModel>(
        { singleEmpChoice: 1, multiEmpChoice: 1, empsAndChanged: false });
    public fields$: BehaviorSubject<FieldLayout[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});

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
        this.model$.next({ singleEmpChoice: 1, multiEmpChoice: 1, empsAndChanged: false });
        let singleChoice: any = {
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
        let multipleChoice: any = {
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
        let empsAndChangedField: any = {
            FieldSet: 0,
            Section: 0,
            Combo: 0,
            FieldType: FieldType.CHECKBOX,
            Hidden: false,
            Property: 'empsAndChanged',
            Label: 'Be om endrede skattekort',
            ReadOnly: false,
            Placeholder: 'Select',
        };
        this.fields$.next([empsAndChangedField, singleChoice, multipleChoice]);
        this.busy = false;
    }

    public submit() {
        let model = this.model$.getValue();
        let option = '';
        if (model.singleEmpChoice === 2) {
            switch (model.multiEmpChoice) {
                case 1:
                    option = 'ALL_EMPS';
                    break;
                case 2:
                    option = 'ACTIVE_EMPS';
                    break;
                case 3:
                    option = 'CHANGED_ONLY';
                    break;
            }
        } else {
            option = 'SINGLE_EMP';
        }

        this.taxRequest(option, this.employeeID, model.empsAndChanged);
    }

    private taxRequest(option: string, empId: number = 0, empsAndChanged = false) {
        this.busy = true;
        this._altinnService.sendTaxRequestAction(option, empId, empsAndChanged)
            .subscribe((response: AltinnReceipt) => {
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
            err => this.errorService.handle(err));
    }

    public ready(value) {

    }

    public change(changes: SimpleChanges) {
        this.uniform.Hidden = false;
        let fields = this.fields$.getValue();
        if (this.model$.getValue().singleEmpChoice === 2) {
            fields[2].Hidden = false;
        } else {
            fields[2].Hidden = true;
        }
        this.fields$.next(fields);
    }

    public close() {
        this.initialize();
        this.uniform.Hidden = false;
    }
}
