import {Component, ViewChild, Input} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Router, ActivatedRoute} from '@angular/router';
import {JournalEntryService, StatisticsService, JournalEntryLineService, PostPostService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {DimensionService, DimensionTypes} from '../../../../services/common/DimensionService';
import {JournalEntryLine, StatusCodeJournalEntryLine} from '../../../../unientities';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType, ITableFilter} from 'unitable-ng2/main';
import {ErrorService} from '../../../../services/common/ErrorService';
import {NumberFormat} from '../../../../services/common/NumberFormatService';
import {ISummaryConfig} from '../../../common/summary/summary';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';

declare const moment;
declare const _; // lodash

class JournalEntryLineCouple {
    public JournalEntryLineId1: number;
    public JournalEntryLineId2: number;
}

@Component({
    selector: 'ledger-account-reconciliation',
    templateUrl: 'app/components/common/reconciliation/ledgeraccounts/ledgeraccountreconciliation.html',
})
export class LedgerAccountReconciliation {
    @Input() supplierID: number;
    @Input() customerID: number;
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    private showMarkedEntries: boolean = false;
    private uniTableConfig: UniTableConfig;
    private journalEntryLines: Array<any> = [];

    private itemsSummaryData: any = {};

    public validationResult: any;
    public summary: ISummaryConfig[];

    private currentMarkingSession: Array<any> = [];
    private allMarkingSessions: Array<JournalEntryLineCouple> = [];
    private currentSelectedRows: Array<any> = [];

    public isDirty: boolean = false;
    private busy: boolean = false;

    private displayPostsOption: string = "OPEN";

    private summaryData = {
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
        private toastService: ToastService
    ) {

    }

    public ngOnChanges() {
        this.loadData();
    }

    private loadData() {
        if (this.customerID || this.supplierID) {
            this.setupUniTable();
            this.busy = false;
        }
    }

    private calculateSums() {
        this.summaryData.SumChecked = 0;
        this.summaryData.SumOpenDue = 0;
        this.summaryData.SumOpen = 0;

        setTimeout(() => {
            let posts = this.table.getTableData();

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

    private onRowSelected(data) {
        if (data) {
            let rowModel = data.rowModel;
            if (!rowModel.Markings) {
                rowModel.Markings = [];
            }

            let isSelected = rowModel._rowSelected;

            if (isSelected) {
                let currentSessionSum = 0;
                this.currentMarkingSession.forEach(x => {
                    currentSessionSum += x.RestAmount;
                });

                currentSessionSum += rowModel.RestAmount;

                let sumPositive = _.sumBy(this.currentMarkingSession.filter(x => x.RestAmount > 0), x => x.RestAmount);
                let sumNegative = _.sumBy(this.currentMarkingSession.filter(x => x.RestAmount < 0), x => x.RestAmount);
                let countPositive = this.currentMarkingSession.filter(x => x.RestAmount > 0).length;
                let countNegative = this.currentMarkingSession.filter(x => x.RestAmount < 0).length;

                let didSwitchAfterLastSelection: boolean = false;

                if ((sumPositive < Math.abs(sumNegative) && (sumPositive + rowModel.RestAmount) > Math.abs(sumNegative))
                    || (sumPositive > Math.abs(sumNegative) && (sumPositive + rowModel.RestAmount) < Math.abs(sumNegative))) {
                    didSwitchAfterLastSelection = true;
                }

                if (rowModel.StatusCode === StatusCodeJournalEntryLine.Marked) {
                    // row is already marked, dont do anything else here - the user is probably going
                    // to unmark a marked line. Let's help the user by selecting related rows for him
                    if (rowModel.Markings && rowModel.Markings.length > 0) {
                        let tableData = this.table.getTableData();

                        rowModel.Markings.forEach(line => {
                            let otherRow = tableData.find(x => x.ID === line.ID);

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
                    this.closeMarkingSession();
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
                } else if (((countPositive === 0 && rowModel.RestAmount > 0) || (countPositive === 1 && rowModel.RestAmount < 0))
                            && ((countNegative === 0 && rowModel.RestAmount < 0) || (countNegative === 1 && rowModel.RestAmount > 0))) {
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
            }
        }

        this.summaryData.SumChecked = 0;

        setTimeout(() => {
            this.currentSelectedRows = this.table.getSelectedRows();

            this.currentSelectedRows.forEach(x => {
                this.summaryData.SumChecked += x.RestAmount;
            });

            this.setSums();
        });
    }

    private autoMarkJournalEntries() {
        if (this.allMarkingSessions.length > 0) {
            this.toastService.addToast('Kan ikke kjøre automerking',
                ToastType.bad,
                ToastTime.medium,
                'Du har gjort endringer som ikke er lagret - lagre disse før du kjører automerking'
            );
            return;
        }

        let tableData = this.table.getTableData();

        // iterate not marked rows to see if any matches are found
        // for each item, check first if an exact match is found
        tableData.forEach(row => {

            if (row.StatusCode !== StatusCodeJournalEntryLine.Marked && row.RestAmount !== 0) {
                for (let i = 0; i < tableData.length; i++) {
                    let otherRow = tableData[i];
                    if (otherRow.StatusCode !== StatusCodeJournalEntryLine.Marked
                        && ((otherRow.RestAmount < 0 && row.RestAmount > 0)
                            || (otherRow.RestAmount > 0 && row.RestAmount < 0))
                        && Math.abs(otherRow.RestAmount) === Math.abs(row.RestAmount)) {

                        this.addToCurrentMarkingSession(otherRow);
                        this.addToCurrentMarkingSession(row);
                        this.closeMarkingSession();
                        break;
                    }
                }
            }
        });

        // iterate rows one more time to get an approximate match
        // for each item, if no exact matches has been found
        /*tableData.forEach(row => {
            if (row.StatusCode !== StatusCodeJournalEntryLine.Marked && row.RestAmount !== 0) {
                tableData.forEach(otherRow => {
                    if (otherRow.StatusCode !== StatusCodeJournalEntryLine.Marked
                        && otherRow.RestAmount !== 0
                        && ((otherRow.RestAmount < 0 && row.RestAmount > 0)
                                || (otherRow.RestAmount > 0 && row.RestAmount < 0))
                        && Math.abs(row.RestAmount + otherRow.RestAmount) < 10) {

                        row._isLikelyMatch = true;
                        this.table.updateRow(row._originalIndex, row);
                    }
                });
            }
        });*/


    }

    private addToCurrentMarkingSession(model) {
        this.currentMarkingSession.push(model);

        // run calculation of SumChecked before we try to find matches
        setTimeout(() => {
            this.setLikelyMatchCandidates();
        }, 100);
    }

    private setLikelyMatchCandidates() {
        let tableData = this.table.getTableData();

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
        } else if (this.allMarkingSessions.find(x => x.JournalEntryLineId1 === rowModel.ID || x.JournalEntryLineId2 === rowModel.ID)) {
            let affectedMarkings = this.allMarkingSessions.filter(x => x.JournalEntryLineId1 === rowModel.ID || x.JournalEntryLineId2 === rowModel.ID);

            // update unitable to remove bindings
            let tableData = this.table.getTableData();

            affectedMarkings.forEach(marking => {
                tableData.forEach(row => {
                    if (row.Markings && row.Markings.find(x => x.ID === marking.JournalEntryLineId1 || x.ID === marking.JournalEntryLineId2)) {
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

            this.allMarkingSessions = this.allMarkingSessions.filter(x => x.JournalEntryLineId1 !== rowModel.ID && x.JournalEntryLineId2 !== rowModel.ID);

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
            this.toastService.addToast('Kan ikke merke postene', ToastType.bad, 10, 'Du må velge minst to poster som skal markeres');
            return false;
        } else if (this.currentMarkingSession.filter(x => x.RestAmount > 0).length === 0 || this.currentMarkingSession.filter(x => x.RestAmount < 0).length === 0) {
            this.toastService.addToast('Kan ikke merke postene', ToastType.bad, ToastTime.medium, 'Du må velge både positive og negative beløp');
            return false;
        }

        // find largest amount, either negative or positive
        let sortedSessionList = this.currentMarkingSession.slice().sort((x, y) => x.RestAmount - y.RestAmount);

        let smallestRestAmountLine = sortedSessionList[0];
        let largestRestAmountLine = sortedSessionList[sortedSessionList.length - 1];

        let baseLine = Math.abs(smallestRestAmountLine.RestAmount) > Math.abs(largestRestAmountLine.RestAmount) ?
                            smallestRestAmountLine : largestRestAmountLine;

        if (!baseLine.Markings) {
            baseLine.Markings = [];
        }

        let originalBaseRestAmount = baseLine.RestAmount;
        let baseRestAmount = baseLine.RestAmount;

        if (this.currentMarkingSession.length === 1) {
            let newMarking: JournalEntryLineCouple = {
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
                        let newMarking: JournalEntryLineCouple = {
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

                        baseLine.Markings.push(x);
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

    private showHideEntires(newValue) {
        if (this.isDirty) {
            this.confirmModal.confirm(
                'Du har endringer som ikke er lagret, disse vil forkastes hvis du fortsetter - vil du fortsette?',
                'Fortsette uten å lagre?')
            .then(confirmDialogResponse => {
                if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                    this.allMarkingSessions = [];
                    this.currentMarkingSession = [];
                    this.currentSelectedRows = [];
                    this.isDirty = false;
                    this.displayPostsOption = newValue;

                    this.loadData();
                }
            });
        } else {
            this.allMarkingSessions = [];
            this.currentMarkingSession = [];
            this.currentSelectedRows = [];
            this.isDirty = false;
            this.displayPostsOption = newValue;
            this.loadData();
        }
    }

    private unlockJournalEntries() {
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
        new Promise((resolve, reject) => {
            if (this.isDirty && this.showMarkedEntries && hasRemoteMarkedRowsSelected) {
                this.confirmModal.confirm(
                    'Du har endringer som ikke er lagret, disse vil forkastes hvis du fortsetter - vil du fortsette?',
                    'Fortsette uten å lagre?')
                .then(confirmDialogResponse => {
                    if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                        resolve();
                    }
                });
            } else {
                // if we don't have any pending changes, or no remote markings are selected,
                // just resolve without asking user - we don't need to refresh the table then,
                // so we don't need to loose our changes
                resolve();
            }
        }).then(() => {
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
                    let journalEntryIDs: Array<number> = [];

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

    private abortMarking() {
        if (this.isDirty) {
            this.confirmModal.confirm(
                'Du har endringer som ikke er lagret, disse vil forkastes hvis du fortsetter - vil du fortsette?',
                'Fortsette uten å lagre?')
            .then(confirmDialogResponse => {
                if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                    this.allMarkingSessions = [];
                    this.currentMarkingSession = [];
                    this.currentSelectedRows = [];
                    this.isDirty = false;
                    this.loadData();
                }
            });
        } else {
            this.currentMarkingSession = [];
            this.currentSelectedRows = [];
            this.isDirty = false;
            this.loadData();
        }
    }

    private reconciliateJournalEntries() {
        // if at least 2 rows are marked but haven't been closed yet (because they dont match exactly),
        // close them before saving
        if (this.currentMarkingSession.length > 1) {
            if (!this.closeMarkingSession()) {
                this.toastService.addToast('Lagring avbrutt', ToastType.bad, ToastTime.medium, 'Fjern markeringene det er problemer med og forsøk igjen');
                return;
            }
        }

        if (this.allMarkingSessions.length === 0) {
            this.toastService.addToast('Lagring avbrutt', ToastType.warn, ToastTime.medium, 'Du har ikke gjort noen endringer som kan lagres');
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

    private markCheckedJournalEntries() {
        // this is used to force a marking of the selected marked rows - even though they
        // might not be an exact match
        this.closeMarkingSession();
    }

    private setupUniTable() {

        let filters: ITableFilter[] = [];
        if (this.displayPostsOption === 'OPEN') {
            filters.push({
                field: 'StatusCode',
                operator: 'ne',
                value: StatusCodeJournalEntryLine.Marked,
                group: 0
            });
        }

        this.journalEntryLineService.getJournalEntryLinePostPostData(
            this.displayPostsOption !== 'MARKED',
            this.displayPostsOption !== 'OPEN',
            this.customerID,
            this.supplierID)
            .subscribe(data => {
                this.journalEntryLines = data;
                setTimeout(() => {
                    this.calculateSums();
                });
            },
            (err) => this.errorService.handle(err)
        );

        let columns = [
                new UniTableColumn('JournalEntryNumber', 'Bilagsnr', UniTableColumnType.Text),
                new UniTableColumn('JournalEntryType.Name', 'Type', UniTableColumnType.Text)
                    .setTemplate(x => x.JournalEntryTypeName),
                new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.LocalDate),
                new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text),
                new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.DateTime),
                new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money),
                new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Money),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                    .setTemplate(x => this.journalEntryLineService.getStatusText(x.StatusCode)),
                new UniTableColumn('NumberOfPayments', 'Bet.', UniTableColumnType.Text)
                    .setWidth('60px')
                    .setTemplate(x => x.NumberOfPayments > 0 ? `<span title="${x.NumberOfPayments} relaterte betalinger finnes">1</span>` : ''),
                new UniTableColumn('Markings', 'Markert mot', UniTableColumnType.Text)
                    .setTemplate(item => {
                        return this.getMarkingsText(item);
                    })
            ];

        columns.forEach(x => {
            x.setConditionalCls((model) => {
                return this.getCssClasses(model, x.field);
            });
        });

        this.uniTableConfig = new UniTableConfig(false, true, 25)
            .setColumns(columns)
            .setMultiRowSelect(true)
            .setColumnMenuVisible(true)
            .setFilters(filters);
    }

    private getCssClasses(model, field) {
        let cssClasses = '';

        if (model.StatusCode === StatusCodeJournalEntryLine.Marked) {
            cssClasses += ' reconciliation-marked-row';
        } else {
            if (model._isLikelyMatch) {
                cssClasses +=  ' reconciliation-likely-match';
            }

            if (field === 'Amount') {
                cssClasses += ' ' + (model.Amount >= 0 ? 'number-good' : 'number-bad');
            }

            if (field === 'RestAmount') {
                cssClasses += ' ' + (model.RestAmount >= 0 ? 'number-good' : 'number-bad');
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
