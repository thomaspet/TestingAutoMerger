import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {StatisticsService, BankAccountService, BusinessRelationService, PaymentCodeService, PaymentService, PaymentBatchService, FileService} from '../../../services/services';
import {Bank, BankAccount, Payment, PaymentCode, BusinessRelation, PaymentBatch} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {IUniSaveAction} from '../../../../framework/save/save';
import {ISummaryConfig} from '../../common/summary/summary';
import {NumberFormat} from '../../../services/common/NumberFormatService';
import {ErrorService} from '../../../services/common/ErrorService';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {PaymentRelationsModal} from './relationModal';
import {BankAccountModal} from '../../common/modals/modals';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';

declare const moment;
declare const saveAs; // filesaver.js

@Component({
    selector: 'payment-list',
    templateUrl: 'app/components/bank/payments/paymentList.html',
})
export class PaymentList {
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(PaymentRelationsModal) private paymentRelationsModal: PaymentRelationsModal;
    @ViewChild(BankAccountModal) public bankAccountModal: BankAccountModal;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    private toolbarconfig: IToolbarConfig;
    private paymentTableConfig: UniTableConfig;
    private pendingPayments: Array<Payment> = [];
    private actions: IUniSaveAction[];
    private paymentCodes: PaymentCode[];
    private paymentCodeFilterValue: number = 0;

    private summary: ISummaryConfig[] = [];
    private summaryData = {
        SumPayments: 0,
        SumDue: 0,
        SumChecked: 0
    };

    private bankAccountChanged: any;

    constructor(private router: Router,
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
                private fileService: FileService) {

        this.tabService.addTab({ name: 'Betalinger', url: '/bank/payments', moduleID: UniModules.Payment, active: true });
    }

    public ngOnInit() {
        this.toolbarconfig = {
                title: 'Betalinger',
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

        this.setupPaymentTable();
        this.setSums();
        this.updateSaveActions();

        this.loadData();
    }

    private paymentChangeCallback(event) {
        var data = event.rowModel;

        data._isDirty = true;

        if (event.field === 'BusinessRelation') {
            // do some mapping because we use statistics to retrieve the data
            if (data.BusinessRelation) {
                data.BusinessRelation.Name = data.BusinessRelation.BusinessRelationName;
                data.BusinessRelation.ID = data.BusinessRelation.BusinessRelationID;
                data.BusinessRelationID = data.BusinessRelation.BusinessRelationID;
                data.ToBankAccountID = null;
                data.ToBankAccount = null;
            } else {
                data.BusinessRelationID = null;
                data.ToBankAccountID = null;
                data.ToBankAccount = null;
            }
        } else if (event.field === 'FromBankAccount') {
            if (data.FromBankAccount) {
                data.FromBankAccountID = data.FromBankAccount.ID
            } else {
                data.FromBankAccountID = null;
            }
        } else if (event.field === 'ToBankAccount') {
            if (data.ToBankAccount) {
                data.ToBankAccountID = data.ToBankAccount.ID
            } else {
                data.ToBankAccountID = null;
            }
        } else if (event.field === 'PaymentCode') {
            if (data.PaymentCode) {
                data.PaymentCodeID = data.PaymentCode.ID;
            } else {
                data.PaymentCodeID = null;
            }
        }

        return data;
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
            this.confirmModal.confirm(
                `Du har endret ${dirtyRows.length} rader som du ikke har lagret - vil du lagre før du fortsetter?`,
                'Ulagrede endringer',
                true
            ).then((action) => {
                if (action === ConfirmActions.ACCEPT) {
                    this.save((status) => {}, () => {
                        this.paymentCodeFilterValue = newValue;
                        this.loadData();
                    });
                } else if (action === ConfirmActions.REJECT) {
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
        let paymentCodeFilter = this.paymentCodeFilterValue.toString() !== '0' ? ` and PaymentCodeID eq ${this.paymentCodeFilterValue}` : '';

        this.paymentService.GetAll(`filter=StatusCode eq 44001${paymentCodeFilter}&orderby=DueDate ASC`, ['ToBankAccount', 'FromBankAccount', 'BusinessRelation', 'PaymentCode'])
            .subscribe(data => {
                this.pendingPayments = data;

                // let unitable update its datasource before calculating
                setTimeout(() => {
                    this.calculateSums();
                });

            },
            err => this.errorService.handle(err)
        );
    }

    private save(doneHandler: (status: string) => any, nextAction: () => any) {

        let tableData = this.table.getTableData();

        let selectedRows = this.table.getSelectedRows();

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

        let rowsWithOldDates = selectedRows.filter(x => moment(x.PaymentDate).isBefore(moment().startOf('day')));

        if (rowsWithOldDates.length > 0) {
            this.confirmModal.confirm(
                `Det er ${rowsWithOldDates.length} rader som har betalingsdato tilbake i tid. Vil du sette dagens dato automatisk?`,
                'Ugyldig betalingsdato',
                false,
                {accept: 'Sett dagens dato', reject: 'Avbryt og sett dato manuelt'}
            ).then((action) => {
                if (action === ConfirmActions.ACCEPT) {
                    rowsWithOldDates.forEach(x => {
                        x.PaymentDate = moment().toDate();
                        x._isDirty = true;
                        this.table.updateRow(x._originalIndex, x);
                    });

                    this.saveAndPayInternal(selectedRows, doneHandler);
                } else if (action === ConfirmActions.REJECT) {
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
            this.confirmModal.confirm(
                'Er du sikker på at du vil utbetale de valgte ' + selectedRows.length + ' betalinger?',
                'Bekreft utbetaling',
                false,
                {accept: 'Send til betaling', reject: 'Avbryt'}
            ).then((action) => {
                if (action === ConfirmActions.ACCEPT) {

                    let paymentIDs: Array<number> = [];
                    selectedRows.forEach(x => {
                        paymentIDs.push(x.ID);
                    });

                    // lag action for å generer batch for X betalinger
                    this.paymentService.createPaymentBatch(paymentIDs)
                        .subscribe((paymentBatch: PaymentBatch) => {
                            this.toastService.addToast(`Betalingsbunt ${paymentBatch.ID} opprettet, genererer utbetalingsfil...`, ToastType.good, 5);

                            // refresh list after paymentbatch has been generated
                            this.loadData();

                            // kjør action for å generere utbetalingsfil basert på batch
                            this.paymentBatchService.generatePaymentFile(paymentBatch.ID)
                                .subscribe((updatedPaymentBatch: PaymentBatch) => {

                                    if (updatedPaymentBatch.PaymentFileID) {
                                        this.toastService.addToast('Utbetalingsfil laget, henter fil...', ToastType.good, 5);

                                        this.fileService
                                            .downloadFile(updatedPaymentBatch.PaymentFileID, 'application/xml')
                                                .subscribe((blob) => {
                                                    doneHandler('Utbetalingsfil hentet');

                                                    // download file so the user can open it
                                                    saveAs(blob, `payments_${updatedPaymentBatch.ID}.xml`);
                                                },
                                                err => {
                                                    doneHandler('Feil ved henting av utbetalingsfil');
                                                    this.errorService.handle(err)
                                                }
                                            );
                                    } else {
                                        this.toastService.addToast('Fant ikke utbetalingsfil, ingen PaymentFileID definert', ToastType.bad, 0);
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

                } else if (action === ConfirmActions.REJECT) {
                    doneHandler('Utbetaling avbrutt');
                }
            });
        });
    }

    private deleteSelected(doneHandler: (string) => any) {
        let selectedRows = this.table.getSelectedRows();

        if (selectedRows.length === 0) {
            alert('Ingen rader er valgt - kan ikke slette noe');
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

        this.confirmModal.confirm(
                'Er du sikker på at du vil slette ' + selectedRows.length + ' betalinger?',
                'Bekreft sletting',
                false
            ).then((action) => {
                if (action === ConfirmActions.ACCEPT) {
                    let requests = [];
                    selectedRows.forEach(x => {
                        requests.push(this.paymentService.Remove(x.ID, x));
                    });

                    Observable.forkJoin(requests)
                        .subscribe(resp => {
                            this.toastService.addToast('Betalinger slettet', ToastType.good, 5);
                            doneHandler('Betalinger slettet');

                            // refresh data after save
                            this.loadData();

                        }, (err) => {
                            doneHandler('Feil ved sletting av data');
                            this.errorService.handle(err);
                        });
                } else if (action === ConfirmActions.REJECT) {
                    doneHandler('Sletting avbrutt');
                }
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
            .setTemplate(data => data.BusinessRelation ? data.BusinessRelation.Name : '')
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
        let amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money);
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
                addNewButtonCallback:  (text) => {
                    return new Promise((resolve, reject) => {
                        let bankaccount = new BankAccount();
                        bankaccount.AccountNumber = text;
                        bankaccount['_createguid'] = this.bankAccountService.getNewGuid();
                        bankaccount.BankAccountType = '-';

                        let currentRow = this.table.getCurrentRow();

                        bankaccount.BusinessRelationID = currentRow.BusinessRelationID;
                        bankaccount.ID = 0;

                        if (this.bankAccountChanged) {
                            this.bankAccountChanged.unsubscribe();
                        }

                        this.bankAccountModal.openModal(bankaccount, false);

                        this.bankAccountChanged = this.bankAccountModal.Changed.subscribe((changedBankaccount) => {
                            this.bankAccountChanged.unsubscribe();

                            // Save bank account and resolve saved object
                            this.bankAccountService.Post(changedBankaccount)
                                .subscribe(savedAccount => {
                                    resolve(savedAccount);
                                }, err => {
                                    reject('Error saving bank account');
                                    this.errorService.handle(err);
                                });
                        });
                    });
                }
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

    public canDeactivate(): boolean|Promise<boolean> {
        // find dirty elements
        let tableData = this.table.getTableData();
        let dirtyRows = [];
        tableData.forEach(x => {
            if (x._isDirty) {
                dirtyRows.push(x);
            }
        });

        if (dirtyRows.length === 0) {
            return true;
        }

        return new Promise<boolean>((resolve, reject) => {
            this.confirmModal.confirm(
                `Du har endret ${dirtyRows.length} rader som du ikke har lagret - vil du lagre før du fortsetter?`,
                'Ulagrede endringer',
                true
            ).then((action) => {
                if (action === ConfirmActions.ACCEPT) {
                    this.save((status) => {}, () => {
                        resolve(true);
                    });
                } else if (action === ConfirmActions.REJECT) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
}
