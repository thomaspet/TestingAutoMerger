import {Component, ErrorHandler, SimpleChanges} from '@angular/core';
import {ConfirmActions, UniConfirmModalV2, UniModalService} from '@uni-framework/uni-modal';
import {CreateOpeningBalanceModal} from '@app/components/settings/opening-balance/createOpeningBalanceModal';
import {IColumnTooltip, UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {FieldType} from '@uni-framework/ui/uniform';
import {EditDraftLineModal} from '@app/components/settings/opening-balance/editDraftLineModal';
import {OpeningBalanceService} from '@app/components/settings/opening-balance/openingBalanceService';
import {forkJoin} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {GoToPostModal} from '@app/components/settings/opening-balance/goToPostModal';

@Component({
    selector: 'opening-balance-component',
    templateUrl: './openingBalance.html'
})
export class OpeningBalanceComponent {
    busy = false;
    showInfoBox = true;
    toolbarConfig = {
        title: 'NAVBAR.OPENING_BALANCE'
    };
    saveActions = [
        {
            label: `Lagre og Bokfør`,
            action: (done) => this.saveAndPost().pipe(
                switchMap((posts => this.modalService.open(GoToPostModal,{data: {postNumber: posts[0].JournalEntryNumber}}).onClose)),
            ).subscribe(() => {
                done('Lagret og bokført');
                this.disableSaveButton();
            }, err => this.errorHandler.handleError(err)),
            main: true,
            disabled: true
        }
    ];
    draftlines = null;
    tableconfig = null;
    dateModel = {
        financialDate: new Date()
    };
    dateform = [
        {
            Property: 'financialDate',
            Label: 'Dato for åpningsbalanse',
            FieldType: FieldType.LOCAL_DATE_PICKER,
        }
    ];
    fileIDs = [];
    constructor(
        private modalService: UniModalService,
        private openingBalanceService: OpeningBalanceService,
        private errorHandler: ErrorHandler
    ) {
        this.tableconfig = this.createTableConfig();
    }

    onDateChange(changes: SimpleChanges) {
        this.draftlines = this.draftlines.map(line => {
            line._date = changes.financialDate.currentValue;
            return line;
        });
    }

    openOpeningBalanceModal() {
        this.modalService.open(CreateOpeningBalanceModal).onClose.subscribe(result => {
            if (!result) {
                return;
            }
            this.dateModel = {
                financialDate: result.startDate
            };
            this.busy = true;
            this.openingBalanceService.getOpeningBalanceAccounts()
                .subscribe((accounts) => {
                    this.draftlines = this.createTableLines(result, accounts);
                    this.busy = false;
                    this.enableSaveButton();
                });
        });
    }

    enableSaveButton() {
        this.saveActions[0].disabled = false;
        this.saveActions = [...this.saveActions];
    }
    disableSaveButton() {
        this.saveActions[0].disabled = true;
        this.saveActions = [...this.saveActions];
    }

    createTableConfig() {
        const tableColumns = [
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text, false)
                .setTooltipResolver((rowModel) => {
                    if (rowModel.Description === 'Stiftelsekostnader') {
                        return <IColumnTooltip> {
                            type: 'neutral',
                            text: 'Når du får faktura fra Brønnøysundregistrene som gjelder stiftelsekostnader, skal disse føres mot konto 2960'
                        };
                    }
                    return null;
                }),
            new UniTableColumn('AmountCurrency', 'Beløp', UniTableColumnType.Money, false)
                .setTemplate(rowModel => rowModel.AmountCurrency === 0 ? '0' : rowModel.AmountCurrency)
                .setAlignment('left'),
            new UniTableColumn('FromAccountID', 'Fra Konto (debet)', UniTableColumnType.Text, false)
                .setTemplate(rowModel => `${rowModel?._FromAccount?.AccountNumber || ''} - ${rowModel?._FromAccount?.AccountName || ''}`),
            new UniTableColumn('ToAccountID', 'Til Konto (kredit)', UniTableColumnType.Text, false)
                .setTemplate(rowModel => `${rowModel?._ToAccount?.AccountNumber || ''} - ${rowModel?._ToAccount?.AccountName || ''}`),
        ];

        return new UniTableConfig('accounting.assets.list', false, true, 15)
            .setContextMenu([
                {
                    label: 'Rediger',
                    action: (rowModel) => this.edit(rowModel)
                },
                {
                    label: 'Slett',
                    action: (rowModel) => this.remove(rowModel),
                    class: 'bad'
                }
            ])
            .setSortable(false)
            .setVirtualScroll(false)
            .setSearchable(false)
            .setColumnMenuVisible(true)
            .setColumns(tableColumns);

    }

    remove(draftline) {
        this.modalService.open(UniConfirmModalV2, {
            header: 'Bekreft sletting',
            message: 'Er du sikker på at du vil slette linjen?',
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe((result) => {
            if (result === ConfirmActions.ACCEPT) {
                this.draftlines = this.draftlines.filter(line => line['_guid'] !== draftline['_guid']);
            }
        });
    }

    edit(draftline) {
        this.modalService.open(EditDraftLineModal, {
            data: {
                draftline: draftline
            }
        }).onClose.subscribe(result => {
            if (result) {
                forkJoin([
                    this.openingBalanceService.getAccount(result?.FromAccountID),
                    this.openingBalanceService.getAccount(result?.ToAccountID)
                ]).subscribe(accountsList => {
                    const index = this.draftlines.findIndex(line => draftline?._guid === line['_guid']);
                    result['_FromAccount'] = accountsList[0][0];
                    result['_ToAccount'] = accountsList[1][0];
                    result['_date'] = this.dateModel.financialDate;
                    if (index > -1) {
                        this.draftlines[index] = result;
                        this.draftlines = [].concat(this.draftlines);
                    } else {
                        this.draftlines.push(result);
                        this.draftlines = [].concat(this.draftlines);
                    }
                });
            }
         });
    }

    saveAndPost() {
        return this.openingBalanceService.getGeneralNumberSeriesTaskData().pipe(
            map(numberSerie => this.createJournalEntry(numberSerie)),
            switchMap(journalEntry => this.openingBalanceService.saveAndPost(journalEntry))
        );
    }

    onFileUploaded(file) {
        this.fileIDs.push(file.data.ID);
    }

    onFileDetached(file) {
        this.fileIDs = this.fileIDs.filter(id => id !== file.data.ID);
    }

    private createTableLines(result, accounts) {
        const [account1920, account2000, account2020, account2036, account2960] = accounts;
        const lines = [];
        lines.push({
            Description: 'Aksjekapital',
            AmountCurrency: result.stocksCapital,
            FromAccountID: account1920.ID,
            ToAccountID: account2000.ID,
            _FromAccount: account1920,
            _ToAccount: account2000,
            _date: result.startDate
        });
        if (result.hasExtraCapital) {
            lines.push({
                Description: 'Aksjekapital',
                AmountCurrency: result.extraCapital,
                FromAccountID: account1920.ID,
                ToAccountID: account2020.ID,
                _FromAccount: account1920,
                _ToAccount: account2020,
                _date: result.startDate
            });
        }
        lines.push({
            Description: 'Stiftelsekostnader',
            AmountCurrency: result.foundationCosts,
            FromAccountID: result.hasFoundationCosts ? account1920.ID : account2036.ID,
            ToAccountID: account2960.ID,
            _FromAccount: result.hasFoundationCosts ? account1920 : account2036,
            _ToAccount: account2960,
            _date: result.startDate
        });
        return lines;
    }

    private createJournalEntry(numberSeries) {
        return {
            NumberSeriesID: numberSeries.ID,
            NumberSeriesTaskID: numberSeries.NumberSeriesTaskID,
            Payments: [],
            FileIDs: this.fileIDs,
            DraftLines: this.createJournalEntryLines.bind(this)()
        };
    }

    private createJournalEntryLines() {
        const financialYear = this.openingBalanceService.getActiveFinancialYear().Year;
        const journalEntryLines = [];
        this.draftlines.forEach(line => {
            // this object can be optimized. It has been copied from generate a journalentry manually
            const draftline1 = {
                AccountID: line.FromAccountID,
                Amount: line.AmountCurrency,
                AmountCurrency: line.AmountCurrency,
                CurrencyCodeID: 1,
                CurrencyExchangeRate: 1,
                Description: line.Description,
                FinancialDate: `01-01-${financialYear}`,
                JournalEntryTypeID: null,
                RegisteredDate: line._date,
                VatDate: `01-01-${financialYear}`,
                VatDeductionPercent: 0,
                VatType: null,
                VatTypeID: null
            };
            const draftline2 = {
                AccountID: line.ToAccountID,
                Amount: line.AmountCurrency * -1,
                AmountCurrency: line.AmountCurrency * -1,
                CurrencyCodeID: 1,
                CurrencyExchangeRate: 1,
                Description: line.Description,
                FinancialDate: `01-01-${financialYear}`,
                JournalEntryTypeID: null,
                RegisteredDate: line._date,
                VatDate: `01-01-${financialYear}`,
                VatDeductionPercent: 0,
                VatType: null,
                VatTypeID: null
            };
            journalEntryLines.push(draftline1, draftline2);
        });
        return journalEntryLines;
    }
}
