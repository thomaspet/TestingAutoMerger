import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {Observable} from 'rxjs';
import {
    UniModalService,
    IUniModal,
    IModalOptions,
    UniBankAccountModal,
    UniConfirmModalV2,
    ConfirmActions
} from '../../../../framework/uni-modal';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    BankAccount,
    Payment,
    PaymentCode,
    LocalDate,
} from '../../../unientities';
import {
    PaymentService,
    ErrorService,
    CompanySettingsService,
    StatisticsService,
    BankAccountService,
    PaymentCodeService,
    CurrencyService,
} from '../../../services/services';

import * as moment from 'moment';

@Component({
    selector: 'uni-payment-edit-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 80vw;">
            <header>Rediger utbetalinger</header>

            <article style="max-height: 70vh;">
                <mat-form-field>
                    <mat-select [value]="paymentCodeFilterValue"
                        (valueChange)="onPaymentCodeFilterChange($event)" placeholder="Type">
                        <mat-option *ngFor="let code of paymentCodes" [value]="code">
                            {{ code.Name }}
                        </mat-option>
                    </mat-select>
                </mat-form-field>
                <ag-grid-wrapper *ngIf="tableConfig"
                    class="transquery-grid-font-size"
                    [resource]="pendingPayments"
                    [config]="tableConfig">
                </ag-grid-wrapper>
            </article>

            <footer>
                <button class="secondary" (click)="close()">Avbryt</button>
                <button class="c2a" (click)="saveAndClose()">Lagre</button>
            </footer>
        </section>
`
})

export class UniPaymentEditModal implements IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    @ViewChild(AgGridWrapper)
    private table: AgGridWrapper;

    public tableConfig: UniTableConfig;
    private companySettings: any;
    public pendingPayments: Array<Payment> = [];

    public paymentCodes: PaymentCode[];
    public paymentCodeFilterValue: number = 0;

    constructor(
        private toastService: ToastService,
        private paymentService: PaymentService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private bankAccountService: BankAccountService,
        private paymentCodeService: PaymentCodeService,
        private currencyService: CurrencyService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService
    ) { }

    public ngOnInit() {
        this.paymentCodeService.GetAll(null)
        .subscribe(data => {
            const emptyPaymentCodeOption = new PaymentCode();
            emptyPaymentCodeOption.ID = 0;
            emptyPaymentCodeOption.Name = '';
            data.unshift(emptyPaymentCodeOption);
            this.paymentCodes = data;
        },
        err => this.errorService.handle(err)
        );

        this.companySettingsService.Get(1)
            .subscribe(data => {
                this.companySettings = data;
                this.setUpTable();

                this.loadData();
            },
            err => this.errorService.handle(err)
            );
        }

    private setUpTable() {
        const paymentDateCol = new UniTableColumn('PaymentDate', 'Betalingsdato', UniTableColumnType.LocalDate);
        const payToCol = new UniTableColumn('BusinessRelation', 'Betales til', UniTableColumnType.Lookup)
            .setTemplate(data => {
                return data.BusinessRelationID === null && data.ToBankAccount
                ? data.ToBankAccount.CompanySettings.CompanyName
                : data.BusinessRelation.Name;
            })
            .setOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.CustomerID
                        ? 'Kunde: '
                        : selectedItem.SupplierID
                        ? 'Leverandør: '
                        : selectedItem.EmployeeID
                        ? 'Ansatt: '
                        : '')
                        + selectedItem.BusinessRelationName;
                },
                lookupFunction: (query: string) => {
                    return this.statisticsService.GetAll(
                        `model=BusinessRelation&select=BusinessRelation.ID,BusinessRelation.Name,Customer.ID,
                        Supplier.ID,Employee.ID&join=Customer on BusinessRelation.ID eq
                        Customer.BusinessRelationID Supplier on BusinessRelation.ID eq
                        Supplier.BusinessRelationID Employee on BusinessRelation.ID eq
                        Employee.BusinessRelationID&filter=BusinessRelation.Deleted eq
                        'false' and contains(BusinessRelation.Name,'${query}') and (isnull(Customer.ID,0)
                        ne 0 or isnull(Supplier.ID,0) ne 0 or isnull(Employee.ID,0) ne 0)&top=20`
                    ).map(x => x.Data ? x.Data : []);
                }
            });

        const currencyCodeCol = new UniTableColumn('CurrencyCode', 'Valuta', UniTableColumnType.Text, false)
            .setDisplayField('CurrencyCode.Code')
            .setWidth('5%')
            .setVisible(false);

        const amountCurrencyCol = new UniTableColumn('AmountCurrency', 'Beløp', UniTableColumnType.Money);

        const amountCol = new UniTableColumn('Amount',
            `Beløp (${this.companySettings.BaseCurrencyCode.Code})`, UniTableColumnType.Money)
            .setSkipOnEnterKeyNavigation(true)
            .setVisible(false)
            .setEditable(false);

        const fromAccountCol = new UniTableColumn('FromBankAccount', 'Konto fra', UniTableColumnType.Lookup)
            .setDisplayField('FromBankAccount.AccountNumber')
            .setOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber);
                },
                lookupFunction: (query: string) => {
                    return this.bankAccountService.GetAll(
                        `filter=CompanySettingsID eq 1 and contains(AccountNumber,'${query}')&top=20`
                    );
                }
            });
        const toAccountCol = new UniTableColumn('ToBankAccount', 'Konto til', UniTableColumnType.Lookup)
            .setDisplayField('ToBankAccount.AccountNumber')
            .setOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber);
                },
                lookupFunction: (query: string) => {
                    const currentRow = this.table.getCurrentRow();

                    return this.bankAccountService.GetAll(
                        `filter=BusinessRelationID eq ${currentRow.BusinessRelationID}
                        and contains(AccountNumber,'${query}')&top=20`
                    );
                },
                addNewButton: {
                    label: 'Legg til bankkonto',
                    action: () => {
                        return new Promise(resolve => {
                            const currentRow = this.table.getCurrentRow();
                            const bankAccount = new BankAccount();
                            bankAccount.BusinessRelationID = currentRow.BusinessRelationID;
                            bankAccount['_createguide'] = this.bankAccountService.getNewGuid();
                            bankAccount.BankAccountType = '-';

                            this.modalService.open(UniBankAccountModal, {
                                data: bankAccount
                            }).onClose.subscribe(account => {
                                if (!account) {
                                    resolve(undefined);
                                    return;
                                }

                                this.bankAccountService.Post(account).subscribe(
                                    res => resolve(res),
                                    err => {
                                        this.errorService.handle(err);
                                        resolve(undefined);
                                    }
                                );
                            });
                        });
                    }
                },
                // addNewButtonVisible: true,
                // addNewButtonText: 'Legg til bankkonto',
                // addNewButtonCallback: (text) => new Promise((resolve, reject) => {
                //     const currentRow = this.table.getCurrentRow();
                //     const bankAccount = new BankAccount();
                //     bankAccount.BusinessRelationID = currentRow.BusinessRelationID;
                //     bankAccount['_createguide'] = this.bankAccountService.getNewGuid();
                //     bankAccount.BankAccountType = '-';

                //     const modal = this.modalService.open(UniBankAccountModal, {
                //         data: bankAccount
                //     });

                //     modal.onClose.subscribe((account) => {
                //         if (!account) {
                //             resolve(undefined);
                //             return;
                //         }

                //         this.bankAccountService.Post(account).subscribe(
                //             res => resolve(res),
                //             err => {
                //                 this.errorService.handle(err);
                //                 resolve(undefined);
                //             }
                //         );
                //     });
                // })
            });

        const paymentIDCol = new UniTableColumn('PaymentID', 'KID', UniTableColumnType.Text);
        const dueDateCol = new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.LocalDate)
            .setConditionalCls(payment => moment(payment.DueDate).isBefore(moment()) ? 'payment-due' : '');
        const paymentCodeCol = new UniTableColumn('PaymentCode', 'Type', UniTableColumnType.Lookup)
            .setDisplayField('PaymentCode.Name')
            .setVisible(false)
            .setOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.Name);
                },
                lookupFunction: (query: string) => {
                    return this.paymentCodeService.GetAll(
                        `filter=contains(Name,'${query}')&top=20`
                    );
                }
            });

        const descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
            .setVisible(false);

        // Setup table
        this.tableConfig = new UniTableConfig('bank.payments.paymentList', true, true)
            .setColumns([
                paymentDateCol,
                payToCol,
                fromAccountCol,
                toAccountCol,
                paymentIDCol,
                currencyCodeCol,
                amountCurrencyCol,
                amountCol,
                dueDateCol,
                paymentCodeCol,
                descriptionCol
            ])
            .setChangeCallback((event) => {
                return this.paymentChangeCallback(event);
            })
            .setDeleteButton(false)
            .setColumnMenuVisible(true)
            .setAutoAddNewRow(false)
            .setSearchable(true);
    }

    private paymentChangeCallback(event) {
        const data = event.rowModel;

        data._isDirty = true;

        let rowOrPromise: Promise<any> | any;

        if (event.field === 'BusinessRelation') {
            // Do some mapping because we use statistics to retrieve the data

            if (data.BusinessRelation) {
                const previousId = data.BusinessRelationID;
                data.BusinessRelation.Name = data.BusinessRelation.BusinessRelationName;
                data.BusinessRelation.ID = data.BusinessRelation.BusinessRelationID;
                data.BusinessRelationID = data.BusinessRelation.BusinessRelationID;

                // Empty the toBank control if new business is selected
                if (data.BusinessRelation.BusinessRelationID === null ||
                    data.BusinessRelationID !== previousId) {
                    data.ToBankAccountID = null;
                    data.ToBankAccount = null;
                }
            } else {
                data.BusinessRelationID = null;
                data.ToBankAccountID = null;
                data.ToBankAccount = null;
            }
        } else if (event.field === 'FromBankAccount') {
            if (data.FromBankAccount) {
                data.FromBankAccountID = data.FromBankAccount.ID;
            } else {
                data.FromBankAccountID = null;
            }
        } else if (event.field === 'ToBankAccount') {
            if (data.ToBankAccount) {
                data.ToBankAccountID = data.ToBankAccount.ID;
            } else {
                data.ToBankAccountID = null;
            }
        } else if (event.field === 'AmountCurrency') {
            if (data.CurrencyCodeID === this.companySettings.BaseCurrencyCodeID &&
                (data.CurrencyExchangeRate === null || data.CurrencyExchangeRate === 0)) {
                data.CurrencyExchangeRate = 1;
                data.Amount = data.AmountCurrency * data.CurrencyExchangeRate;
            } else if (data.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID &&
                (data.CurrencyExchangeRate === null || data.CurrencyExchangeRate === 0)) {
                rowOrPromise = this.getExternalCurrencyExchangeRate(data)
                    .then(row => this.calculateAmount(row));
            } else {
                data.Amount = data.AmountCurrency * data.CurrencyExchangeRate;
            }
        } else if (event.field === 'PaymentDate') {
            if (data.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID) {
                rowOrPromise = this.getExternalCurrencyExchangeRate(data)
                    .then(row => this.calculateAmount(row));
            }

        } else if (event.field === 'PaymentCode') {
            if (data.PaymentCode) {
                data.PaymentCodeID = data.PaymentCode.ID;
            } else {
                data.PaymentCodeID = null;
            }
        }

        // Return the updated row to the table
        return Promise.resolve(rowOrPromise || data)
            .then(row => {
                if (data.CurrencyCodeID === null ||
                    (data.CurrencyCodeID === this.companySettings.BaseCurrencyCodeID &&
                        (data.CurrencyExchangeRate === null || data.CurrencyExchangeRate === 0))) {
                    row.CurrencyCode = this.companySettings.BaseCurrencyCode;
                    row.CurrencyID = this.companySettings.BaseCurrencyCode.ID;
                    row.CurrencyExchangeRate = 1;
                }
                return row;
            });
    }

    private loadData() {
        const paymentCodeFilter = this.paymentCodeFilterValue.toString() !== '0' ?
            ` and PaymentCodeID eq ${this.paymentCodeFilterValue}` : '';

        this.paymentService.GetAll(`filter=IsCustomerPayment eq false and
            StatusCode eq 44001${paymentCodeFilter}&orderby=DueDate ASC`,
            ['ToBankAccount', 'ToBankAccount.CompanySettings', 'FromBankAccount',
                'BusinessRelation', 'PaymentCode', 'CurrencyCode'])
            .subscribe(data => {
                this.pendingPayments = data;
                // setTimeout(() => {
                //     this.calculateSums();
                // });

            },
            err => this.errorService.handle(err)
            );
    }

    public onPaymentCodeFilterChange(value: any) {
        const newValue = value.ID;
        // Find dirty elements - check that there are no changes before applying filter
        const tableData = this.table.getTableData();
        const dirtyRows = [];
        tableData.forEach(x => {
            if (x._isDirty) {
                dirtyRows.push(x);
            }
        });

        if (dirtyRows.length > 0) {
            const confirmModal = this.modalService.open(UniConfirmModalV2, {
                header: 'Ulagrede endringer',
                message: `Du har ${dirtyRows.length} ulagrede rader. Ønsker du å lagre før du fortsetter?`,
                buttonLabels: {
                    accept: 'Lagre',
                    reject: 'Forkast',
                    cancel: 'Avbryt'
                }
            });

            confirmModal.onClose.subscribe((response) => {
                if (response === ConfirmActions.ACCEPT) {
                    this.save().subscribe(
                        succes => {
                            this.paymentCodeFilterValue = newValue;
                            this.loadData();
                        },
                        error => this.toastService.addToast('Lagring feilet', ToastType.bad)
                    );
                } else if (response === ConfirmActions.REJECT) {
                    this.paymentCodeFilterValue = newValue;
                    this.loadData();
                } else {
                    return;
                }
            });
        } else {
            this.paymentCodeFilterValue = newValue;
            this.loadData();
        }
    }

    private getExternalCurrencyExchangeRate(rowModel: Payment): Promise<Payment> {
        const rowDate = rowModel.PaymentDate || new LocalDate();
        return new Promise(done => {
            if (rowModel.CurrencyCodeID === this.companySettings.BaseCurrencyCodeID &&
                (rowModel.CurrencyExchangeRate === null || rowModel.CurrencyExchangeRate === 0)) {
                rowModel.CurrencyExchangeRate = 1;
                done(rowModel);
            } else {
                const currencyDate = moment(rowDate).isAfter(moment()) ? new LocalDate() : rowDate;
                this.currencyService.getCurrencyExchangeRate(
                    rowModel.CurrencyCodeID,
                    this.companySettings.BaseCurrencyCodeID,
                    currencyDate
                )
                    .map(e => e.ExchangeRate)
                    .finally(() => done(rowModel))
                    .subscribe(
                        newExchangeRate => rowModel.CurrencyExchangeRate = newExchangeRate,
                        err => this.errorService.handle(err)
                    );
            }
        });
    }

    private save(): Observable<any> {
        const tableData = this.table.getTableData();

        // Find dirty elements
        const dirtyRows = [];
        tableData.forEach(x => {
            if (x._isDirty) {
                dirtyRows.push(x);
            }
        });

        // Set up observables (requests)
        const requests = [];

        dirtyRows.forEach(x => {
            requests.push(this.paymentService.Put(x.ID, x));
        });

        return requests.length > 0
            ? Observable.forkJoin(requests)
            : Observable.of(true);

    }

    public saveAndClose() {
        setTimeout(() => {
            this.save().subscribe(
                success => this.close(true),
                error => this.toastService.addToast('Lagring feilet', ToastType.bad)
            );
        });
    }

    private calculateAmount(rowModel: Payment): Payment {
        if (rowModel.AmountCurrency) {
            rowModel.Amount = rowModel.AmountCurrency * rowModel.CurrencyExchangeRate;
        } else {
            rowModel.Amount = null;
        }

        return rowModel;
    }

    public close(saved: boolean = false) {

        this.onClose.emit(saved);
    }
}
