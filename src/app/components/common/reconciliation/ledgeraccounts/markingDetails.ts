import {Component, Input, Output, EventEmitter} from '@angular/core';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {UniTableColumn, UniTableConfig, UniTableColumnType, UniTableColumnSortMode} from '../../../../../framework/ui/unitable/index';
import {PostPostService, JournalEntryLineService, StatisticsService} from '../../../../services/services';
import {Subject} from 'rxjs';

@Component({
    selector: 'uni-markingdetails-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign" style="width: 80vw;">
            <header>Vis avmerkingsdetaljer</header>

            <article>
                <mat-progress-bar
                    *ngIf="loading$ | async"
                    class="uni-progress-bar"
                    mode="indeterminate">
                </mat-progress-bar>
                <ag-grid-wrapper
                    class="transquery-grid-font-size"
                    *ngIf="markings.length"
                    [config]="tableConfig"
                    [resource]="markings">
                </ag-grid-wrapper>
            </article>

            <footer class="center">
                <button class="c2a rounded" (click)="unlock()">Gjenåpne poster</button>
                <button (click)="close()">Lukk</button>
            </footer>
        </section>
    `
})

export class UniMarkingDetailsModal implements IUniModal {

    tableConfig: UniTableConfig;
    markings: any[] = [];
    loading$: Subject<boolean> = new Subject();

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    constructor(
        private toast: ToastService,
        private postpostService: PostPostService,
        private journalEntryLineService: JournalEntryLineService,
        private statisticsService: StatisticsService
    ) { }

    public ngOnInit() {
        this.loading$.next(true);
        this.loadData().subscribe(res => {
            this.markings = res;
            this.tableConfig = this.getTableConfig();
            this.loading$.next(false);
        }, err => {
            this.toast.addToast('Kunne ikke laste av detaljer', ToastType.bad, 10);
            this.loading$.next(false);
            this.close();
        });
    }

    private loadData() {
        // Build filter based on IDs passed to the modal
        const filter = 'ID eq ' + this.options.data.ids.join(' or ID eq ');
        // Build select based on the fields on the table config
        const select = 'ID as ID,' + this.getTableColumns().map(col => col.field).map(field => field + ' as ' + field).join(',');
        return this.statisticsService.GetAllUnwrapped(`model=journalentryline&select=${select}&filter=${filter}`);
    }

    public unlock() {
        this.loading$.next(true);
        // Unlock all markings and close modal on success. Postpost view will then reload data
        this.postpostService.revertPostpostMarking(this.markings.map(mark => mark.ID)).subscribe(() => {
            this.toast.addToast('Rader låst opp', ToastType.good, 5);
            this.loading$.next(false);
            this.close(true);
        }, err => {
            // Dont close modal if something went wrong.
            this.toast.addToast('Noe gikk galt', ToastType.good, 5, 'Kunne ikke gjenåpne radene.');
            this.loading$.next(false);
        });
    }

     public close(hasUnlocked: boolean = false) {
         this.onClose.emit(hasUnlocked);
     }

     private formatter(value: number) {
        if (!value && value !== 0) {
            return '';
        }

        let stringValue = value.toString().replace(' ', '').replace(',', '.');
        stringValue = parseFloat(stringValue).toFixed(2);

        let [integer, decimal] = stringValue.split('.');
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');

        stringValue = decimal ? (integer + ',' + decimal) : integer;

        return stringValue;
    }

     public getTableConfig() {
        return new UniTableConfig('autobank_agreement_list_modal', false, true, 15)
            .setColumns(this.getTableColumns())
            .setConditionalRowCls((row) => {
                return (row && row.StatusCode === 31003) ? 'journal-entry-credited' : '';
            })
            .setColumnMenuVisible(true);
    }

     private getTableColumns() {
         return [
            new UniTableColumn('JournalEntryNumber', 'Bilagsnr', UniTableColumnType.Link)
                .setWidth('7rem')
                .setCls('table-link')
                .setLinkResolver(row => {
                    // Close the modal then redirect to transquery details..
                    this.close();
                    const numberAndYear = row.JournalEntryNumber.split('-');
                    if (numberAndYear.length > 1) {
                        return `/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=${numberAndYear[1]}`;
                    } else {
                        const year = row.FinancialDate ? new Date(row.FinancialDate).getFullYear() : new Date().getFullYear();
                        return `/accounting/transquery?JournalEntryNumber=${row.JournalEntryNumber}&AccountYear=${year}`;
                    }
                }),
            new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.LocalDate),
            new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.LocalDate)
                .setVisible(false),
            new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text),
            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Number)
                .setWidth('7rem')
                .setTemplate(row => this.formatter(row.Amount) )
                .setConditionalCls(row => {
                    if (parseInt(row.Amount, 10) >= 0) {
                        return 'number-good';
                    }
                    return 'number-bad';
                }),
            new UniTableColumn('AmountCurrency', 'V-Beløp', UniTableColumnType.Number)
                .setVisible(false)
                .setSortMode(UniTableColumnSortMode.Absolute)
                .setTemplate(row => this.formatter(row.AmountCurrency) )
                .setConditionalCls(row => {
                    if (parseInt(row.AmountCurrency, 10) >= 0) {
                        return 'number-good';
                    }
                    return 'number-bad';
                }),
            new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Number)
                .setSortMode(UniTableColumnSortMode.Absolute)
                .setWidth('7rem')
                .setTemplate(row => this.formatter(row.RestAmount) )
                .setConditionalCls(row => {
                    if (parseInt(row.RestAmount, 10) >= 0) {
                        return 'number-good';
                    }
                    return 'number-bad';
                }),
            new UniTableColumn('RestAmountCurrency', 'V-Restbeløp', UniTableColumnType.Number)
                .setVisible(false)
                .setTemplate(row => this.formatter(row.RestAmountCurrency) )
                .setConditionalCls(row => {
                    if (parseInt(row.RestAmountCurrency, 10) >= 0) {
                        return 'number-good';
                    }
                    return 'number-bad';
                }),
            new UniTableColumn('PaymentID', 'KID', UniTableColumnType.Text)
                .setVisible(false),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                .setWidth('7rem'),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setWidth('7rem')
                .setTemplate(x => this.journalEntryLineService.getStatusText(x.StatusCode)),
        ];
     }
}
