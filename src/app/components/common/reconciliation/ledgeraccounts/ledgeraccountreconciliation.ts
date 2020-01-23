import {Component, ViewChild, Input, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {
    StatusCodeJournalEntryLine,
    LocalDate,
    JournalEntryLinePostPostData,
    JournalEntryLine,
    Payment,
    BusinessRelation,
    Customer,
    CompanySettings,
    CurrencyCode
} from '../../../../unientities';
import {
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
    CompanySettingsService,
    TickerHistory
} from '../../../../services/services';
import {ColumnMenuNew} from '@uni-framework/ui/ag-grid/column-menu-modal';
import {AddPaymentModal} from '@app/components/common/modals/addPaymentModal';
import {RequestMethod} from '@uni-framework/core/http';
import {JournalEntryLineCouple} from '@app/services/accounting/postPostService';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {Observable, Subject} from 'rxjs';
import {UniMarkingDetailsModal} from './markingDetails';
import * as moment from 'moment';
declare var _;

export enum LedgerTableEmitValues {
    InitialValue = 1,
    MarkedPosts = 2,
    MarkedLocked = 3
}

const CONFIG_STORAGE_KEY = 'legderaccounts_column_configs';

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
    public accountNumber: number;

    @Input()
    public accountID: number;

    @Input()
    public pointInTime: LocalDate;

    @Input()
    public autoLocking: boolean = true;

    @Input()
    public hideHeader: boolean = false;

    @Input()
    public showRowSelect: boolean = true;

    @Input()
    public disablePaymentToField: boolean = false;

    @Input()
    public customerBankAccounts: any;

    @Input()
    public searchValue: any = '';

    @Input()
    public displayPostsOption: any = 'OPEN';

    @Output()
    public selectionChanged: EventEmitter<any> = new EventEmitter();

    @Output()
    public searchUpdated: EventEmitter<any> = new EventEmitter();

    @Output()
    public automarkChecked: EventEmitter<any> = new EventEmitter();

    @Output()
    public saveComplete: EventEmitter<any> = new EventEmitter();

    @ViewChild(AgGridWrapper, { static: false })
    private table: AgGridWrapper;

    showMarkedEntries: boolean = false;
    uniTableConfig: UniTableConfig;
    journalEntryLines: Array<any> = [];
    loading$: Subject<boolean> = new Subject();
    itemsSummaryData: any = {};
    validationResult: any;
    summary: ISummaryConfig[];
    public page: number = 1;

    currentMarkingSession: Array<any> = [];
    selectedNotOpen: any[] = [];
    allMarkingSessions: Array<JournalEntryLineCouple> = [];
    currentSelectedRows: Array<any> = [];
    filteredJournalEntryLines: any[] = [];
    journalEntryLinesDisplayed: any[] = [];
    currentLead: any;
    allSelected: boolean = false;

    isDirty: boolean = false;
    busy: boolean = false;
    readyForManualMarkings: boolean = false;
    canAutoMark = this.displayPostsOption === 'OPEN';

    searchControl: FormControl = new FormControl('');

    public summaryData: any = {
        SumOpen: 0,
        SumBalance: 0,
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
        private toastService: ToastService,
        private journalEntryService: JournalEntryService,
        private modalService: UniModalService,
        private paymentService: PaymentService,
        private customerService: CustomerService,
        private bankaccountService: BankAccountService,
        private companySettingsService: CompanySettingsService
    ) {
        this.setupUniTable();
    }

    public ngOnInit() {
        this.searchControl.valueChanges
            .debounceTime(350)
            .subscribe(query => {
                this.page = 1;
                this.searchUpdated.emit(this.searchValue);
                this.setDisplayArray();
            });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['autoLocking'] && changes['autoLocking'].currentValue) {
            if (this.currentMarkingSession.length >= 2) {
                let currentSessionSum = 0;
                this.currentMarkingSession.forEach(x => {
                    currentSessionSum += x.RestAmount;
                });
            }
        }

        if (!changes['autoLocking'] && !changes['searchValue'] && !changes['displayPostsOption']) {
            this.journalEntryLines.map(row => {
                row._rowSelected = false;
                return row;
            });

            this.loadData();
        }
    }

    private loadData() {
        this.canAutoMark = this.displayPostsOption === 'OPEN';
        this.readyForManualMarkings = false;
        if (this.customerID || this.supplierID || this.accountID) {
            this.busy = true;
            if (this.customerID || this.supplierID) {
                this.journalEntryLineService.getBalance(this.accountNumber).subscribe((res) => {
                    if (res && res.Data && res.Data[0]) {
                        this.summaryData.SumBalance = res.Data[0].Saldo;
                    }
                    // this.setupUniTable();
                    this.getTableData();
                });
            } else {
                // this.setupUniTable();
                this.getTableData();
            }
        } else {
            this.journalEntryLines = [];
            this.journalEntryLinesDisplayed = [];
        }
    }

    private calculateSums() {
        this.summaryData.SumChecked = 0;
        this.summaryData.SumOpenDue = 0;
        this.summaryData.SumOpen = 0;

        setTimeout(() => {
            const posts = this.journalEntryLines;

            posts.forEach(x => {
                if (x.StatusCode !== StatusCodeJournalEntryLine.Marked) {
                    this.summaryData.SumOpen += x.RestAmount;
                    if (x.DueDate && moment(x.DueDate).isBefore(moment())) {
                        this.summaryData.SumOpenDue += x.RestAmount;
                    }
                }
                if (x._rowSelected) {
                    this.summaryData.SumChecked += x.RestAmount;
                }
            });

            this.setSums();
        });
    }

    public onRowSelect(line) {
        this.summaryData.SumChecked = 0;
        // No need to do any work on lines when user is not working on Open posts
        if (this.displayPostsOption === 'OPEN') {
            if (line._rowSelected) {
                line.Markings = line.Markings || [];
                line._originalRestAmount = line.RestAmount;

                this.currentSelectedRows.push(line);

                this.updateJournalEntryLinesOnTheFly(line);
            } else {
                if (this.currentSelectedRows.length === 1) {
                    this.currentLead = null;
                    this.currentSelectedRows.pop();
                } else if (!line.Markings.length) {
                    const index = this.currentSelectedRows.findIndex(row => row.ID === line.ID);
                    this.currentSelectedRows.splice(index, 1);
                    // If the removed line is the lead, find new lead or set as undefined
                    if (this.currentLead && this.currentLead.ID === line.ID) {
                        this.currentLead = this.currentSelectedRows.find(row => row.RestAmount !== 0);
                    }
                } else {
                    line.RestAmount = line._originalRestAmount;
                    const savedMarkings = [];

                    // Loop all the lines that are marked against the deselected line
                    for (let i = 0; i < line.Markings.length; i++) {
                        const mLine = this.currentSelectedRows.find(row => row.ID === line.Markings[i].ID);

                        // If mLine is not found in selected rows, it is previously saved, and should be ignored
                        if (mLine) {
                            mLine.RestAmount = mLine._originalRestAmount;
                            mLine.Markings.splice(mLine.Markings.findIndex(row => row.ID === line.ID), 1);
                            const pairIndex = this.allMarkingSessions.findIndex(row => {
                                return (row.JournalEntryLineId1 === line.ID && row.JournalEntryLineId2 === mLine.ID
                                    || (row.JournalEntryLineId1 === mLine.ID && row.JournalEntryLineId2 === line.ID));
                            });

                            this.allMarkingSessions.splice(pairIndex, 1);

                            if (!mLine.Markings.length) {
                                // Remove checkbox and line from selected lines array.
                                this.currentSelectedRows.splice(this.currentSelectedRows.findIndex(row => row.ID === mLine.ID), 1);
                                mLine._rowSelected = false;
                            }

                            // // If marked line has more markings left, recalculate restamount
                            // if (mLine.Markings.length) {
                            //     mLine.Markings.forEach((row) => {
                            //         mLine.RestAmount += row._originalRestAmount ? row._originalRestAmount : row.RestAmount;
                            //     });
                            // } else {

                            // }
                        } else {
                            savedMarkings.push(line.Markings[i]);
                        }
                    }

                    line.Markings = savedMarkings;
                    this.currentSelectedRows.splice(this.currentSelectedRows.findIndex(row => row.ID === line.ID), 1);

                    this.currentLead = !this.currentLead || this.currentLead.ID === line.ID || !this.currentLead._rowSelected
                        ? this.currentSelectedRows.find(row => row.RestAmount !== 0)
                        : this.currentLead;

                    this.calcRestAmount();
                }
            }
            // Emit event to parant component to update save actions button
            if (this.currentSelectedRows.length) {
                this.selectionChanged.emit(LedgerTableEmitValues.MarkedPosts);
            } else {
                // If no posts are marked
                this.selectionChanged.emit(LedgerTableEmitValues.InitialValue);
            }
        } else {
            if (line._rowSelected) {
                this.selectedNotOpen.push(line);
            } else {
                this.selectedNotOpen.splice(this.selectedNotOpen.findIndex(row => row.ID === line.ID), 1);
            }

            this.selectionChanged.emit(this.selectedNotOpen.length || this.displayPostsOption !== 'OPEN'
                ? LedgerTableEmitValues.MarkedLocked
                : LedgerTableEmitValues.MarkedPosts);
        }
        this.currentSelectedRows.map(l => {
            this.summaryData.SumChecked += l.RestAmount;
            return l;
        });

        this.setSums();

    }

    public ResetJournalEntrylinesPostPostStatus(subaccountId: number, reskontroType: string): void {
        this.postPostService.ResetJournalEntryLinesPostStatus(subaccountId, reskontroType).subscribe ( () => {
            this.loadData();
            this.isDirty = false;
        });
    }

    private updateJournalEntryLinesOnTheFly(line) {
        if (line.RestAmount === 0) {
            line.Markings = [line];
            this.allMarkingSessions.push({
                JournalEntryLineId1: line.ID,
                JournalEntryLineId2: line.ID
            });
            return;
        }
        // Is this the first marked row or is the sum of others zero
        if (!this.currentLead) {
            this.currentLead = line;
        } else if (
            (line.RestAmount > 0 && this.currentLead.RestAmount > 0 ) || (line.RestAmount < 0 && this.currentLead.RestAmount < 0)) {
            // Do nothing?
        } else {
            // If currentlead is bigger then 0
            if (this.currentLead.RestAmount > 0) {
                // If the RestAmount on the currentLead is bigger then the selected line
                if (this.currentLead.RestAmount + line.RestAmount > 0) {
                    this.currentLead.RestAmount += line.RestAmount;
                    line.RestAmount = 0;
                    line.Markings.push(this.currentLead);
                    this.currentLead.Markings.push(line);
                    this.allMarkingSessions.push({
                        JournalEntryLineId1: line.ID,
                        JournalEntryLineId2: this.currentLead.ID
                    });
                } else {
                    line.RestAmount += this.currentLead.RestAmount;
                    this.currentLead.RestAmount = 0;
                    line.Markings.push(this.currentLead);
                    this.currentLead.Markings.push(line);
                    this.allMarkingSessions.push({
                        JournalEntryLineId1: line.ID,
                        JournalEntryLineId2: this.currentLead.ID
                    });
                    // Find next lead if any...
                    this.currentLead = this.currentSelectedRows.find(row => row.RestAmount !== 0);

                    if (this.currentLead && this.currentLead.ID !== line.ID && line.RestAmount !== 0) {
                        this.updateJournalEntryLinesOnTheFly(line);
                    }
                }
            } else {
                // Currentlead is a negative number!
                // If restamount is bigger then line added
                if (this.currentLead.RestAmount + line.RestAmount < 0) {
                    this.currentLead.RestAmount += line.RestAmount;
                    line.RestAmount = 0;
                    line.Markings.push(this.currentLead);
                    this.currentLead.Markings.push(line);
                    this.allMarkingSessions.push({
                        JournalEntryLineId1: line.ID,
                        JournalEntryLineId2: this.currentLead.ID
                    });
                } else {
                    line.RestAmount += this.currentLead.RestAmount;
                    this.currentLead.RestAmount = 0;
                    line.Markings.push(this.currentLead);
                    this.currentLead.Markings.push(line);
                    this.allMarkingSessions.push({
                        JournalEntryLineId1: line.ID,
                        JournalEntryLineId2: this.currentLead.ID
                    });
                    // Find next lead if any...
                    this.currentLead = this.currentSelectedRows.find(row => row.RestAmount !== 0);

                    if (this.currentLead && this.currentLead.ID !== line.ID && line.RestAmount !== 0) {
                        this.updateJournalEntryLinesOnTheFly(line);
                    }
                }
            }
        }
    }

    public calcRestAmount() {

        this.currentSelectedRows.map((line) => {
            line.RestAmount = line._originalRestAmount || line.RestAmount;
            return line;
        });

        this.currentSelectedRows.forEach((line) => {
            const isPositive: boolean = line.RestAmount > 0;

            line.Markings.forEach((mark) => {
                line.RestAmount += mark._originalRestAmount || mark.RestAmount;
                if ((isPositive && line.RestAmount < 0) || (!isPositive && line.RestAmount > 0)) {
                    line.RestAmount = 0;
                }
            });
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

    public autoMarkJournalEntries(criterias, done?: any) {

        this.allMarkingSessions = [];
        this.loading$.next(true);

        this.canAutoMark = this.displayPostsOption === 'OPEN';

        this.postPostService.automarkAccount(this.journalEntryLines, this.customerID, this.supplierID, this.accountID, criterias)
            .then( result => {
                this.loading$.next(false);
                if (result.length > 0) {
                    if (done) {
                        done('Merking fullført. Trykk lagre for å lukke merkede poster');
                    }
                    this.selectionChanged.emit(LedgerTableEmitValues.MarkedPosts);
                    this.allMarkingSessions = result;
                    this.currentSelectedRows = this.journalEntryLines.filter(row => row._rowSelected);
                    setTimeout(() => {
                        this.calculateSums();
                    });
                    this.isDirty = true;
                } else {
                    if (done) {
                        done('Fant ingen poster å merke. Ingenting endret');
                    }
                }
        });
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
        if (this.summaryData.SumBalance
                && this.summaryData.SumOpen !== this.summaryData.SumBalance
                && (this.customerID || this.supplierID)) {
            this.summary.unshift({
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumBalance) : null,
                title: 'Saldo',
            });
        }
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

    public unlockJournalEntries(subaccountID: number = 0) {
        // check if any of the rows that are selected are serverside markings
        const selectedRows = this.journalEntryLines.filter(row => row._rowSelected);
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

            if (hasRemoteMarkedRowsSelected) {
                setTimeout(() => {
                    // get selected rows after local rows has been updated
                    // - this is done to get items that needs to be unlocked through the api
                    // selectedRows = this.table.getSelectedRows();
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
                                    this.saveComplete.emit();
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

    public clearMarkings(reload = true) {
        this.currentLead = null;
        this.allMarkingSessions = [];
        this.currentMarkingSession = [];
        this.currentSelectedRows = [];
        this.selectedNotOpen = [];
        this.isDirty = false;

        if (reload) {
            this.loadData();
        } else {
            this.readyForManualMarkings = true;
        }
    }

    public reconciliateJournalEntries(done?: any) {
        if (this.allMarkingSessions.length === 0) {
            this.toastService.addToast(
                'Lagring avbrutt', ToastType.warn, ToastTime.medium, 'Du har ikke gjort noen endringer som kan lagres'
            );
            done('Lagring avbrutt');
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
                this.saveComplete.emit();
                done('Merking lagret');
            }, err => {
                this.errorService.handle(err);
                done(err);
                this.busy = false;
            }
        );
    }

    public sortJournalEntryLines(col) {
        if (col.field === 'JournalEntryNumber') {
            this.journalEntryLines.sort((item1, item2) => {
                const [item1Number, item1Year] = item1.JournalEntryNumber.split('-');
                const [item2Number, item2Year] = item2.JournalEntryNumber.split('-');
                if (item1Year === item2Year) {
                    return parseInt(item1Number, 10) > parseInt(item2Number, 10)
                        ? (1 * col._reverseMultiplier)
                        : (-1 * col._reverseMultiplier);
                } else {
                    return parseInt(item1Year, 10) > parseInt(item2Year, 10)
                        ? (1 * col._reverseMultiplier)
                        : (-1 * col._reverseMultiplier);
                }
            });
        } else {
            this.journalEntryLines = this.journalEntryLines.sort(this.compare(col.field, col._reverseMultiplier));
        }

        this.setDisplayArray();
        col._reverseMultiplier *= -1;
    }

    private compare(propName, rev) {
        return (a, b) => a[propName] === b[propName] ? 0 : a[propName] < b[propName] ? (-1 * rev) : (1 * rev);
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
                newPayment.CurrencyCode = payment.CurrencyCode || new CurrencyCode();
                this.modalService.open(AddPaymentModal, {
                    data: {
                        model: newPayment,
                        disablePaymentToField: this.disablePaymentToField,
                        customerBankAccounts: this.customerBankAccounts
                    }
                }).onClose.subscribe((updatedPaymentInfo: Payment) => {
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
        this.paymentService.Get(paymentID, ['BusinessRelation', 'FromBankAccount', 'ToBankAccount', 'CurrencyCode'])
        .switchMap(existingPayment => {
            return this.modalService.open(AddPaymentModal, {
                data: {
                    model: existingPayment,
                    disablePaymentToField: this.disablePaymentToField,
                    customerBankAccounts: this.customerBankAccounts
                 },
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
        return this.paymentService.Get(id, ['BusinessRelation', 'CurrencyCode']).switchMap(payment => {
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
            payment.ToBankAccount = customer.Info.DefaultBankAccount;
            payment.ToBankAccountID = customer.Info.DefaultBankAccountID;
            payment.BusinessRelationID = customer.BusinessRelationID;
            payment.BusinessRelation = this.getBusinessRelationDataFromCustomerSearch(customer);
            return payment;
        });
    }

    private getBusinessRelationDataFromCustomerSearch(customerData: Customer): BusinessRelation {
        const br = new BusinessRelation();
        br.ID = customerData.BusinessRelationID;
        br.Name = customerData.Info.Name;
        br.DefaultBankAccountID = customerData.Info.DefaultBankAccountID;
        br.DefaultBankAccount = customerData.Info.DefaultBankAccount;
        return br;
    }

    public addDaysToDates(date: any, days: number) {
        const result = new Date(date);
        return new LocalDate(moment(result.setDate(result.getDate() + days)).toDate());
    }

    public getActions(item) {
        const actions = [
            { label: 'Rediger bilag', name: 'EDIT' }
        ];

        if ( ( item.StatusCode === 31002 || item.StatusCode === 31003 ) && !item. Markings ) {
            actions.push(  { label: 'Nullstill postpost status', name: 'RESETPP'});
        }

        if (this.isOverpaid(item, this.customerID)) {
            actions.push({
                label: 'Tilbakebetal beløp',
                name: 'RECLAIM'
            });
        }
        if (item.Markings) {
            actions.push({
                label: 'Vis avmerkingsdetaljer',
                name: 'SHOW_DETAILS'
            });
        }
        return actions;
    }

    public actionClicked(action, item) {
        if (action.name === 'RECLAIM') {
            this.handleOverpayment(item);
        } else if (action.name === 'SHOW_DETAILS') {
            const IDs = item.Markings.map(mark => mark.ID);
            IDs.push(item.ID);

            this.modalService.open(UniMarkingDetailsModal, { data: { ids: IDs } }).onClose.subscribe((hasOpened: boolean) => {
                if (hasOpened) {
                    this.loadData();
                }
            });
        } else if (action.name === 'RESETPP') {
            this.modalService.confirm({
                header: 'Tilbakestille linje',
                message: 'Vil du tilbakestille status og restbeløp på denne linjen?',
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                switch (response) {
                    case ConfirmActions.ACCEPT:
                    this.postPostService.ResetJournalEntryLinePostStatus(item.id).subscribe( () => {
                        this.loadData();
                    });
                    break;
                }
            });
        } else {
            this.editJournalEntry(item.JournalEntryID, item.JournalEntryNumber);
        }
    }

    private setupUniTable() {
        const columns = [
            new UniTableColumn('JournalEntryNumber', 'Bilagsnr', UniTableColumnType.Link)
                .setWidth('7rem')
                .setCls('table-link')
                .setLinkResolver(row => {
                    const numberAndYear = row.JournalEntryNumber.split('-');
                    let url = `/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=`;
                    if (numberAndYear.length > 1) {
                        return url += numberAndYear[1];
                    } else {
                        const year = row.FinancialDate ? moment(row.FinancialDate).year() : moment().year();
                        return url += year;
                    }
                }),
            new UniTableColumn('JournalEntryType.Name', 'Type', UniTableColumnType.Text)
                .setTemplate(x => x.JournalEntryTypeName)
                .setVisible(false),
            new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.LocalDate)
                .setTemplate((row) => this.dateTemplate(row, 'FinancialDate')),
            new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text),
            new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.DateTime)
                .setTemplate((row) => this.dateTemplate(row, 'DueDate'))
                .setVisible(false),
            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                .setSortMode(UniTableColumnSortMode.Absolute)
                .setWidth('7rem')
                .setCls('table-money')
                .setTemplate((row) =>  this.numberFormatService.asMoney(row.Amount) ),
            new UniTableColumn('AmountCurrency', 'V-Beløp', UniTableColumnType.Money)
                .setVisible(false)
                .setSortMode(UniTableColumnSortMode.Absolute)
                .setTemplate((row) =>  this.numberFormatService.asMoney(row.AmountCurrency) ),
            new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text)
                .setVisible(false),
            new UniTableColumn('CurrencyExchangeRate', 'V-Kurs', UniTableColumnType.Number)
                .setVisible(false),
            new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Money)
                .setSortMode(UniTableColumnSortMode.Absolute)
                .setTemplate((row) =>  this.numberFormatService.asMoney(row.RestAmount) )
                .setWidth('7rem'),
            new UniTableColumn('RestAmountCurrency', 'V-Restbeløp', UniTableColumnType.Money)
                .setVisible(false)
                .setTemplate((row) =>  this.numberFormatService.asMoney(row.RestAmountCurrency) ),
            new UniTableColumn('PaymentID', 'KID', UniTableColumnType.Text)
                .setVisible(false),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                .setWidth('7rem'),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setWidth('7rem')
                .setTemplate(x => this.journalEntryLineService.getStatusText(x.StatusCode)),
            new UniTableColumn('NumberOfPayments', 'Bet.', UniTableColumnType.Text)
                .setVisible(false)
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
            x['_reverseMultiplier'] = 1;
            x.setConditionalCls((model) => {
                return this.getCssClasses(model, x.field);
            });
        });

        try {
            const columnsVisibility = JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY)) || {};
            if (columnsVisibility && columnsVisibility.length > 0) {
                columns.forEach(col => {
                    const colVisibility = columnsVisibility.find(x => x.field === col.field);
                    if (colVisibility) {
                        col.visible = colVisibility.visible;
                    }
                });
            }
        } catch {}

        let pageSize = window.innerHeight // Window size
            - 144 // Form height
            - 20 // Body margin and padding
            - 32 // Application class margin
            - 64 // Unitable pagination
            - 150 // Unitabs x 2
            - 100 // UniSummary
            - 91; // Unitable filter and thead
        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        this.uniTableConfig = new UniTableConfig('common.reconciliation.legderaccounts', false, true, pageSize < 20 ? 20 : pageSize)
            .setColumns(columns)
            .setSortable(false)
            .setMultiRowSelect(this.showRowSelect)
            .setColumnMenuVisible(true);
    }

    public dateTemplate(row, field) {
        return moment(row[field]).format('DD.MM.YYYY');
    }

    public onLinkClick(col, row) {
        if (!col.linkResolver) {
            return;
        }
        this.router.navigateByUrl(col.linkResolver(row));
    }

    private getTableData() {
        this.loading$.next(true);
        this.page = 1;
        this.journalEntryLineService.getJournalEntryLinePostPostData(
            this.displayPostsOption !== 'MARKED',
            this.displayPostsOption !== 'OPEN',
            this.customerID,
            this.supplierID,
            this.accountID,
            this.pointInTime)
            .subscribe(data => {
                this.journalEntryLines = [...data];
                // Sort by ID frontend now by default.
                this.sortJournalEntryLines({ field: 'ID', _reverseMultiplier: -1 });
                this.loading$.next(false);
                this.canAutoMark = this.displayPostsOption === 'OPEN';
                this.selectionChanged.emit(LedgerTableEmitValues.InitialValue);
                setTimeout(() => {
                    this.calculateSums();
                    this.busy = false;
                    this.clearMarkings(false);
                });
            },
            (err) => this.errorService.handle(err)
        );
    }

    public getVisibleFields() {
        return this.uniTableConfig.columns.filter(col => col.visible);
    }

    public openColumnsModal() {
        this.modalService.open(ColumnMenuNew, { data: { columns: this.uniTableConfig.columns } }).onClose.subscribe((result) => {
            if (result) {
                if (result.columns) {
                    this.uniTableConfig.columns = result.columns;
                    const columnsVisibility = [];
                    this.uniTableConfig.columns.forEach((col) => {
                        columnsVisibility.push({ field: col.field, visible: col.visible });
                    });
                    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(columnsVisibility));
                } else {
                    if (result.resetAll) {
                        localStorage.removeItem(CONFIG_STORAGE_KEY);
                    }
                    this.setupUniTable();
                    this.getTableData();
                }
            }
        });
    }

    public onPageChange(direction: string) {
        switch (direction) {
            case 'next':
            case 'last':
                if (this.page < this.getNumberOfPages()) {
                    this.page = direction === 'next' ? ++this.page : this.getNumberOfPages();
                    this.setDisplayArray();
                }
                break;
            case 'prev':
            case 'first':
                if (this.page > 1) {
                    this.page = direction === 'prev' ? --this.page : 1;
                    this.setDisplayArray();
                }
                break;
            default:
                this.page = 1;
                this.setDisplayArray();
                break;
        }
    }

    public setDisplayArray() {
        this.filteredJournalEntryLines =
            this.journalEntryLines.filter(line => {
                if (!this.searchValue || this.searchValue === '') {
                    return line;
                }
                if (line.JournalEntryNumber.toLowerCase().includes(this.searchValue.toLowerCase())
                    || (line.InvoiceNumber && line.InvoiceNumber.toString().includes(this.searchValue.toLowerCase()))
                    || (line.Amount && line.Amount.toString().includes(this.searchValue.toLowerCase()))
                    || (line.RestAmount && line.RestAmount.toString().includes(this.searchValue.toLowerCase()))
                    || (line.PaymentID && line.PaymentID.toString().includes(this.searchValue.toLowerCase()))
                    || (line.FinancialDate &&
                        moment(line.FinancialDate).format('DD.MM.YYYY').toString().includes(this.searchValue.toLowerCase()))
                    || (line.Description && line.Description.toString().includes(this.searchValue.toLowerCase()))
                    || (line.Markings && this.getMarkingsText(line).includes(this.searchValue.toLowerCase()))
                    ) {
                    return line;
                }
            });
            this.journalEntryLinesDisplayed = this.filteredJournalEntryLines
                .slice((this.page - 1)  * this.uniTableConfig.pageSize, this.page * this.uniTableConfig.pageSize);
    }

    public onPostpostRowSelect(row, index) {
        row._rowSelected = !row._rowSelected;
        this.onRowSelect(row);
    }

    public onCheckAllSelected(isCheckAll: boolean = false) {
        if (isCheckAll) {
            this.allSelected = !this.allSelected;
            this.journalEntryLines.map(row => {
                row._rowSelected = this.allSelected;
                return row;
            });

            if (!this.allSelected) {
                this.clearMarkings();
            } else {
                this.selectedNotOpen = [].concat(this.journalEntryLines);
            }
            this.selectionChanged.emit(this.selectedNotOpen.length
                ? LedgerTableEmitValues.MarkedLocked
                : LedgerTableEmitValues.MarkedPosts);
        } else {
            this.automarkChecked.emit(true);
        }

    }

    public getNumberOfPages() {
        return Math.ceil(this.filteredJournalEntryLines.length / this.uniTableConfig.pageSize);
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
