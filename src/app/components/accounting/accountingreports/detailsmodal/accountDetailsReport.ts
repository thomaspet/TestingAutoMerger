import {Component, ViewChild, Input} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {JournalEntryService, StatisticsService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {UniTableColumn, UniTableConfig, UniTableColumnType, ITableFilter, UniTable} from 'unitable-ng2/main';
import {DistributionPeriodReportPart} from '../reportparts/distributionPeriodReportPart';
import {Account, JournalEntryLine, JournalEntry} from '../../../../unientities';
import {ImageModal} from '../../../common/modals/ImageModal';
import {DimensionService} from '../../../../services/common/DimensionService';

declare const moment;
const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

@Component({
    selector: 'accounting-details-report',
    templateUrl: 'app/components/accounting/accountingreports/detailsmodal/accountDetailsReport.html',
})
export class AccountDetailsReport {
    @Input() public config: { close: () => void, accountID: number, accountNumber: number, accountName: string, dimensionType: number, dimensionId: number };
    @ViewChild(ImageModal) private imageModal: ImageModal;
    @ViewChild(UniTable) private transactionsTable: UniTable;
    @ViewChild(DistributionPeriodReportPart) private distributionPeriodReportPart: DistributionPeriodReportPart;

    private uniTableConfigTransactions: UniTableConfig;

    private periodFilter1: PeriodFilter;
    private periodFilter2: PeriodFilter;
    private accountIDs: Array<number> = [];
    private includeIncomingBalanceInDistributionReport: boolean = false;

    private dimensionEntityName: string;

    private transactionsLookupFunction: (urlParams: URLSearchParams) => any;
    private doTurnDistributionAmounts: boolean = false;

    constructor(private statisticsService: StatisticsService) {
    }

    public ngOnInit() {
        this.transactionsLookupFunction = (urlParams: URLSearchParams) => this.getTableData(urlParams);
    }

    // modal is reused if multiple accounts are viewed, and the loadData will be called from the accountDetailsReportModal
    // when opening the modal
    public loadData() {
        // get default period filters
        this.periodFilter1 = PeriodFilterHelper.getFilter(1, null);
        this.periodFilter2 = PeriodFilterHelper.getFilter(2, this.periodFilter1);
        this.accountIDs = [this.config.accountID];

        if (this.config.dimensionType && this.config.dimensionId) {
             this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.config.dimensionType);
        } else {
            this.dimensionEntityName = null;
        }

        // "turn" amounts for accountgroup 2 and 3, because it will be confusing for the users when these amounts are
        // displayed as negative numbers (which they will usually be)
        this.doTurnDistributionAmounts = this.config.accountNumber.toString().substring(0, 1) === '2' || this.config.accountNumber.toString().substring(0, 1) === '3';

        // include incoming balance for balance accounts
        this.includeIncomingBalanceInDistributionReport = this.config.accountNumber.toString().substring(0, 1) === '1' || this.config.accountNumber.toString().substring(0, 1) === '2';

        setTimeout(() => {
            this.setupTransactionsTable();
        });
    }

    private getTableData(urlParams: URLSearchParams): Observable<JournalEntryLine[]> {
        urlParams = urlParams || new URLSearchParams();
        const filters = [];

        if (urlParams.get('filter')) {
            filters.push(urlParams.get('filter'));
        }

        filters.push(`JournalEntryLine.AccountID eq ${this.config.accountID}`);
        filters.push(`Period.AccountYear eq ${this.periodFilter1.year}`);
        filters.push(`Period.No ge ${this.periodFilter1.fromPeriodNo}`);
        filters.push(`Period.No le ${this.periodFilter1.toPeriodNo}`);
        filters.push('isnull(FileEntityLink.EntityType,\'JournalEntry\') eq \'JournalEntry\'');

        if (this.dimensionEntityName) {
            filters.push(`isnull(Dimensions.${this.dimensionEntityName}ID,0) eq ${this.config.dimensionId}`);
        }

        urlParams.set('model', 'JournalEntryLine');
        urlParams.set('select', 'ID as ID,JournalEntryNumber as JournalEntryNumber,FinancialDate,Description as Description,VatType.VatCode,Amount as Amount,Department.Name,Project.Name,Department.DepartmentNumber,Project.ProjectNumber,count(FileEntityLink.ID) as Attachments,JournalEntryID as JournalEntryID');
        urlParams.set('expand', 'Account,VatType,Dimensions.Department,Dimensions.Project,Period');
        urlParams.set('join', 'JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID');
        urlParams.set('filter', filters.join(' and '));

        return this.statisticsService.GetAllByUrlSearchParams(urlParams);
    }

    private switchPeriods() {
        let tmp = this.periodFilter1;
        this.periodFilter1 = this.periodFilter2;
        this.periodFilter2 = tmp;

        this.transactionsTable.refreshTableData();
    }

    private setupTransactionsTable() {

        this.uniTableConfigTransactions = new UniTableConfig(false, false)
            .setPageable(true)
            .setPageSize(20)
            .setSearchable(true)
            .setDataMapper((data) => {
                let tmp = data !== null ? data.Data : [];

                return tmp;
            })
            .setColumns([
                new UniTableColumn('JournalEntryNumber', 'Bilagsnr')
                    .setFilterOperator('contains'),
                new UniTableColumn('FinancialDate', 'Regnskapsdato', UniTableColumnType.Date)
                    .setFilterOperator('contains')
                    .setFormat('DD.MM.YYYY')
                    .setTemplate(line => line.JournalEntryLineFinancialDate),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                    .setFilterOperator('contains'),
                new UniTableColumn('VatType.VatCode', 'Mvakode', UniTableColumnType.Text)
                    .setFilterOperator('eq')
                    .setTemplate(line => line.VatTypeVatCode),
                new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                    .setCls('column-align-right')
                    .setFilterOperator('eq'),
                new UniTableColumn('Department.Name', 'Avdeling', UniTableColumnType.Text).setFilterOperator('contains')
                    .setTemplate(line => { return line.DepartmentDepartmentNumber ? line.DepartmentDepartmentNumber + ': ' + line.DepartmentName : ''; }),
                new UniTableColumn('Project.Name', 'Prosjekt', UniTableColumnType.Text).setFilterOperator('contains')
                    .setTemplate(line => { return line.ProjectProjectNumber ? line.ProjectProjectNumber + ': ' + line.ProjectName : ''; }),
                new UniTableColumn('ID', PAPERCLIP, UniTableColumnType.Text).setFilterOperator('contains')
                    .setTemplate(line => line.Attachments ? PAPERCLIP : '')
                    .setWidth('40px')
                    .setOnCellClick(line => this.imageModal.open(JournalEntry.EntityType, line.JournalEntryID))
            ]);
    }
}
