import {Component, Type, Input, Output, ViewChild, EventEmitter, OnInit} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm, FieldType} from 'uniform-ng2/main';
import {Payment, BankAccount, BusinessRelation} from '../../../unientities';
import {PaymentService, StatisticsService, ErrorService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';

declare const _; // lodash

// Reusable address form
@Component({
    selector: 'add-payment-form',

    template: `
        <article class="modal-content add-payment-modal">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-form *ngIf="config" [config]="formConfig" [fields]="fields" [model]="config.model"></uni-form>
            <footer>
                <button *ngFor="let action of config.actions; let i=index" (click)="action.method()" [ngClass]="action.class" type="button">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class AddPaymentForm implements OnInit {
    @ViewChild(UniForm) public form: UniForm;

    public config: any = {};

    private enableSave: boolean;
    private save: boolean;

    private fields: any[] = [];
    private formConfig: any = {};

    constructor(
        private errorService: ErrorService,
        private statisticsService: StatisticsService
    ) {

    }

    public ngOnInit() {
        this.setupForm();
    }

    private setupForm() {
        this.fields = this.getFields();
    }

    private getDefaultBusinessRelationData() {
        if (this.config.model && this.config.model.BusinessRelation) {
            return Observable.of([this.config.model.BusinessRelation]);
        } else {
            return Observable.of([]);
        }
    }

    private getDefaultFromBankAccountData() {
        if (this.config.model && this.config.model.FromBankAccount ) {
            return Observable.of([this.config.model.FromBankAccount]);
        } else {
            return Observable.of([]);
        }
    }

    private getDefaultToBankAccountData() {
        if (this.config.model && this.config.model.ToBankAccount ) {
            return Observable.of([this.config.model.ToBankAccount]);
        } else {
            return Observable.of([]);
        }
    }

    private updateBusinessRelation(model: Payment) {

        if (model.BusinessRelationID) {
            if (model.ToBankAccount && model.ToBankAccount.BusinessRelationID !== model.BusinessRelationID) {
                model.ToBankAccount = null;
                model.ToBankAccountID = null;
            }

            this.statisticsService.GetAll(`model=BusinessRelation&expand=DefaultBankAccount&filter=BusinessRelation.ID eq ${model.BusinessRelationID}&select=BusinessRelation.ID,BusinessRelation.Name,DefaultBankAccount.ID,DefaultBankAccount.AccountNumber`)
                .map(data => data.Data ? data.Data : [])
                .subscribe(data => {
                    if (data && data.length > 0) {
                        model.BusinessRelation = new BusinessRelation();
                        model.BusinessRelation.ID = model.BusinessRelationID;
                        model.BusinessRelation.Name = data[0].BusinessRelationName;

                        if (data[0].DefaultBankAccountID) {
                            model.ToBankAccountID = data[0].DefaultBankAccountID;
                            model.ToBankAccount = new BankAccount();
                            model.ToBankAccount.ID = data[0].DefaultBankAccountID;
                            model.ToBankAccount.AccountNumber = data[0].DefaultBankAccountAccountNumber;
                        }

                        this.config.model = _.cloneDeep(model);
                    } else {
                        model.BusinessRelation = null;
                    }
                },
                err => this.errorService.handle(err)
            );
        } else if (model.ToBankAccount) {
            if (model.ToBankAccount && model.ToBankAccount.BusinessRelationID !== model.BusinessRelationID) {
                model.ToBankAccount = null;
                model.ToBankAccountID = null;
            }

            this.config.model = _.cloneDeep(model);
        }
    }

    private getFields() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        return [
            {
                ComponentLayoutID: 1,
                EntityType: 'Payment',
                Property: 'PaymentDate',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.LOCAL_DATE_PICKER,
                ReadOnly: false,
                LookupField: false,
                Label: 'Betalingsdato',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: false,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Payment',
                Property: 'FromBankAccountID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Konto fra',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: {
                    getDefaultData: () => this.getDefaultFromBankAccountData(),
                    displayProperty: 'AccountNumber',
                    valueProperty: 'ID',
                    debounceTime: 200,
                    search: (query: string) => {
                        return this.statisticsService.GetAll(
                            `model=BankAccount&select=BankAccount.ID as ID,BankAccount.AccountNumber as AccountNumber&filter=BankAccount.Deleted eq 'false' and isnull(CompanySettingsID,0) ne 0 and contains(AccountNumber,'${query}')&top=20`
                        ).map(x => x.Data ? x.Data : [])
                    },
                    template: (account: BankAccount) => {
                        return account && account.ID !== 0 ? `${account.AccountNumber}` : '';
                    }
                },
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Payment',
                Property: 'BusinessRelationID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Betales til',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: {
                    getDefaultData: () => this.getDefaultBusinessRelationData(),
                    displayProperty: 'Name',
                    valueProperty: 'ID',
                    template: (item) => {
                        return item ? (item.CustomerID ? 'Kunde: ' : item.SupplierID ? 'Leverandør: ' : item.EmployeeID ? 'Ansatt: ' : '')
                                + item.Name : '';
                    },
                    search: (query: string) => {
                        return this.statisticsService.GetAll(
                            `model=BusinessRelation&select=BusinessRelation.ID as ID,BusinessRelation.Name as Name,Customer.ID,Supplier.ID,Employee.ID&join=Customer on BusinessRelation.ID eq Customer.BusinessRelationID Supplier on BusinessRelation.ID eq Supplier.BusinessRelationID Employee on BusinessRelation.ID eq Employee.BusinessRelationID&filter=BusinessRelation.Deleted eq 'false' and contains(BusinessRelation.Name,'${query}') and (isnull(Customer.ID,0) ne 0 or isnull(Supplier.ID,0) ne 0 or isnull(Employee.ID,0) ne 0)&top=20`
                        ).map(x => x.Data ? x.Data : [])
                    },
                    events: {
                        select: (model: Payment) => {
                            this.updateBusinessRelation(model);
                        }
                    }
                },
                LineBreak: false,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null,
                Classes: 'large-field'
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Payment',
                Property: 'ToBankAccountID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Konto til',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: 'Velg "Betales til" først',
                Options: {
                    getDefaultData: () => this.getDefaultToBankAccountData(),
                    displayProperty: 'AccountNumber',
                    valueProperty: 'ID',
                    debounceTime: 200,
                    search: (query: string) => {
                        // the user should select businessrelation before selecting bankaccount
                        let businessRelationFilter = this.config.model.BusinessRelationID ?
                            ` and BusinessRelationID eq ${this.config.model.BusinessRelationID}`
                            : ' and BusinessRelationID eq -1';

                        return this.statisticsService.GetAll(
                            `model=BankAccount&select=BankAccount.ID as ID,BankAccount.AccountNumber as AccountNumber&filter=BankAccount.Deleted eq 'false' and contains(AccountNumber,'${query}')${businessRelationFilter}&top=20`
                        ).map(x => x.Data ? x.Data : [])
                    },
                    template: (account: BankAccount) => {
                        return account && account.ID !== 0 ? `${account.AccountNumber}` : '';
                    }
                },
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Payment',
                Property: 'PaymentID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'KID',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: false,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Payment',
                Property: 'Amount',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Beløp',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: false,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Payment',
                Property: 'DueDate',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.LOCAL_DATE_PICKER,
                ReadOnly: false,
                LookupField: false,
                Label: 'Forfallsdato',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            }
        ];
    }
}

// address modal
@Component({
    selector: 'add-payment-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig" ></uni-modal>
    `
})
export class AddPaymentModal {
    @Input() public payment: Payment;
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public Changed = new EventEmitter<Payment>();
    @Output() public Canceled = new EventEmitter<boolean>();

    private modalConfig: any = {};
    private type: Type<any> = AddPaymentForm;

    constructor(private paymentService: PaymentService) {
    }

    public ngOnInit() {
        this.modalConfig = {
            title: 'Legg til betaling',
            mode: null,
            actions: [
                {
                    text: 'Legg til betaling',
                    class: 'good',
                    method: () => {
                        this.modal.close();
                        this.Changed.emit(this.modalConfig.model);
                        return false;
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.close();
                        this.Canceled.emit(true);
                        return false;
                    }
                }
            ]
        };
    }

    public openModal(payment: Payment, title?: string) {
        if (title) {
            this.modalConfig.title = title;
        }

        this.modalConfig.model = payment;

        this.modal.open();
    }
}
