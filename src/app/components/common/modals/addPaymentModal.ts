import {Component, Type, Input, Output, ViewChild, EventEmitter, OnInit} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {
    UniForm,
    FieldType
} from '../../../../framework/ui/uniform/index';
import {
    UniEntity,
    Payment,
    BankAccount,
    BusinessRelation,
    CustomerInvoice
} from '../../../unientities';
import {
    PaymentService,
    StatisticsService,
    ErrorService,
    BankAccountService
} from '../../../services/services';
import {
    UniModalService,
    UniBankAccountModal
} from '../../../../framework/uniModal/barrel';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';
import {UniSearchAccountConfig} from '../../../services/common/uniSearchConfig/uniSearchAccountConfig';

declare const _; // lodash

// Reusable address form
@Component({
    selector: 'add-payment-form',

    template: `
        <article class="modal-content add-payment-modal">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-form [config]="formConfig$" [fields]="fields$" [model]="model$"></uni-form>
            <footer>
                <button
                    *ngFor="let action of config.actions; let i=index"
                    (click)="action.method()"
                    [ngClass]="action.class"
                    type="button">
                        {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class AddPaymentForm implements OnInit {
    @ViewChild(UniForm) public form: UniForm;

    public config: any = {};
    private model$: BehaviorSubject<any>= new BehaviorSubject(null);
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    private enableSave: boolean;
    private save: boolean;

    private accountType: string;

    constructor(
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private bankAccountService: BankAccountService,
        private uniSearchConfig: UniSearchAccountConfig
    ) {}

    public ngOnInit() {
        this.model$.next(this.config.model);

        this.setupForm();
    }

    private setupForm() {
        this.fields$.next(this.getFields());
    }

    private getDefaultBusinessRelationData() {
        if (this.config.model && this.config.model.BusinessRelation) {
            this.statisticsService.GetAllUnwrapped(
                `model=BusinessRelation&select=BusinessRelation.ID as ID,`
                + `BusinessRelation.Name as Name,Customer.ID,Supplier.ID,Employee.ID`
                + `&filter=BusinessRelation.ID eq ${this.config.model.BusinessRelationID} and `
                + `BusinessRelation.Deleted eq 'false'&join=Customer on BusinessRelation.ID`
                + ` eq Customer.BusinessRelationID Supplier on BusinessRelation.ID eq `
                + `Supplier.BusinessRelationID Employee on BusinessRelation.ID eq Employee.BusinessRelationID`
            ).subscribe(
                res => {
                    let businessObject = res.find(x => x.ID === this.config.model.BusinessRelationID);

                    if (businessObject) {
                        this.accountType = businessObject
                            ? (businessObject.CustomerID
                                ? 'Customer'
                                : businessObject.SupplierID
                                    ? 'Supplier'
                                    : businessObject.EmployeeID
                                        ? 'Employee'
                                        : ''
                            ) : '';
                    }
                },
                err => this.errorService.handle(err)
            );
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

    public generate(
        expands: string[],
        newItemModalFn?: (inputValue?: string) => Observable<UniEntity>
    ): IUniSearchConfig {
        return <IUniSearchConfig>{
            lookupFn: searchTerm => {
                let businessRelationFilter = this.model$.value.BusinessRelationID ?
                    ` and BusinessRelationID eq ${this.model$.value.BusinessRelationID}`
                    : ' and BusinessRelationID eq -1';

                let searchFor = searchTerm ? searchTerm : '';
                return this.statisticsService
                .GetAllUnwrapped(
                    `model=BankAccount`
                    + `&select=BankAccount.ID as ID,BankAccount.AccountNumber as AccountNumber`
                    + `&filter=BankAccount.Deleted eq 'false'`
                    + ` and contains(AccountNumber,'${searchFor}')${businessRelationFilter}`
                    + `&top=20`
                )
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            },

            onSelect: (selectedItem: any) => {
                if (selectedItem.ID) {
                    let item = selectedItem.ID.ID ? selectedItem.ID : selectedItem;

                    this.config.model.ToBankAccountID = item.ID;

                    return this.bankAccountService.Get(item.ID)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Kontonr'],
            rowTemplateFn: item => [
                item.AccountNumber
            ],
            inputTemplateFn: item => `${item.AccountNumber || ''}`,
            newItemModalFn: newItemModalFn,
            maxResultsLength: 20
        };
    }

    private updateBusinessRelation(model: Payment) {
        if (model.BusinessRelationID) {
            if (model.ToBankAccount && model.ToBankAccount.BusinessRelationID !== model.BusinessRelationID) {
                model.ToBankAccount = null;
                model.ToBankAccountID = null;
            }
            this.statisticsService.GetAll(
                    `model=BusinessRelation`
                    + `&expand=DefaultBankAccount`
                    + `&filter=BusinessRelation.ID eq ${model.BusinessRelationID}`
                    + `&select=BusinessRelation.ID,BusinessRelation.Name,`
                    + `DefaultBankAccount.ID,DefaultBankAccount.AccountNumber`
                )
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
                    } else {
                        model.BusinessRelation = null;
                    }
                    this.config.model = model;
                    this.model$.next(this.config.model);
                },
                err => this.errorService.handle(err)
            );
        } else if (model.ToBankAccount) {
            if (model.ToBankAccount && model.ToBankAccount.BusinessRelationID !== model.BusinessRelationID) {
                model.ToBankAccount = null;
                model.ToBankAccountID = null;
            }
            this.config.model = model;
            this.model$.next(this.config.model);
        }
    }

    private getFields() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        return [
            {
                EntityType: 'Payment',
                Property: 'PaymentDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Betalingsdato',
                FieldSet: 0,
                Section: 0
            },
            {
                EntityType: 'Payment',
                Property: 'FromBankAccountID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Konto fra',
                FieldSet: 0,
                Section: 0,
                Options: {
                    getDefaultData: () => this.getDefaultFromBankAccountData(),
                    displayProperty: 'AccountNumber',
                    valueProperty: 'ID',
                    debounceTime: 200,
                    search: (query: string) => {
                        return this.statisticsService.GetAll(
                            `model=BankAccount`
                            + `&select=BankAccount.ID as ID,BankAccount.AccountNumber as AccountNumber`
                            + `&filter=BankAccount.Deleted eq 'false' and isnull(CompanySettingsID,0)`
                            + ` ne 0 and contains(AccountNumber,'${query}')`
                            + `&top=20`
                        ).map(x => x.Data ? x.Data : []);
                    },
                    template: (account: BankAccount) => {
                        return account && account.ID !== 0 ? `${account.AccountNumber}` : '';
                    }
                },
                LineBreak: true,
            },
            {
                EntityType: 'Payment',
                Property: 'BusinessRelationID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Betales til',
                FieldSet: 0,
                Section: 0,
                Options: {
                    getDefaultData: () => this.getDefaultBusinessRelationData(),
                    displayProperty: 'Name',
                    valueProperty: 'ID',
                    template: (item) => {
                        return item
                            ? (item.CustomerID
                                ? 'Kunde: '
                                : item.SupplierID
                                    ? 'Leverandør: '
                                    : item.EmployeeID
                                        ? 'Ansatt: '
                                        : ''
                            ) + item.Name : '';
                    },
                    search: (query: string) => {
                        if (query === null) {
                            query = '';
                        }
                        return this.statisticsService.GetAll(
                            `model=BusinessRelation`
                            + `&select=BusinessRelation.ID as ID,BusinessRelation.Name as Name,`
                            + `Customer.ID,Supplier.ID,Employee.ID`
                            + `&join=Customer on BusinessRelation.ID eq Customer.BusinessRelationID Supplier `
                            + `on BusinessRelation.ID eq Supplier.BusinessRelationID Employee on BusinessRelation.ID`
                            + ` eq Employee.BusinessRelationID&filter=BusinessRelation.Deleted eq 'false' and `
                            + `contains(BusinessRelation.Name,'${query}') and (isnull(Customer.ID,0) ne 0 or `
                            + `isnull(Supplier.ID,0) ne 0 or isnull(Employee.ID,0) ne 0)&top=20`
                        ).map(x => x.Data ? x.Data : []);
                    },
                    events: {
                        select: (model: Payment) => {
                            this.updateBusinessRelation(model);
                        }
                    }
                }
            },
            {
                EntityType: 'Payment',
                Property: 'ToBankAccount',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Konto til',
                FieldSet: 0,
                Section: 0,
                Placeholder: 'Velg "Betales til" først',
                Options: {
                    uniSearchConfig: this.generate(
                        [],
                        (currentInputValue) => {
                            return this.modalService.open(UniBankAccountModal, {
                                data: {_initValue: currentInputValue}
                            }).onClose.asObservable()
                                .switchMap(bankAccount => {
                                    if (bankAccount) {
                                        bankAccount.BusinessRelationID = this.model$.value.BusinessRelationID;
                                        bankAccount.BankAccountType = this.accountType;
                                        bankAccount.BankID = 0;
                                        return this.bankAccountService.Post(bankAccount);
                                    }
                                    return Observable.of(bankAccount);
                                })
                                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                        }
                    )
                }
            },
            {
                EntityType: 'Payment',
                Property: 'PaymentID',
                FieldType: FieldType.TEXT,
                Label: 'KID',
                FieldSet: 0,
                Section: 0
            },
            {
                EntityType: 'CustomerInvoice',
                Property: 'InvoiceNumber',
                FieldType: FieldType.TEXT,
                Label: 'Fakturanr',
                FieldSet: 0,
                Section: 0
            },
            {
                EntityType: 'Payment',
                Property: 'AmountCurrency',
                FieldType: FieldType.TEXT,
                Label: 'Beløp',
                FieldSet: 0,
                Section: 0
            },
            {
                EntityType: 'Payment',
                Property: 'DueDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forfallsdato',
                FieldSet: 0,
                Section: 0,
                ReadOnly: true
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
                    class: 'bad',
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
