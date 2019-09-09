import {Component, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../framework/uni-modal';
import {
    UniForm,
    FieldType,
    UniFieldLayout,
    UniFormError
} from '../../../../framework/ui/uniform/index';
import {
    UniEntity,
    Payment,
    BankAccount,
    BusinessRelation,
    CompanySettings
} from '../../../unientities';
import {
    StatisticsService,
    ErrorService,
    BankAccountService
} from '../../../services/services';
import {
    UniModalService,
    UniBankAccountModal
} from '../../../../framework/uni-modal';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';
import {UniSearchAccountConfig} from '../../../services/common/uniSearchConfig/uniSearchAccountConfig';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { PaymentCodeService } from '@app/services/accounting/paymentCodeService';

@Component({
    selector: 'add-payment-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options?.header||'Legg til betaling'}}</header>

            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="fields$"
                    [model]="model$">
                </uni-form>
            </article>

            <footer>
                <button (click)="close('cancel')" class="secondary">
                    Avbryt
                </button>
                <button (click)="close('ok')" class="c2a">
                    {{options?.buttonLabels?.accept||'Legg til betaling'}}
                </button>
            </footer>
        </section>
    `
})
export class AddPaymentModal implements IUniModal {

    @ViewChild(UniForm)
    public form: UniForm;

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();


    public config: any = {};
    public model$: BehaviorSubject<any> = new BehaviorSubject(null);
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    private accountType: string;
    private companySettingsID: number;
    private fromBankAccountsList: any;
    private paymentCodes: any;

    constructor(
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private bankAccountService: BankAccountService,
        public uniSearchConfig: UniSearchAccountConfig,
        private toastService: ToastService,
        private companySettingsService: CompanySettingsService,
        private paymentCodeService: PaymentCodeService,
    ) {}

    public ngOnInit() {
        if (this.options) {
            this.config = {
                title: 'Legg til betaling',
                mode: null,
                model: this.options.data.model
            };

            this.companySettingsService.Get(1).subscribe((companySettings: CompanySettings) => {
                this.companySettingsID = companySettings.ID;
                this.model$.next(this.config.model);
                this.setupForm();
            });
        }
    }

    private setupForm() {
        const model = this.model$.getValue();
        model.PaymentCodeID = model.PaymentCodeID || 1;
        Observable.forkJoin(
            this.bankAccountService.GetAll(`filter=CompanySettingsID eq ${this.companySettingsID}`),
            this.bankAccountService.GetAll(`filter=BusinessRelationID eq ${model.BusinessRelationID || 0}`),
            this.paymentCodeService.GetAll(null)
        ).subscribe(data => {
            this.fromBankAccountsList = data[0];
            this.config.model['ToBankAccountsList'] = this.options.data.customerBankAccounts || data[1];
            this.paymentCodes = data[2];
            this.fields$.next(this.getFields());
        });
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
                    const businessObject = res.find(x => x.ID === this.config.model.BusinessRelationID);

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

    public generate(
        expands: string[],
        createNewFn?: (inputValue?: string) => Observable<UniEntity>
    ): IUniSearchConfig {
        return <IUniSearchConfig>{
            lookupFn: searchTerm => {
                const businessRelationFilter = this.model$.value.BusinessRelationID ?
                    ` and BusinessRelationID eq ${this.model$.value.BusinessRelationID}`
                    : ' and BusinessRelationID eq -1';

                const searchFor = searchTerm ? searchTerm : '';
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
                    const item = selectedItem.ID.ID ? selectedItem.ID : selectedItem;

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
            createNewFn: createNewFn,
            maxResultsLength: 20
        };
    }

    private refreshBankAccount() {
        const fields = this.fields$.getValue();
        const model = this.model$.getValue();
        this.bankAccountService.GetAll(`filter=BusinessRelationID eq ${model.BusinessRelationID}`).subscribe(bankAccounts => {
            const options = this.getBankAccountsOptions();
            const toBankAccounts: UniFieldLayout = fields.find(x => x.Property === 'ToBankAccountID');
            this.config.model['ToBankAccountsList'] = bankAccounts;
            toBankAccounts.Options = options;
            this.fields$.next(fields);
        });
     }

     updateBusinessRelation(model: Payment) {
            this.statisticsService.GetAllUnwrapped(
                `model=BusinessRelation`
                + `&expand=DefaultBankAccount`
                + `&filter=BusinessRelation.ID eq ${model.BusinessRelationID}`
                + `&select=BusinessRelation.ID,BusinessRelation.Name,`
                + `DefaultBankAccount.ID,DefaultBankAccount.AccountNumber`
            )
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
                    } else {
                        model.ToBankAccount = null;
                        model.ToBankAccountID = null;
                    }
                } else {
                    model.BusinessRelation = null;
                    model.ToBankAccount = null;
                    model.ToBankAccountID = null;
                }
                this.config.model = model;
                this.model$.next(this.config.model);
                this.refreshBankAccount();
            },
            err => this.errorService.handle(err)
        );
     }

    private getBankAccountsOptions() {
        const model = this.model$.getValue();
        return {
            listProperty: 'ToBankAccountsList',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeIdInProperty: 'ToBankAccountID',
            storeResultInProperty: 'ToBankAccount',
            editor: (bankaccount) => {
                if (!bankaccount || !bankaccount.ID) {
                    bankaccount = bankaccount || new BankAccount();
                    bankaccount.BusinessRelationID = model.BusinessRelationID;
                    bankaccount.BankAccountType = this.accountType;
                }
                bankaccount['_saveBankAccountInModal'] = true;
                const modal = this.modalService.open(UniBankAccountModal, {
                    data: bankaccount
                });

                return modal.onClose.take(1).toPromise();
            }
        };
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
                FieldType: FieldType.DROPDOWN,
                Label: 'Konto fra',
                FieldSet: 0,
                Section: 0,
                Options: {
                    source: this.fromBankAccountsList,
                    valueProperty: 'ID',
                    displayProperty: 'AccountNumber',
                    debounceTime: 200
                }
            },
            {
                EntityType: 'Payment',
                Property: 'BusinessRelationID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Betales til',
                FieldSet: 0,
                Section: 0,
                ReadOnly: this.options.data.disablePaymentToField,
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
                Property: 'ToBankAccountID',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Konto til',
                FieldSet: 0,
                Section: 0,
                Hidden: this.options.data.disablePaymentToField,
                Options: this.getBankAccountsOptions(),
                Validations: [this.validateToAccountNumber.bind(this)]
            },
            {
                EntityType: 'Payment',
                Property: 'ToBankAccountID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Konto til',
                FieldSet: 0,
                Section: 0,
                Hidden: !this.options.data.disablePaymentToField,
                Options: {
                    source: this.options.data.customerBankAccounts,
                    valueProperty: 'ID',
                    storeIdInProperty: 'ToBankAccountID',
                    storeResultInProperty: 'ToBankAccount',
                    template: (item) => item.AccountNumber || ''
                },
                Validations: [this.validateToAccountNumber.bind(this)]
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
                Property: 'Description',
                FieldType: FieldType.TEXTAREA,
                Label: 'Betalingsinformasjon',
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
                Property: 'CurrencyCode.Code',
                FieldType: FieldType.TEXT,
                Label: 'Valuta',
                FieldSet: 0,
                Section: 0,
                ReadOnly: true
            },
            {
                EntityType: 'Payment',
                Property: 'DueDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forfallsdato',
                FieldSet: 0,
                Section: 0,
                ReadOnly: true
            },
            {
                EntityType: 'Payment',
                Property: 'PaymentCodeID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Type',
                FieldSet: 0,
                Section: 0,
                Options: {
                    source: this.paymentCodes,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200
                }
            }
        ];
    }

    private validateToAccountNumber(value: number, field: UniFieldLayout): UniFormError | null {
        if (this.options && this.options.data.disablePaymentToField && !this.options.data.customerBankAccounts[0]) {
            return {
                value: value,
                errorMessage: 'Gå til kunde og fyll inn kontonummer',
                field: field,
                isWarning: true
            };
        }
        return null;
    }

    public close(action: string) {
        if (action === 'ok') {
            const data = this.model$.getValue();
            // validate
            if (!data['PaymentDate']) {
                this.toastService.addToast('Error', ToastType.bad, 5, 'Mangler fra Betaligsdato!');
                return false;
            } else if (!data['BusinessRelationID']) {
                this.toastService.addToast('Error', ToastType.bad, 5, 'Betales til er ugyldig!');
                return false;
            } else if (!data['FromBankAccountID']) {
                this.toastService.addToast('Error', ToastType.bad, 5, 'Mangler konto fra!');
                return false;
            } else if (!data['ToBankAccountID']) {
                if (this.options && !this.options.data.customerBankAccounts[0]) {
                    this.toastService.addToast('Error', ToastType.bad, 5, 'Gå til kunde og fyll inn kontonummer');
                    return false;
                }
                this.toastService.addToast('Error', ToastType.bad, 5, 'Mangler konto til!');
                return false;
            } else if (!data['AmountCurrency']) {
                this.toastService.addToast('Error', ToastType.bad, 5, 'Mangler beløp');
                return false;
            }
            data.Amount = data.AmountCurrency * (data.CurrencyExchangeRate ? data.CurrencyExchangeRate : 1);
            this.onClose.emit(this.config.model);
        } else {
            this.onClose.emit(false);
        }
    }
}
