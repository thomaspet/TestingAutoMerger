import {Component, Input} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import * as utils from '../../common/utils/utils';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {
    PageStateService, FinancialYearService
} from '@app/services/services';
import * as moment from 'moment';
import {Subject} from 'rxjs';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {UniModalService} from '@uni-framework/uni-modal';
import {HourTotalsDrilldownModal} from './drilldown-modal';
import {IReport, IPageState, IReportRow, IQueryData, ReportRow, HourReportInput} from './models';

@Component({
    selector: 'hourtotals',
    templateUrl: 'hourtotals.html',
    styleUrls: [ 'hourtotals.sass' ]
})
export class HourTotals {
    @Input() input: HourReportInput;
    onDestroy$ = new Subject();

    private currentOdata: { query: string, filter: string };
    public busy: boolean = false;
    public report: Array<IReport>;
    public toolbarConfig: IToolbarConfig;
    public saveactions = [
        {
            label: 'Eksport til Excel',
            action: done => this.exportToFile().then(() => done()),
            main: true
        }
    ];
    public isFilteredByTransfer = false;
    public isFilteredByInvoicable = false;
    public isMoney = false;
    public numberFormat = '';
    public numberFormat2 = '';
    private currentYear: number;

    groups = [
        { label: 'Timearter', name: 'worktypes' },
        { label: 'Medarbeidere', name: 'persons' },
        { label: 'Kunder', name: 'customers' },
        { label: 'Ordre', name: 'orders' },
        { label: 'Prosjekt', name: 'projects' },
        { label: 'Team', name: 'teams' },
    ];
    activeGroup = this.groups[0];

    constructor(
        private pageState: PageStateService,
        private http: UniHttp,
        private financialYearService: FinancialYearService,
        private modalService: UniModalService,
        tabService: TabService
    ) {
        tabService.addTab({
            url: '/timetracking/hourtotals',
            name: 'Timerapport',
            active: true,
            moduleID: UniModules.HourTotals
        });
    }

    public ngOnInit() {
        this.removeInputGroupFromSelectables();
        this.currentYear = this.financialYearService.getActiveFinancialYear().Year;
        const filterName = this.input && this.input.groupBy ? undefined : this.pageState.getPageState().groupby;
        this.onActiveGroupChange(this.getFilterByName(filterName) || this.groups[0]);
    }

    removeInputGroupFromSelectables() {
        if (this.input && this.input.groupBy) {
            for (let i = 0; i < this.groups.length; i++) {
                if (this.groups[i].name === this.input.groupBy.name) {
                    this.groups.splice(i, 1);
                    break;
                }
            }
        }
    }

    getFilterByName(name: string) {
        return this.groups.find( x => x.name === name);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    public onActiveGroupChange(group) {
        this.pageState.setPageState('groupby', group.name);
        this.activeGroup = group;
        this.refreshData();
    }

    public onCheckInvoiced() {
        this.refreshData();
    }

    private createFilter(name: string): { query: string, filter: string } {

        this.numberFormat = this.isMoney ? 'money' : 'int';
        this.numberFormat2 = this.isMoney ? 'money2' : '';

        const yr = this.currentYear || new Date().getFullYear();

        const valueMaro = this.isMoney
            // tslint:disable-next-line: max-line-length
            ? 'sum(multiply(casewhen(worktype.price gt 0,worktype.price,product.priceexvat),casewhen(minutestoorder ne 0,minutestoorder,minutes)))'
            : 'sum(casewhen(minutestoorder ne 0,minutestoorder,minutes))';

        let expandMacro = this.isMoney
            ? 'worktype.product'
            : 'worktype';

        let baseFilter = `year(date) ge ${(yr - 1)} and year(date) le ${yr}`;
        let filter = '';
        let select = '';

        if (this.input && this.input.groupBy && name !== this.input.groupBy.name) {
            switch (this.input.groupBy.name) {
                case 'worktypes':
                    baseFilter = this.addFilter(baseFilter, `worktypeid eq ${this.input.row.id}`);
                    break;
                case 'teams':
                    //todo
                    break;
                case 'persons':
                    baseFilter = this.addFilter(baseFilter, `workrelation.workerid eq ${this.input.row.id}`);
                    expandMacro += ',workrelation';
                    break;
                case 'customers':
                    baseFilter = this.addFilter(baseFilter, `customerid eq ${this.input.row.id}`);
                    break;
                case 'orders':
                    baseFilter = this.addFilter(baseFilter, `customerorderid eq ${this.input.row.id}`);
                    break;
                case 'projects':
                    baseFilter = this.addFilter(baseFilter, `dimensions.projectid eq ${this.input.row.id}`);
                    expandMacro += ',dimensions';
                    break;
                }
        }

        switch (name) {
            default:
            case 'worktypes':
                select = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,worktype.name as title,worktypeid as id`
                    + `&expand=${expandMacro}`
                    + `&orderby=year(date) desc,month(date),worktype.name`;
                    break;

            case 'teams':
                    select = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,casewhen(team.id gt 0,team.name,tt.name) as title,casewhen(team.id gt 0,team.id,tt.id) as id`
                    + `&join=worker.userid eq teamposition.userid as tp and teamposition.teamid eq team.id as tt`
                    + `&expand=workrelation.worker,workrelation.team,${expandMacro}`
                    + `&orderby=year(date) desc,month(date)`;
                    filter = 'casewhen(isnull(tp.id,0) gt 0,tp.position,0) lt 10';
                    break;

            case 'persons':
                    select = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,businessrelation.name as title,worker.id as id`
                    + `&join=worker.businessrelationid eq businessrelation.id`
                    + `&expand=workrelation.worker,${expandMacro}`
                    + `&orderby=year(date) desc,month(date)`;
                    break;

            case 'customers':
                    select = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,info.name as title,customer.id as id`
                    + `&expand=customer.info,${expandMacro}`
                    + `&orderby=year(date) desc,month(date)`;
                    filter = `customerid gt 0`;
                    break;

            case 'projects':
                    select = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,info.projectname as title,sum(minutes),dimensions.projectid as id`
                    + `&expand=dimensions.info,${expandMacro}`
                    + `&orderby=year(date) desc,month(date),sum(minutes) desc`;
                    filter = `dimensions.projectid gt 0`;
                    break;

            case 'orders':
                    select = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,customerorder.customername as title,sum(minutes),customerorder.id as id`
                    + `&expand=customerorder,${expandMacro}`
                    + `&orderby=year(date) desc,month(date),sum(minutes) desc`;
                    filter = `customerorderid gt 0`;
                    break;
        }

        if (this.isFilteredByTransfer) {
            filter = this.addFilter(filter, 'transferedtoorder eq 0');
        }

        if (this.isFilteredByInvoicable) {
            filter = this.addFilter(filter, 'worktype.productid gt 0');
        }

        return {
            query: `${select}&filter=${this.addFilter(baseFilter, filter)}`,
            filter: filter
        };
    }

    private addFilter(baseValue: string, value: string, operator: string = 'and'): string {
        if (baseValue && value) { return  `${baseValue} ${operator} ${value}`; }
        if (baseValue) { return baseValue; }
        return value;
    }

    private refreshData() {
        this.busy = true;
        const query = this.createFilter(this.activeGroup.name);
        this.currentOdata = query;
        this.getStatistics(query.query)
            .finally( () => this.busy = false)
            .subscribe( result => {
                this.report = this.buildReport(result);
            });
    }


    private buildReport(data: Array<IQueryData>): Array<IReport> {
        const groupedReports = [];
        let level1: IReport;
        let level2: IReportRow;
        if (!(data && data.length > 0)) { return groupedReports; }
        data.forEach( item => {
            if ((!level1) || level1.title !== item.yr.toString()) {
                level1 = {
                    title: item.yr.toString(),
                    columns: moment.monthsShort(),
                    sum: 0,
                    rows: []
                };
                groupedReports.push(level1);
            }
            if ((!level2) || level2.title !== item.title) {
                level2 = level1.rows.find( x => x.title === item.title );
                if (!level2) {
                    level2 = new ReportRow(item.title, item.yr, item.id);
                    level1.rows.push(level2);
                }
            }
            level2.items[item.md - 1].tsum = item.tsum;
            level2.sum += item.tsum;
            level1.sum += item.tsum;
        });
        groupedReports.forEach( (report: IReport) => {
            report.rows.forEach( row => row.prc = parseInt( (row.sum / ( report.sum || 1) * 100).toFixed(), 10 ) );
        });
        return groupedReports;
    }

    private getStatistics(query: string) {
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint(`?${query}`).send()
        .map(response => response.body).map( x => x.Data );
    }


    public exportToFile(): Promise<boolean> {
        return new Promise<boolean>( (resolve, reject) => {
            const csv = [];

            const colCount = this.report[0].columns.length + 2;

            // Title
            csv.push( utils.createRow(colCount, '', `Timerapport ${this.currentYear}` ));
            csv.push(utils.createRow(colCount, '', 'Fordeling: ' + this.activeGroup.label));
            if (this.isFilteredByInvoicable) {
                csv.push(utils.createRow(colCount, '', 'Utvalg:', 'fakturerbare timer (timeart knyttet til produkt)'));
            }
            if (this.isFilteredByTransfer) { csv.push(utils.createRow(colCount, '', 'Utvalg:', 'ikke overført til ordre')); }
            if (this.isMoney) { csv.push(utils.createRow(colCount, '', 'Pris:', 'Kalkulert basert på timeart')); }
            csv.push(utils.createRow(colCount, ''));

            this.report.forEach( group => {

                const record = [];
                record.push(this.activeGroup.label + ' - ' + group.title);
                record.push('Sum');
                group.columns.forEach(element => {
                    record.push(element);
                });
                csv.push(record);

                group.rows.forEach( item => {
                    const itemRow = [];
                    itemRow.push(item.title);
                    itemRow.push((item.sum / 60).toFixed());
                    item.items.forEach( sum => {
                        itemRow.push( (sum.tsum / 60).toFixed() );
                    });
                    csv.push(itemRow);
                });

                // Sum-row
                csv.push(utils.createRow(colCount, '', 'Sum', (group.sum / 60).toFixed() ));

                // Empty-row
                csv.push(utils.createRow(colCount, ''));
            });
            utils.exportToFile(utils.arrayToCsv(csv, undefined, undefined, undefined, false),
                `Timerapport_${this.activeGroup.label}.csv`);

            resolve(true);
        });
    }

    openDrilldownModal(row: IReportRow, cell: IQueryData, index: number) {
        const input: HourReportInput = {
            cell: { tsum: cell.tsum, md: index + 1, yr: row.year, title: undefined },
            row: row,
            groupBy: this.activeGroup,
            odata: this.currentOdata
        };

        this.modalService.open(HourTotalsDrilldownModal, {data: input});
    }

}

