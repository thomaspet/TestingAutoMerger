import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {BankAccount, Payment, PaymentCode, PaymentBatch, LocalDate, CompanySettings} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {IUniSaveAction} from '../../../../framework/save/save';
import {ISummaryConfig} from '../../common/summary/summary';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {PaymentRelationsModal} from './relationModal';
import {BankPaymentSummaryData} from '../../../models/accounting/BankPaymentSummaryData';
import {
    NumberFormat,
    ErrorService,
    StatisticsService,
    BankAccountService,
    BusinessRelationService,
    PaymentCodeService,
    PaymentService,
    PaymentBatchService,
    FileService,
    CompanySettingsService,
    CurrencyService,
} from '../../../services/services';
import {
    UniModalService,
    UniConfirmModalV2,
    UniBankAccountModal,
    ConfirmActions
} from '../../../../framework/uniModal/barrel';

import {saveAs} from 'file-saver';
import * as moment from 'moment';

@Component({
    selector: 'payment-list',
    templateUrl: './paymentList.html',
})
export class PaymentList {
    @ViewChild(UniTable)
    private table: UniTable;

    @ViewChild(PaymentRelationsModal)
    private paymentRelationsModal: PaymentRelationsModal;

    private toolbarconfig: IToolbarConfig;
    private paymentTableConfig: UniTableConfig;
    private pendingPayments: Array<Payment> = [];
    private actions: IUniSaveAction[];
    private paymentCodes: PaymentCode[];
    private paymentCodeFilterValue: number = 0;
    private companySettings: CompanySettings;

    private summary: ISummaryConfig[] = [];
    private summaryData: BankPaymentSummaryData = {
        SumPayments: 0,
        SumDue: 0,
        SumChecked: 0
    };

    constructor(
        private router: Router,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private tabService: TabService,
        private toastService: ToastService,
        private numberFormatService: NumberFormat,
        private bankAccountService: BankAccountService,
        private businessRelationService: BusinessRelationService,
        private paymentCodeService: PaymentCodeService,
        private paymentService: PaymentService,
        private paymentBatchService: PaymentBatchService,
        private fileService: FileService,
        private companySettingsService: CompanySettingsService,
        private currencyService: CurrencyService,
        private modalService: UniModalService) {

        this.tabService.addTab({
            name: 'Betalinger', url: '/bank/payments',
            moduleID: UniModules.Payment, active: true
        });
    }

    public ngOnInit() {
        this.toolbarconfig = {
            title: 'Utbetalingsliste',
            subheads: [],
            navigation: {}
        };

        this.paymentCodeService.GetAll(null)
            .subscribe(data => {
                let emptyPaymentCodeOption = new PaymentCode();
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
                this.setupPaymentTable();
                this.setSums();
                this.updateSaveActions();

                this.loadData();
            },
            err => this.errorService.handle(err)
            );
    }

    private paymentChangeCallback(event) {
        var data = event.rowModel;

        data._isDirty = true;

        let rowOrPromise: Promise<any> | any;

        if (event.field === 'BusinessRelation') {
            // do some mapping because we use statistics to retrieve the data

            if (data.BusinessRelation) {
                let previousId = data.BusinessRelationID;
                data.BusinessRelation.Name = data.BusinessRelation.BusinessRelationName;
                data.BusinessRelation.ID = data.BusinessRelation.BusinessRelationID;
                data.BusinessRelationID = data.BusinessRelation.BusinessRelationID;

                //Empty the toBank control if new business is selected
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
            }
            else if (data.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID &&
                (data.CurrencyExchangeRate === null || data.CurrencyExchangeRate === 0)) {
                rowOrPromise = this.getExternalCurrencyExchangeRate(data)
                    .then(row => this.calculateAmount(row));
            }
            else {
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
    };

    private calculateAmount(rowModel: Payment): Payment {
        if (rowModel.AmountCurrency) {
            rowModel.Amount = rowModel.AmountCurrency * rowModel.CurrencyExchangeRate;
        } else {
            rowModel.Amount = null;
        }

        return rowModel;
    }


    private getExternalCurrencyExchangeRate(rowModel: Payment): Promise<Payment> {
        let rowDate = rowModel.PaymentDate || new LocalDate();
        return new Promise(done => {
            if (rowModel.CurrencyCodeID === this.companySettings.BaseCurrencyCodeID &&
                (rowModel.CurrencyExchangeRate === null || rowModel.CurrencyExchangeRate === 0)) {
                rowModel.CurrencyExchangeRate = 1;
                done(rowModel);
            } else {
                let currencyDate = moment(rowDate).isAfter(moment()) ? new LocalDate() : rowDate;
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
                    )
            }
        });
    }

    private onPaymentCodeFilterChange(newValue: number) {
        // find dirty elements - check that there are no changes before applying filter
        let tableData = this.table.getTableData();
        let dirtyRows = [];
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
                    this.save(() => {}, () => {
                        this.paymentCodeFilterValue = newValue;
                        this.loadData();
                    });
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

    private loadData() {
        let paymentCodeFilter = this.paymentCodeFilterValue.toString() !== '0' ?
            ` and PaymentCodeID eq ${this.paymentCodeFilterValue}` : '';

        this.paymentService.GetAll(`filter=IsCustomerPayment eq false and StatusCode eq 44001${paymentCodeFilter}&orderby=DueDate ASC`,
            ['ToBankAccount', 'ToBankAccount.CompanySettings', 'FromBankAccount',
                'BusinessRelation', 'PaymentCode', 'CurrencyCode'])
            .subscribe(data => {
                this.pendingPayments = data;
                setTimeout(() => {
                    this.calculateSums();
                });

            },
            err => this.errorService.handle(err)
            );
    }

    private save(doneHandler: (status: string) => any, nextAction: () => any) {

        let tableData = this.table.getTableData();

        // find dirty elements
        let dirtyRows = [];
        tableData.forEach(x => {
            if (x._isDirty) {
                dirtyRows.push(x);
            }
        });

        // set up observables (requests)
        let requests = [];

        dirtyRows.forEach(x => {
            requests.push(this.paymentService.Put(x.ID, x));
        });

        if (requests.length > 0) {
            Observable.forkJoin(requests)
                .subscribe(resp => {
                    if (!nextAction) {
                        doneHandler('Lagret endringer');

                        // refresh data after save
                        this.loadData();

                    } else {
                        nextAction();
                    }
                }, (err) => {
                    doneHandler('Feil ved lagring av data');
                    this.errorService.handle(err);
                });
        } else {
            if (!nextAction) {
                doneHandler('Ingen endringer funnet');
            } else {
                nextAction();
            }
        }
    }

    private validateBeforePay(selectedRows: Array<Payment>): boolean {
        let errorMessages: string[] = [];

        let paymentsWithoutFromAccount = selectedRows.filter(x => !x.FromBankAccount);
        if (paymentsWithoutFromAccount.length > 0) {
            errorMessages.push(`Det er ${paymentsWithoutFromAccount.length} rader som mangler fra-konto`);
        }

        let paymentsWithoutToAccount = selectedRows.filter(x => !x.ToBankAccount);
        if (paymentsWithoutToAccount.length > 0) {
            errorMessages.push(`Det er ${paymentsWithoutToAccount.length} rader som mangler til-konto`);
        }

        let paymentsWithoutPaymentCode = selectedRows.filter(x => !x.PaymentCode);
        if (paymentsWithoutPaymentCode.length > 0) {
            errorMessages.push(`Det er ${paymentsWithoutPaymentCode.length} rader som mangler type`);
        }

        if (errorMessages.length > 0) {
            this.toastService.addToast('Feil ved validering', ToastType.bad, 0, errorMessages.join('\n\n'));
            return false;
        }

        return true;
    }

    private saveAndPay(doneHandler: (status: string) => any) {
        let selectedRows = this.table.getSelectedRows();

        if (selectedRows.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke linjer du vil utbetale, eller kryss av for alle'
            );

            doneHandler('Lagring/utbetaling avbrutt');
            return;
        }

        if (!this.validateBeforePay(selectedRows)) {
            doneHandler('Feil ved validering, lagring avbrutt');
            return;
        }

        let rowsWithOldDates: any[] = selectedRows.filter(x => moment(x.PaymentDate).isBefore(moment().startOf('day')));

        if (rowsWithOldDates.length > 0) {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Ugyldig betalingsdato',
                message: `Det er ${rowsWithOldDates.length} rader som har betalingsdato tilbake i tid. Vil du sette dagens dato autmatisk?`,
                buttonLabels: {accept: 'Sett dagens dato', reject: 'Avbryt og sett dato manuelt'}
            });

            modal.onClose.subscribe((result) => {
                if (result === ConfirmActions.ACCEPT) {
                    rowsWithOldDates.map(row => {
                        row.PaymentDate = new LocalDate(new Date());
                        row._isDirty = true;
                        this.table.updateRow(row._originalIndex, row);
                    });
                } else {
                    doneHandler('Lagring avbrutt');
                }
            });
        } else {
            this.saveAndPayInternal(selectedRows, doneHandler);
        }
    }

    private saveAndPayInternal(selectedRows: Array<Payment>, doneHandler: (status: string) => any) {
        // save first, then run action
        this.save(doneHandler, () => {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Bekreft utbetaling',
                message: `Er du sikker på at du vil utbetale de valgte ${selectedRows.length} radene?`,
                buttonLabels: {accept: 'Send til betaling', cancel: 'Avbryt'}
            });

            modal.onClose.subscribe((response) => {
                if (response === ConfirmActions.REJECT) {
                    doneHandler('Utbetaling avbrutt');
                    return;
                }

                let paymentIDs: number[] = [];
                selectedRows.forEach(x => {
                    paymentIDs.push(x.ID);
                });

                // lag action for å generer batch for X betalinger
                this.paymentService.createPaymentBatch(paymentIDs)
                    .subscribe((paymentBatch: PaymentBatch) => {
                        this.toastService.addToast(
                            `Betalingsbunt ${paymentBatch.ID} opprettet, genererer utbetalingsfil...`,
                            ToastType.good, 5
                        );

                        // refresh list after paymentbatch has been generated
                        this.loadData();

                        // kjør action for å generere utbetalingsfil basert på batch
                        this.paymentBatchService.generatePaymentFile(paymentBatch.ID)
                            .subscribe((updatedPaymentBatch: PaymentBatch) => {
                                if (updatedPaymentBatch.PaymentFileID) {
                                    this.toastService.addToast(
                                        'Utbetalingsfil laget, henter fil...',
                                        ToastType.good, 5
                                    );

                                    this.fileService
                                        .downloadFile(updatedPaymentBatch.PaymentFileID, 'application/xml')
                                        .subscribe((blob) => {
                                            doneHandler('Utbetalingsfil hentet');

                                            // download file so the user can open it
                                            saveAs(blob, `payments_${updatedPaymentBatch.ID}.xml`);
                                        },
                                        err => {
                                            doneHandler('Feil ved henting av utbetalingsfil');
                                            this.errorService.handle(err);
                                        });
                                } else {
                                    this.toastService.addToast(
                                        'Fant ikke utbetalingsfil, ingen PaymentFileID definert',
                                        ToastType.bad
                                    );

                                    doneHandler('Feil ved henting av utbetalingsfil');
                                }
                            },
                            err => {
                                doneHandler('Feil ved generering av utbetalingsfil');
                                this.errorService.handle(err);
                            });
                    },
                    err => {
                        doneHandler('Feil ved opprettelse av betalingsbunt');
                        this.errorService.handle(err);
                    });
            });
        });
    }

    private deleteSelected(doneHandler: (status: string) => any) {
        let selectedRows = this.table.getSelectedRows();

        if (selectedRows.length === 0) {
            this.toastService.addToast('Ingen rader', ToastType.warn, 5, 'Ingen rader er valgt - kan ikke slette noe');
            doneHandler('Sletting avbrutt');
            return;
        }

        // find dirty elements - check that there are no changes to rows that are not marked
        let tableData = this.table.getTableData();
        let dirtyRows = [];
        tableData.forEach(x => {
            if (x._isDirty) {
                dirtyRows.push(x);
            }
        });

        let changedNotMarkedRows = [];
        dirtyRows.forEach(row => {
            if (!selectedRows.find(x => x.ID === row.ID)) {
                changedNotMarkedRows.push(row);
            }
        });

        if (changedNotMarkedRows.length > 0) {
            if (!confirm(`Du har gjort endringer i ${changedNotMarkedRows.length} rader som ikke er merket for sletting, disse endringene vil forkastes\nVil du fortsette?`)) {
                doneHandler('Sletting avbrutt');
                return;
            }
        }

        const modal = this.modalService.open(UniConfirmModalV2, {
            header: 'Bekreft sletting',
            message: `Er du sikker på at du vil slette ${selectedRows.length} betalinger?`,
            buttonLabels: {accept: 'Slett', cancel: 'Avbryt'}
        });

        modal.onClose.subscribe(result => {
            if (result === ConfirmActions.CANCEL) {
                doneHandler('Sletting avbrutt');
                return;
            }

            let requests = [];
            selectedRows.forEach(x => {
                requests.push(this.paymentService.Remove(x.ID, x));
            });

            Observable.forkJoin(requests).subscribe(response => {
                this.toastService.addToast('Betalinger slettet', ToastType.good, 5);
                doneHandler('Betalinger slettet');

                // refresh data after save
                this.loadData();
            }, (err) => {
                doneHandler('Feil ved sletting av data');
                this.errorService.handle(err);
            });
        });
    }

    private setSums() {
        this.summary = [{
            value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumPayments) : null,
            title: 'Totalt til betaling',
        }, {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumDue) : null,
                title: 'Totalt forfalt',
            }, {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumChecked) : null,
                title: 'Totalt avkrysset',
            }
        ];
    }

    private calculateSums() {
        this.summaryData.SumChecked = 0;
        this.summaryData.SumDue = 0;
        this.summaryData.SumPayments = 0;

        let payments = this.table.getTableData();
        payments.forEach(x => {
            this.summaryData.SumPayments += x.Amount;
            if (moment(x.DueDate).isBefore(moment())) {
                this.summaryData.SumDue += x.Amount;
            }
        });

        this.setSums();
    }

    private onRowSelected(data) {
        this.summaryData.SumChecked = 0;
        let selectedRows = this.table.getSelectedRows();

        selectedRows.forEach(x => {
            this.summaryData.SumChecked += x.Amount;
        });

        this.setSums();
    }

    private onRowChanged(event) {
        this.calculateSums();
    }

    private setupPaymentTable() {
        let paymentDateCol = new UniTableColumn('PaymentDate', 'Betalingsdato', UniTableColumnType.LocalDate);
        let payToCol = new UniTableColumn('BusinessRelation', 'Betales til', UniTableColumnType.Lookup)
            .setTemplate(data => {
                return data.BusinessRelationID === null && data.ToBankAccount ? data.ToBankAccount.CompanySettings.CompanyName : data.BusinessRelation.Name;
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.CustomerID ? 'Kunde: ' : selectedItem.SupplierID ? 'Leverandør: ' : selectedItem.EmployeeID ? 'Ansatt: ' : '')
                        + selectedItem.BusinessRelationName;
                },
                lookupFunction: (query: string) => {
                    return this.statisticsService.GetAll(
                        `model=BusinessRelation&select=BusinessRelation.ID,BusinessRelation.Name,Customer.ID,Supplier.ID,Employee.ID&join=Customer on BusinessRelation.ID eq Customer.BusinessRelationID Supplier on BusinessRelation.ID eq Supplier.BusinessRelationID Employee on BusinessRelation.ID eq Employee.BusinessRelationID&filter=BusinessRelation.Deleted eq 'false' and contains(BusinessRelation.Name,'${query}') and (isnull(Customer.ID,0) ne 0 or isnull(Supplier.ID,0) ne 0 or isnull(Employee.ID,0) ne 0)&top=20`
                    ).map(x => x.Data ? x.Data : []);
                }
            });

        let currencyCodeCol = new UniTableColumn('CurrencyCode', 'Valuta', UniTableColumnType.Text, false)
            .setDisplayField('CurrencyCode.Code')
            .setWidth('5%')
            .setVisible(false);

        let amountCurrencyCol = new UniTableColumn('AmountCurrency', 'Beløp', UniTableColumnType.Money);

        let amountCol = new UniTableColumn('Amount', `Beløp (${this.companySettings.BaseCurrencyCode.Code})`, UniTableColumnType.Money)
            .setSkipOnEnterKeyNavigation(true)
            .setVisible(false)
            .setEditable(false);

        let fromAccountCol = new UniTableColumn('FromBankAccount', 'Konto fra', UniTableColumnType.Lookup)
            .setDisplayField('FromBankAccount.AccountNumber')
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber);
                },
                lookupFunction: (query: string) => {
                    return this.bankAccountService.GetAll(
                        `filter=CompanySettingsID eq 1 and contains(AccountNumber,'${query}')&top=20`
                    );
                }
            });
        let toAccountCol = new UniTableColumn('ToBankAccount', 'Konto til', UniTableColumnType.Lookup)
            .setDisplayField('ToBankAccount.AccountNumber')
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber);
                },
                lookupFunction: (query: string) => {
                    let currentRow = this.table.getCurrentRow();

                    return this.bankAccountService.GetAll(
                        `filter=BusinessRelationID eq ${currentRow.BusinessRelationID} and contains(AccountNumber,'${query}')&top=20`
                    );
                },
                addNewButtonVisible: true,
                addNewButtonText: 'Legg til bankkonto',
                addNewButtonCallback: (text) => new Promise((resolve, reject) => {
                    let currentRow = this.table.getCurrentRow();
                    let bankAccount = new BankAccount();
                    bankAccount.BusinessRelationID = currentRow.BusinessRelationID;
                    bankAccount['_createguide'] = this.bankAccountService.getNewGuid();
                    bankAccount.BankAccountType = '-';

                    const modal = this.modalService.open(UniBankAccountModal, {
                        data: bankAccount
                    });

                    modal.onClose.subscribe((account) => {
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
                })
            });

        let paymentIDCol = new UniTableColumn('PaymentID', 'KID', UniTableColumnType.Text);
        let dueDateCol = new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.LocalDate)
            .setConditionalCls(payment => moment(payment.DueDate).isBefore(moment()) ? 'payment-due' : '');
        let paymentCodeCol = new UniTableColumn('PaymentCode', 'Type', UniTableColumnType.Lookup)
            .setDisplayField('PaymentCode.Name')
            .setVisible(false)
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.Name);
                },
                lookupFunction: (query: string) => {
                    return this.paymentCodeService.GetAll(
                        `filter=contains(Name,'${query}')&top=20`
                    );
                }
            });

        let descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text).setVisible(false);

        // Setup table
        this.paymentTableConfig = new UniTableConfig(true, true, 25)
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
            .setContextMenu([
                {
                    action: (item) => this.paymentRelationsModal.openModal(item.ID),
                    disabled: (item) => false,
                    label: 'Vis relasjoner'
                }
            ])
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumnMenuVisible(true)
            .setAutoAddNewRow(false)
            .setSearchable(true);
    }

    private updateSaveActions() {
        this.actions = [];

        this.actions.push({
            label: 'Lagre endringer (uten å betale)',
            action: (done) => {
                this.save(done, null);
            },
            main: false,
            disabled: false
        });

        this.actions.push({
            label: 'Lagre endringer og utbetal valgte',
            action: (done) => {
                this.saveAndPay(done);
            },
            main: true,
            disabled: false
        });

        this.actions.push({
            label: 'Slett valgte elementer',
            action: (done) => this.deleteSelected(done),
            disabled: false
        });
    }

    public canDeactivate(): boolean | Promise<boolean> {
        // find dirty elements
        let tableData = this.table.getTableData();
        let dirtyRows = [];
        tableData.forEach(x => {
            if (x._isDirty) {
                dirtyRows.push(x);
            }
        });

        console.log('candeactivate', dirtyRows, tableData);

        if (!dirtyRows.length) {
            return true;
        }

        const modal = this.modalService.open(UniConfirmModalV2, {
            header: 'Ulagrede endringer',
            message: `Du har ${dirtyRows.length} rader som ikke er lagret. Vil du lagre før du fortsetter?`,
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast endringer',
                cancel: 'Avbryt'
            }
        });

        return new Promise((resolve, reject) => {
            modal.onClose.subscribe((response) => {
                if (response === ConfirmActions.ACCEPT) {
                    this.save((status) => {}, () => {
                        resolve(true);
                    });
                } else if (response === ConfirmActions.REJECT) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
}
