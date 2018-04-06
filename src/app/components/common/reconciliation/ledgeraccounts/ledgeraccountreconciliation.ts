import {Component, ViewChild, Input, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {StatusCodeJournalEntryLine,
    LocalDate, JournalEntryLinePostPostData,
    JournalEntryLine, Payment, BusinessRelation,
    BankAccount, i18nModule, Customer, CompanySettings, Paycheck, PaymentCode} from '../../../../unientities';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    UniTableColumnSortMode
} from '../../../../../framework/ui/unitable/index';
import {INumberOptions} from '../../../../../framework/ui/uniform/index';
import {ISummaryConfig} from '../../../common/summary/summary';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {UniModalService, ConfirmActions} from '../../../../../framework/uni-modal';
import {exportToFile, arrayToCsv} from '../../../common/utils/utils';
import {
    ErrorService,
    StatisticsService,
    JournalEntryLineService,
    PostPostService,
    NumberFormat,
    JournalEntryService,
    PaymentService,
    CustomerService,
    BankAccountService,
    CompanySettingsService
} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';
import { JournalEntryData } from '@app/models/models';
import { AddPaymentModal } from '@app/components/common/modals/addPaymentModal';
import { RequestMethod } from '@angular/http';
import { JournalEntryLineCouple } from '@app/services/accounting/postPostService';
declare var _;


@Component({
    selector: 'ledger-account-reconciliation',
    templateUrl: './ledgeraccountreconciliation.html',
})
export class LedgerAccountReconciliation {
    @Input()
    public supplierID: number;

    @Input()
    public customerID: number;

    @Input()
    public accountID: number;

    @Input()
    public pointInTime: LocalDate;

    @Input()
    public autoLocking: boolean = true;

    @Input()
    public hideHeader: boolean = false;

    @Input()
    public modalMode: boolean = false;

    @Output()
    public allSelectedLocked: EventEmitter<boolean> = new EventEmitter();

    @ViewChild(UniTable)
    private table: UniTable;

    public canAutoMark: boolean = false;
    private showMarkedEntries: boolean = false;
    private uniTableConfig: UniTableConfig;
    private journalEntryLines: Array<any> = [];

    public itemsSummaryData: any = {};

    public validationResult: any;
    public summary: ISummaryConfig[];

    private currentMarkingSession: Array<any> = [];
    private allMarkingSessions: Array<JournalEntryLineCouple> = [];
    private currentSelectedRows: Array<any> = [];

    public isDirty: boolean = false;
    private busy: boolean = false;

    private displayPostsOption: string = 'OPEN';

    private summaryData: any = {
        SumOpen: 0,
        SumOpenDue: 0,
        SumChecked: 0
    };

    constructor(
        private router: Router,
        private statisticsService: StatisticsService,
        private journalEntryLineService: JournalEntryLineService,
        private postPostService: PostPostService,
        private errorService: ErrorService,
        private numberFormatService: NumberFormat,
        private sanitizer: DomSanitizer,
        private toastService: ToastService,
        private journalEntryService: JournalEntryService,
        private modalService: UniModalService,
        private paymentService: PaymentService,
        private customerService: CustomerService,
        private bankaccountService: BankAccountService,
        private companySettingsService: CompanySettingsService
    ) {}

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['autoLocking'] && changes['autoLocking'].currentValue) {
                if (this.currentMarkingSession.length >= 2) {
                    let currentSessionSum = 0;
                    this.currentMarkingSession.forEach(x => {
                        currentSessionSum += x.RestAmount;
                    });

                    if (currentSessionSum === 0) {
                        this.closeMarkingSession();
                    }
                }
        }

        if (!changes['autoLocking']) {
            this.loadData();
        }
    }

    private loadData() {
        this.canAutoMark = false;
        if (this.customerID || this.supplierID || this.accountID) {
            this.busy = true;
            this.setupUniTable();
        } else {
            this.journalEntryLines = [];
        }
    }

    private calculateSums() {
        this.summaryData.SumChecked = 0;
        this.summaryData.SumOpenDue = 0;
        this.summaryData.SumOpen = 0;

        setTimeout(() => {
            const posts = this.table.getTableData();

            posts.forEach(x => {
                if (x.StatusCode !== StatusCodeJournalEntryLine.Marked) {
                    this.summaryData.SumOpen += x.RestAmount;
                    if (x.DueDate && moment(x.DueDate).isBefore(moment())) {
                        this.summaryData.SumOpenDue += x.RestAmount;
                    }
                }
            });

            this.setSums();
        });
    }

    public onRowSelected(data) {
        if (data) {
            const rowModel = data.rowModel;
            if (!rowModel.Markings) {
                rowModel.Markings = [];
            }

            const isSelected = rowModel._rowSelected;

            if (isSelected) {
                const currentMarkingsWithDifferentCurrencyCode =
                    this.currentMarkingSession.filter(x => x.CurrencyCodeID !== rowModel.CurrencyCodeID);

                if (currentMarkingsWithDifferentCurrencyCode.length > 0) {
                    this.toastService.addToast(
                        'Kan ikke markere rader med forskjellig valuta',
                        ToastType.bad,
                        ToastTime.medium,
                        'Du kan bare markere rader som har samme valuta. '
                        + 'Lag eventuelt motposteringer for å få riktig valuta og agiopostering'
                    );

                    rowModel._rowSelected = false;
                    this.table.updateRow(rowModel._originalIndex, rowModel);

                    return;
                }

                let currentSessionSum = 0;
                this.currentMarkingSession.forEach(x => {
                    currentSessionSum += x.RestAmount;
                });

                currentSessionSum += rowModel.RestAmount;

                const sumPositive = _.sumBy(this.currentMarkingSession
                    .filter(x => x.RestAmount > 0), x => x.RestAmount);
                const sumNegative = _.sumBy(this.currentMarkingSession
                    .filter(x => x.RestAmount < 0), x => x.RestAmount);
                const countPositive = this.currentMarkingSession.filter(x => x.RestAmount > 0).length;
                const countNegative = this.currentMarkingSession.filter(x => x.RestAmount < 0).length;

                let didSwitchAfterLastSelection: boolean = false;

                if (
                    (sumPositive < Math.abs(sumNegative)
                    && (sumPositive + rowModel.RestAmount) > Math.abs(sumNegative))
                    || (sumPositive > Math.abs(sumNegative)
                    && (sumPositive + rowModel.RestAmount) < Math.abs(sumNegative))
                ) {
                    didSwitchAfterLastSelection = true;
                }

                if (rowModel.StatusCode === StatusCodeJournalEntryLine.Marked) {
                    // row is already marked, dont do anything else here - the user is probably going
                    // to unmark a marked line. Let's help the user by selecting related rows for him
                    if (rowModel.Markings && rowModel.Markings.length > 0) {
                        const tableData = this.table.getTableData();

                        rowModel.Markings.forEach(line => {
                            const otherRow = tableData.find(x => x.ID === line.ID);

                            if (otherRow && !otherRow._rowSelected) {
                                otherRow._rowSelected = true;
                                this.table.updateRow(otherRow._originalIndex, otherRow);
                            }
                        });
                    }
                } else if (countPositive === 0 && countNegative === 0 && rowModel.RestAmount === 0) {
                    // user selected a row with 0 as RestAmount - just close it
                    this.addToCurrentMarkingSession(rowModel);
                    this.closeMarkingSession();
                } else if (currentSessionSum === 0) {
                    // TODO: Add some slack here - allow for e.g. differences of 5 kr ??
                    this.addToCurrentMarkingSession(rowModel);
                    if (this.autoLocking) {
                        this.closeMarkingSession();
                    }
                } else if ((countPositive === 0 && rowModel.RestAmount < 0)
                    || (countNegative === 0 && rowModel.RestAmount > 0)) {
                    // Only negative or only positive amounts are crossed, so they don't balance.
                    // Just add the item to the list and wait for next input from user
                    this.addToCurrentMarkingSession(rowModel);
                } else if (didSwitchAfterLastSelection) {
                    // close marking with the selected item included, this will
                    // cause a restamount on one of the selected lines
                    this.addToCurrentMarkingSession(rowModel);
                    this.closeMarkingSession();
                } else if (
                    ((countPositive === 0 && rowModel.RestAmount > 0)
                    || (countPositive === 1 && rowModel.RestAmount < 0))
                    && ((countNegative === 0 && rowModel.RestAmount < 0)
                    || (countNegative === 1 && rowModel.RestAmount > 0))
                ) {
                    // One positive and one negative amount are crossed, but the don't balance.
                    // Just add the item to the list and wait for next input from user
                    this.addToCurrentMarkingSession(rowModel);
                } else {
                    if ((countPositive > 1 || (countPositive > 0 && rowModel.RestAmount > 0))
                            && (countNegative > 1 || (countNegative > 0 && rowModel.RestAmount < 0))) {
                        // make an assumption here, and just close the exising markings - we cannot have multiple Open
                        // negative and positive amounts at the same time
                        this.closeMarkingSession();
                        this.addToCurrentMarkingSession(rowModel);
                    } else {
                        // we have just added more items to be mached, e.g. first 1000, then -250 and -300
                        this.addToCurrentMarkingSession(rowModel);
                    }
                }
            } else {
                // If the row was in a markingsession, remove it if the user unselects the row.
                // It could also be that the user had selected a row that was already marked - if so
                // nothing will happen if it is deselected (the user needs to manually use the unlock
                // button if that was the intent)
                this.currentMarkingSession = this.currentMarkingSession.filter(x => x.ID !== rowModel.ID);
                if (this.autoLocking) {
                    let currentSessionSum = 0;
                    this.currentMarkingSession.forEach(x => {
                        currentSessionSum += x.RestAmount;
                    });

                    if (currentSessionSum === 0) {
                        this.closeMarkingSession();
                    }
                }

            }
        }

        this.summaryData.SumChecked = 0;

        setTimeout(() => {
            this.currentSelectedRows = this.table.getSelectedRows();

            this.allSelectedLocked.emit(
                this.currentSelectedRows.length > 0
                && this.currentSelectedRows.reduce((p, c) => c.Markings !== null && p, true)
            );

            this.currentSelectedRows.forEach(x => {
                this.summaryData.SumChecked += x.RestAmount;
            });

            this.setSums();
        });
    }

    public export() {
        this.exportLines(this.journalEntryLines);
    }

    public exportAll(register: string) {
        this.journalEntryLineService.getJournalEntryLinePostPostData(
            this.displayPostsOption !== 'MARKED',
            this.displayPostsOption !== 'OPEN',
            (register === 'customer') ? -1 : null,
            (register === 'supplier') ? -1 : null,
            (register === 'account') ? -1 : null,
            this.pointInTime)
            .subscribe((lines: Array<JournalEntryLinePostPostData>) => {
                this.exportLines(lines);
            },
            (err) => this.errorService.handle(err)
        );
    }

    private exportLines(lines: Array<JournalEntryLinePostPostData>) {
        const list = [];
        const moneyFormat: INumberOptions = {
            thousandSeparator: '',
            decimalSeparator: ',',
            decimalLength: 2
        };

        if (lines && lines.length > 0) {
            lines.forEach((line: JournalEntryLinePostPostData) => {
                const row = {
                    JournalEntryNumber: line.JournalEntryNumber,
                    FinancialDate: line.FinancialDate ? moment(line.FinancialDate).format().substr(0, 10) : '',
                    SubAccountNumber: line.SubAccountNumber,
                    SubAccountName: line.SubAccountName,
                    InvoiceNumber: line.InvoiceNumber ? line.InvoiceNumber : '',
                    DueDate: line.DueDate ? moment(line.DueDate).format().substr(0, 10) : '',
                    Amount: this.numberFormatService.asMoney(line.Amount, moneyFormat),
                    RestAmount: this.numberFormatService.asMoney(line.RestAmount, moneyFormat),
                    Description: line.Description,
                    Status: this.journalEntryLineService.getStatusText(line.StatusCode),
                    NumberOfPayments: line.NumberOfPayments,
                    Markings: this.getMarkingsText(line)
                };
                list.push(row);
            });

            exportToFile(arrayToCsv(list, ['JournalEntryNumber']), `OpenPosts.csv`);
        } else {
            this.toastService.addToast('Ingen poster',
                ToastType.warn,
                ToastTime.medium,
                'Det er ingen poster å eksportere'
            );
        }
    }

    public autoMarkJournalEntries() {
        if (this.allMarkingSessions.length > 0) {
            this.toastService.addToast('Kan ikke kjøre automerking',
                ToastType.bad,
                ToastTime.medium,
                'Du har gjort endringer som ikke er lagret - lagre disse før du kjører automerking'
            );
            return;
        }

        const tableData = this.table.getTableData();

        this.canAutoMark = false;

        this.postPostService.automark(tableData)
            .subscribe( result => {
                if (result.length > 0) {
                    this.allMarkingSessions = result;
                    this.journalEntryLines = tableData;
                    setTimeout(() => {
                        this.calculateSums();
                    });
                    this.isDirty = true;
                }
        });

    }

    private addToCurrentMarkingSession(model) {
        this.currentMarkingSession.push(model);
        // run calculation of SumChecked before we try to find matches
        setTimeout(() => {
            this.setLikelyMatchCandidates();
        }, 100);
    }

    private setLikelyMatchCandidates() {
        const tableData = this.table.getTableData();

        tableData.forEach(row => {
            if (row._isLikelyMatch) {
                row._isLikelyMatch = false;
                this.table.updateRow(row._originalIndex, row);
            }

            if (this.summaryData.SumChecked !== 0
                && !row._rowSelected
                && row.StatusCode !== StatusCodeJournalEntryLine.Marked
                && row.RestAmount !== 0
                && ((row.RestAmount < 0 && this.summaryData.SumChecked > 0)
                        || (row.RestAmount > 0 && this.summaryData.SumChecked < 0))
                && Math.abs(this.summaryData.SumChecked + row.RestAmount) < 10) {
                row._isLikelyMatch = true;
                this.table.updateRow(row._originalIndex, row);
            }
        });
    }

    private unlockLocalMarking(rowModel) {
        // remove existing markings if this journalentry has been in a closed marking session
        if (this.currentMarkingSession.find(x => x.ID === rowModel.ID)) {
            this.currentMarkingSession = this.currentMarkingSession.filter(x => x.ID !== rowModel.ID);
        } else if (
            this.allMarkingSessions.find(x => x.JournalEntryLineId1 === rowModel.ID
            || x.JournalEntryLineId2 === rowModel.ID)
        ) {
            const affectedMarkings = this.allMarkingSessions.filter(
                x => x.JournalEntryLineId1 === rowModel.ID || x.JournalEntryLineId2 === rowModel.ID
            );

            // update unitable to remove bindings
            const tableData = this.table.getTableData();

            affectedMarkings.forEach(marking => {
                tableData.forEach(row => {
                    if (row.Markings && row.Markings.find(
                        x => x.ID === marking.JournalEntryLineId1 || x.ID === marking.JournalEntryLineId2
                    )) {
                        row.Markings = [];
                        if (row._originalStatusCode) {
                            row.StatusCode = row._originalStatusCode;
                        }
                        if (row._originalRestAmount) {
                            row.RestAmount = row._originalRestAmount;
                        }
                        row._rowSelected = false;
                        row._isDirty = false;
                        this.table.updateRow(row._originalIndex, row);
                    }
                });

                rowModel._rowSelected = false;
                rowModel._isDirty = false;
                rowModel.Markings = [];
                if (rowModel._originalStatusCode) {
                    rowModel.StatusCode = rowModel._originalStatusCode;
                }
                if (rowModel._originalRestAmount) {
                    rowModel.RestAmount = rowModel._originalRestAmount;
                }
                this.table.updateRow(rowModel._originalIndex, rowModel);
            });

            this.allMarkingSessions = this.allMarkingSessions.filter(
                x => x.JournalEntryLineId1 !== rowModel.ID && x.JournalEntryLineId2 !== rowModel.ID
            );

            if (this.allMarkingSessions.length === 0) {
                this.isDirty = false;
            }
        }

        setTimeout(() => {
            this.setLikelyMatchCandidates();
        });
    }

    private closeMarkingSession(): boolean {

        if (this.currentMarkingSession.length === 1 && this.currentMarkingSession[0].RestAmount === 0) {
            // if only one item has been added, and that has 0 as RestAmount, just mark it against itself
            // as a dummy - the API will handle this gracefully
        } else if (this.currentMarkingSession.length < 2) {
            this.toastService.addToast(
                'Kan ikke merke postene', ToastType.bad, 10, 'Du må velge minst to poster som skal markeres'
            );
            return false;
        } else if (this.currentMarkingSession.filter(
            x => x.RestAmount > 0).length === 0
            || this.currentMarkingSession.filter(x => x.RestAmount < 0).length === 0
        ) {
            this.toastService.addToast(
                'Kan ikke merke postene', ToastType.bad,
                ToastTime.medium, 'Du må velge både positive og negative beløp'
            );
            return false;
        }

        // find largest amount, either negative or positive
        const sortedSessionList = this.currentMarkingSession.slice().sort((x, y) => x.RestAmount - y.RestAmount);

        const smallestRestAmountLine = sortedSessionList[0];
        const largestRestAmountLine = sortedSessionList[sortedSessionList.length - 1];

        const baseLine = Math.abs(smallestRestAmountLine.RestAmount) > Math.abs(largestRestAmountLine.RestAmount) ?
                            smallestRestAmountLine : largestRestAmountLine;

        if (!baseLine.Markings) {
            baseLine.Markings = [];
        }

        const originalBaseRestAmount = baseLine.RestAmount;
        let baseRestAmount = baseLine.RestAmount;

        if (this.currentMarkingSession.length === 1) {
            const newMarking: JournalEntryLineCouple = {
                JournalEntryLineId1: this.currentMarkingSession[0],
                JournalEntryLineId2: this.currentMarkingSession[0]
            };
            this.allMarkingSessions.push(newMarking);
        } else {
            // update markings on table data based on currentMarkingSession
            this.currentMarkingSession.forEach(x => {
                if (!x.Markings) {
                    x.Markings = [];
                }

                if (x.ID !== baseLine.ID) {
                    if (baseLine.RestAmount !== 0) {
                        const newMarking: JournalEntryLineCouple = {
                            JournalEntryLineId1: baseLine.ID,
                            JournalEntryLineId2: x.ID
                        };
                        this.allMarkingSessions.push(newMarking);

                        baseRestAmount = baseRestAmount + x.RestAmount;

                        // keep original values in case line is "unmarked"
                        x._originalRestAmount = x.RestAmount;
                        x._originalStatusCode = x.StatusCode;

                        if ((baseRestAmount < 0 && originalBaseRestAmount > 0)
                                || (baseRestAmount > 0 && originalBaseRestAmount < 0))  {
                            // the base line is fully Marked, keep the restamount on the line
                            baseLine.RestAmount = 0;

                            x.RestAmount = baseRestAmount;
                            x.StatusCode = StatusCodeJournalEntryLine.PartlyMarked;
                        } else {
                            x.RestAmount = 0;
                            x.StatusCode = StatusCodeJournalEntryLine.Marked;
                            baseLine.RestAmount = baseRestAmount;
                        }

                        // if the row is fully marked, deselect it. If it is not, keep it selected,
                        // as the user will probably want to mark it against more items
                        if (x.StatusCode === StatusCodeJournalEntryLine.Marked) {
                            x._rowSelected = false;
                        }

                        x._isDirty = true;

                        x.Markings.push(baseLine);
                        this.table.updateRow(x._originalIndex, x);

                        baseLine.Markings.push(_.cloneDeep(x));
                    } else {
                        // the base line is already full marked - no point in trying to do more here
                        // but we will keep the row marked, in case the user wants to mark it against
                        // another post
                    }
                }
            });
        }

        baseLine._originalRestAmount = originalBaseRestAmount;
        baseLine._originalStatusCode = baseLine.StatusCode;

        if (baseLine.RestAmount === 0) {
            baseLine.StatusCode = StatusCodeJournalEntryLine.Marked;
        } else {
            baseLine.StatusCode = StatusCodeJournalEntryLine.PartlyMarked;
        }

        if (baseLine.StatusCode === StatusCodeJournalEntryLine.Marked) {
            baseLine._rowSelected = false;
        }

        baseLine._isDirty = true;

        this.table.updateRow(baseLine._originalIndex, baseLine);

        this.isDirty = true;
        this.currentMarkingSession =
            this.currentMarkingSession.filter(x => x.StatusCode !== StatusCodeJournalEntryLine.Marked);

        setTimeout(() => {
            this.calculateSums();
        });

        return true;
    }

    private setSums() {
        this.summary = [{
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumOpen) : null,
                title: 'Sum åpne poster',
            }, {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumOpenDue) : null,
                title: 'Sum forfalte poster',
            }, {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumChecked) : null,
                title: 'Differanse markerte poster',
            }
        ];
    }

    public canDiscardChanges(): Observable<boolean> {
        return !this.isDirty
            ? Observable.of(true)
            : this.modalService
                .openRejectChangesModal()
                .onClose
                .map(result => {
                    return result === ConfirmActions.REJECT;
                });
    }

    public showHideEntries(newValue) {
        this.canDiscardChanges().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.allMarkingSessions = [];
                this.currentMarkingSession = [];
                this.currentSelectedRows = [];
                this.isDirty = false;
                this.displayPostsOption = newValue;
                this.loadData();
            }
        });
    }

    public unlockJournalEntries() {
        // check if any of the rows that are selected are serverside markings
        let selectedRows = this.table.getSelectedRows();
        if (selectedRows.length === 0) {
            this.toastService.addToast('Ingen rader valgt',
                ToastType.warn,
                ToastTime.medium,
                'Velg hvilke rader du vil låse opp før du trykker på Lås opp'
            );

            return;
        }

        let hasRemoteMarkedRowsSelected: boolean = false;
        selectedRows.forEach(row => {
            if (row.StatusCode !== StatusCodeJournalEntryLine.Open && !row._originalStatusCode) {
                hasRemoteMarkedRowsSelected = true;
            }
        });

        // if we are only unlocking a locally marked (not saved) marking, we
        // wont refresh the data afterwards, so we don't need to ask the user
        // before continuing. However, if we are working on remote data as well,
        // we will need to refresh the data afterwards, so we need to ask the
        // user first if they have made new markings that are not yet saved
        const canUnlock = (this.isDirty && this.showMarkedEntries && hasRemoteMarkedRowsSelected)
            ? this.canDiscardChanges()
            : Observable.of(true);

        canUnlock.subscribe((allowed) => {
            if (!allowed) {
                return;
            }

            // unmark local markings that are not yet marked on the server
            selectedRows.forEach(row => {
                if (row._isDirty && row.StatusCode !== StatusCodeJournalEntryLine.Open) {
                    this.unlockLocalMarking(row);
                }
            });

            if (hasRemoteMarkedRowsSelected) {
                setTimeout(() => {
                    // get selected rows after local rows has been updated
                    // - this is done to get items that needs to be unlocked through the api
                    selectedRows = this.table.getSelectedRows();
                    const journalEntryIDs: Array<number> = [];

                    selectedRows.forEach(row => {
                        if (row.StatusCode !== StatusCodeJournalEntryLine.Open) {
                            journalEntryIDs.push(row.ID);
                        }
                    });

                    // Call action to unlock selected rows
                    if (journalEntryIDs.length > 0) {
                        this.busy = true;

                        this.postPostService.revertPostpostMarking(journalEntryIDs)
                            .subscribe(res => {
                                    this.toastService.addToast('Rader låst opp', ToastType.good, ToastTime.short);
                                    this.isDirty = false;
                                    this.loadData();
                                },
                                err => {
                                    this.errorService.handle(err);
                                    this.busy = false;
                                }
                            );
                    } else {
                        this.toastService.addToast('Rader låst opp', ToastType.good, ToastTime.short);
                    }
                });
            } else {
                this.toastService.addToast('Rader låst opp', ToastType.good, ToastTime.short);
            }
        });
    }

    public abortMarking(ask = true, reload = true) {
        if (!ask) {
            this.clearMarkings(reload);
            return;
        }
        this.canDiscardChanges().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.clearMarkings(reload);
            }
        });
    }

    private clearMarkings(reload = true) {
        this.allMarkingSessions = [];
        this.currentMarkingSession = [];
        this.currentSelectedRows = [];
        this.isDirty = false;
        if (reload) {this.loadData(); }
    }

    public reconciliateJournalEntries() {
        // if at least 2 rows are marked but haven't been closed yet (because they dont match exactly),
        // close them before saving
        if (this.currentMarkingSession.length > 1) {
            if (!this.closeMarkingSession()) {
                this.toastService.addToast(
                    'Lagring avbrutt', ToastType.bad, ToastTime.medium,
                    'Fjern markeringene det er problemer med og forsøk igjen'
                );
                return;
            }
        }

        if (this.allMarkingSessions.length === 0) {
            this.toastService.addToast(
                'Lagring avbrutt', ToastType.warn, ToastTime.medium, 'Du har ikke gjort noen endringer som kan lagres'
            );
            return;
        }

        this.busy = true;

        // save markings to the server
        this.postPostService.markPosts(this.allMarkingSessions)
            .subscribe(res => {
                this.allMarkingSessions = [];
                this.currentSelectedRows = [];
                this.isDirty = false;
                this.toastService.addToast('Merking lagret', ToastType.good, ToastTime.short);
                this.loadData();
            }, err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    public markCheckedJournalEntries() {
        // this is used to force a marking of the selected marked rows - even though they
        // might not be an exact match
        this.closeMarkingSession();
    }

    private editJournalEntry(journalEntryID, journalEntryNumber) {
        const data = this.journalEntryService.getSessionData(0);

        // avoid losing changes if user navigates to a new journalentry with unsaved changes
        // without saving or discarding changes first
        const isNewJournalEntry = data && data.length > 0
            && (!data[0].JournalEntryID || data[0].JournalEntryID.toString() !== journalEntryID.toString());

        if (isNewJournalEntry) {
            this.modalService.openRejectChangesModal()
                .onClose
                .subscribe(result => {
                    if (result === ConfirmActions.REJECT) {
                        this.journalEntryService.setSessionData(0, []);
                        this.router.navigateByUrl(
                            `/accounting/journalentry/manual;journalEntryNumber=${journalEntryNumber}`
                            + `;journalEntryID=${journalEntryID}`
                            + `;editmode=true`
                        );
                    }
                });
        } else {
            this.router.navigateByUrl(
                `/accounting/journalentry/manual;journalEntryNumber=${journalEntryNumber}`
                + `;journalEntryID=${journalEntryID}`
                + `;editmode=true`
            );
        }
    }

    private handleOverpayment(item: JournalEntryLine) {
        this.statisticsService.GetAllUnwrapped(
            `model=Tracelink&filter=DestinationEntityName%20eq%20'Payment'%20`
            + `and%20SourceEntityName%20eq%20'JournalEntry'%20`
            + `and%20Journalentry.ID%20eq%20${item.JournalEntryID}%20`
            + `and%20Payment.Deleted%20eq%20'false'`
            + `&join=Tracelink.SourceInstanceId%20eq%20JournalEntry.ID%20as%20JournalEntry%20`
            + `and%20Tracelink.DestinationInstanceId%20eq%20Payment.ID`
            + `&select=Tracelink.DestinationInstanceId%20as%20PaymentID,`
            + `Payment.StatusCode as StatusCode`
        ).subscribe((statisticsData) => {
            if (statisticsData  && statisticsData.length > 0) {
                const paymentID = statisticsData.find(x => x.PaymentID)['PaymentID'];
                const StatusCode = statisticsData.find(x => x.StatusCode)['StatusCode'];
                if (StatusCode === 44001) { // created
                    this.editPayment(paymentID);
                } else {
                    this.toastService.addToast(
                        'Not allowed to edit this payment.',
                        ToastType.warn, 5,
                        'Payment has already been sent to the bank.'
                    );
                }
            } else {
                this.addPayment(item);
            }
        }, err => {
            this.errorService.handle(err);
            this.busy = false;
        });
    }

    private addPayment(item: JournalEntryLine) {
        this.journalEntryLineService.GetOneByQuery(`filter=JournalEntryID eq ${item.JournalEntryID}`)
            .switchMap((line) => {
                if (line.PaymentReferenceID) {
                    return this.getPaymentByPaymentReferenceID(line.PaymentReferenceID);
                } else {
                    return this.getPaymentByCustomerID(this.customerID);
                }
            }).switchMap(payment => {
                return this.companySettingsService.getCompanySettings().map((settings: CompanySettings) => {
                    const bankAccount = settings.BankAccounts.find(ba => ba.ID === payment.ToBankAccountID) || settings.CompanyBankAccount;
                    payment.FromBankAccount = bankAccount;
                    payment.FromBankAccountID = bankAccount.ID;
                    return payment;
                });
            })
            .subscribe(payment => {
                const newPayment = new Payment();
                newPayment.PaymentDate = new LocalDate();
                newPayment.DueDate =  new LocalDate();
                newPayment.InvoiceNumber = item.InvoiceNumber ? item.InvoiceNumber : '';
                newPayment.Amount = payment.Amount || Math.abs(item.RestAmount);
                newPayment.AmountCurrency = payment.AmountCurrency || Math.abs(item.RestAmountCurrency);
                newPayment.ToBankAccount = payment.ToBankAccount;
                newPayment.ToBankAccountID = payment.ToBankAccountID;
                newPayment.FromBankAccount = payment.FromBankAccount;
                newPayment.FromBankAccountID = payment.FromBankAccountID;
                newPayment.BusinessRelation = payment.BusinessRelation;
                newPayment.BusinessRelationID = payment.BusinessRelationID;
                newPayment.PaymentCodeID = 1;
                newPayment.Description = item.InvoiceNumber ? 'Tilbakebetaling overbetalt beløp for faktura ' + item.InvoiceNumber + '.' :
                 'Tilbakebetaling overbetalt beløp.';
                newPayment.IsCustomerPayment = false;
                newPayment.AutoJournal = true;
                this.modalService.open(AddPaymentModal, {data: { model: newPayment }}).onClose.subscribe((updatedPaymentInfo: Payment) => {
                    if (updatedPaymentInfo) {
                        this.paymentService.ActionWithBody(null,
                            updatedPaymentInfo,
                            'create-payment-with-tracelink',
                            RequestMethod.Post,
                            'journalEntryID=' + item.JournalEntryID
                        ).subscribe(paymentResponse => {});
                    }
                });
            });
    }

    private editPayment(paymentID: number) {
        this.paymentService.Get(paymentID, ['BusinessRelation', 'FromBankAccount', 'ToBankAccount']).switchMap(existingPayment => {
            return this.modalService.open(AddPaymentModal, {
                data: { model: existingPayment },
                header: 'Endre betaling',
                buttonLabels: {accept: 'Oppdater betaling'}
            }).onClose;
        }).subscribe(updatedPayment => {
            if (updatedPayment) {
                this.paymentService.Put(paymentID, updatedPayment).subscribe();
            }
        });
    }

    private getPaymentByPaymentReferenceID(id): Observable<Payment> {
        return this.paymentService.Get(id, ['BusinessRelation']).switchMap(payment => {
            if (!payment.FromBankAccountID) {
                payment.ToBankAccountID = null;
                payment.ToBankAccount = null;
                return Observable.of(payment);
            }
            return this.bankaccountService.Get(payment.FromBankAccountID, ['BusinessRelation']).map(ba => {
                payment.ToBankAccountID = ba.ID;
                payment.ToBankAccount = ba;
                return payment;
            });
        });
    }

    private getPaymentByCustomerID(id): Observable<Payment> {
        const payment: Payment = new Payment();
        return this.customerService.Get(id, ['Info', 'Info.DefaultBankAccount']).map(customer => {
            payment.BusinessRelationID = customer.ID;
            payment.BusinessRelation = this.getBusinessRelationDataFromCustomerSearch(customer);
            return payment;
        });
    }

    private getBusinessRelationDataFromCustomerSearch(customerData: Customer): BusinessRelation {
        const br = new BusinessRelation();
        br.ID = customerData.ID;
        br.Name = customerData.Info.Name;
        br.DefaultBankAccountID = customerData.Info.DefaultBankAccountID;
        br.DefaultBankAccount = customerData.Info.DefaultBankAccount;
        return br;
    }

    public addDaysToDates(date: any, days: number) {
        const result = new Date(date);
        return new LocalDate(moment(result.setDate(result.getDate() + days)).toDate());
    }

    private setupUniTable() {
        this.journalEntryLineService.getJournalEntryLinePostPostData(
            this.displayPostsOption !== 'MARKED',
            this.displayPostsOption !== 'OPEN',
            this.customerID,
            this.supplierID,
            this.accountID,
            this.pointInTime)
            .subscribe(data => {
                this.journalEntryLines = data;
                this.canAutoMark = data && data.length > 1 && this.displayPostsOption === 'OPEN';
                setTimeout(() => {
                    this.calculateSums();
                    this.busy = false;
                });
            },
            (err) => this.errorService.handle(err)
        );

        const columns = [
            new UniTableColumn('JournalEntryNumber', 'Bilagsnr', UniTableColumnType.Text)
                .setWidth('7rem'),
            new UniTableColumn('JournalEntryType.Name', 'Type', UniTableColumnType.Text)
                .setTemplate(x => x.JournalEntryTypeName)
                .setVisible(false),
            new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.LocalDate),
            new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text),
            new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.DateTime),
            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                .setSortMode(UniTableColumnSortMode.Absolute),
            new UniTableColumn('AmountCurrency', 'V-Beløp', UniTableColumnType.Money)
                .setVisible(false)
                .setSortMode(UniTableColumnSortMode.Absolute),
            new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text)
                .setVisible(false),
            new UniTableColumn('CurrencyExchangeRate', 'V-Kurs', UniTableColumnType.Number)
                .setVisible(false),
            new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Money)
                .setSortMode(UniTableColumnSortMode.Absolute),
            new UniTableColumn('RestAmountCurrency', 'V-Restbeløp', UniTableColumnType.Money)
                .setVisible(false)
                .setSortMode(UniTableColumnSortMode.Absolute),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setWidth('7rem')
                .setTemplate(x => this.journalEntryLineService.getStatusText(x.StatusCode)),
            new UniTableColumn('NumberOfPayments', 'Bet.', UniTableColumnType.Text)
                .setWidth('60px')
                .setTemplate(
                    x => x.NumberOfPayments > 0
                        ? `${x.NumberOfPayments}`
                        : ''
                ),
            new UniTableColumn('Markings', 'Motpost', UniTableColumnType.Text)
                .setTemplate(item => {
                    return this.getMarkingsText(item);
                })
        ];

        columns.forEach(x => {
            x.setConditionalCls((model) => {
                return this.getCssClasses(model, x.field);
            });
        });

        this.uniTableConfig = new UniTableConfig('common.reconciliation.legderaccounts', false, true, 25)
            .setColumns(columns)
            .setMultiRowSelect(true)
            .setColumnMenuVisible(true)
            .setConditionalRowCls((row) => {
                return (row.StatusCode === StatusCodeJournalEntryLine.Marked) ? 'reconciliation-marked-row' : '';
            })
            .setContextMenu([
                {
                    action: (item) => { this.editJournalEntry(item.JournalEntryID, item.JournalEntryNumber); },
                    disabled: (item) => false,
                    label: 'Rediger bilag'
                },
                {
                    action: (item) => { this.handleOverpayment(item); },
                    disabled: (item) => !this.isOverpaid(item, this.customerID),
                    label: 'Tilbakebetal beløp'
                }
            ]);
    }

    private isOverpaid(item, customerID): boolean {
        if (customerID && item.Amount && item.RestAmount) {
            if (item.Amount < 0 && item.RestAmount < 0) {
                return true;
            }
        }
        return false;
    }

    private getCssClasses(model, field) {
        let cssClasses = '';

        if (model.StatusCode !== StatusCodeJournalEntryLine.Marked) {
            if (model._isLikelyMatch) {
                cssClasses += ' reconciliation-likely-match';
            }

            if (field === 'Amount') {
                cssClasses += ' ' + (model.Amount >= 0 ? 'number-good' : 'number-bad');
            }
            if (field === 'AmountCurrency') {
                cssClasses += ' ' + (model.AmountCurrency >= 0 ? 'number-good' : 'number-bad');
            }

            if (field === 'RestAmount') {
                cssClasses += ' ' + (model.RestAmount >= 0 ? 'number-good' : 'number-bad');
            }
            if (field === 'RestAmountCurrency') {
                cssClasses += ' ' + (model.RestAmountCurrency >= 0 ? 'number-good' : 'number-bad');
            }
        }

        return cssClasses.trim();
    }

    private getMarkingsText(item): string {
        return (item.Markings || [])
            .sort((x, y) => x.JournalEntryNumber > y.JournalEntryNumber)
            .map(x => x.JournalEntryNumber.split('-')[0])
            .join(',');
    }
}
