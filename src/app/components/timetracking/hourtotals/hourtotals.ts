import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '@uni-framework/core/http/http';
import * as utils from '../../common/utils/utils';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {
    PageStateService, FinancialYearService
} from '@app/services/services';
import * as moment from 'moment';
import {Subject} from 'rxjs';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import {UniModalService} from '@uni-framework/uni-modal';
import { HourTotalsDrilldownModal } from './drilldown-modal';

interface IPageState {
    projectID?: string;
    month?: string;
    year?: string;
}

interface IQueryData {
    yr: number;
    md: number;
    tsum: number;
    title: string;
}

interface IReport {
    title: string;
    sum: number;
    columns: Array<string>;
    rows: Array<IReportRow>;
}

interface IReportRow {
    title: string;
    sum: number;
    prc: number;
    items: Array<{tsum: number}>;
}

class ReportRow implements IReportRow {
    public title: string;
    public sum: number;
    public prc: number;
    public items: Array<{tsum: number}>;
    constructor(title: string) {
        this.title = title;
        this.items = utils.createRow(12, () => ({ tsum: 0 }));
        this.sum = 0;
        this.prc = 0;
    }
}

@Component({
    selector: 'hourtotals',
    templateUrl: 'hourtotals.html',
    styleUrls: [ 'hourtotals.sass' ]
})
export class HourTotals {
    onDestroy$ = new Subject();

    private query: string;
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
        { label: 'Kunder', name: 'customers' },
        { label: 'Ordre', name: 'orders' },
        { label: 'Prosjekt', name: 'projects' },
        { label: 'Medarbeidere', name: 'persons' },
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
        this.currentYear = this.financialYearService.getActiveFinancialYear().Year;
        const filterName = this.pageState.getPageState().groupby;
        this.onActiveGroupChange(this.getFilterByName(filterName) || this.groups[0]);
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
        this.createFilter(group.name);
    }

    public onCheckInvoiced() {
        this.createFilter(this.activeGroup.name);
    }

    private createFilter(name: string) {

        const state: IPageState = this.pageState.getPageState();

        this.numberFormat = this.isMoney ? 'money' : 'int';
        this.numberFormat2 = this.isMoney ? 'money2' : '';

        const yr = this.currentYear || new Date().getFullYear();

        const valueMaro = this.isMoney
            // tslint:disable-next-line: max-line-length
            ? 'sum(multiply(casewhen(worktype.price gt 0,worktype.price,product.priceexvat),casewhen(minutestoorder ne 0,minutestoorder,minutes)))'
            : 'sum(casewhen(minutestoorder ne 0,minutestoorder,minutes))';

        const expandMacro = this.isMoney
            ? 'worktype.product'
            : 'worktype';

        switch (name) {
            default:
            case 'worktypes':
                this.query = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,worktype.name as title`
                    + `&expand=${expandMacro}`
                    + `&orderby=year(date) desc,month(date),worktype.name`
                    + `&filter=year(date) ge ${(yr - 1)}`;
                    break;

            case 'teams':
                    this.query = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,casewhen(team.id gt 0,team.name,tt.name) as title`
                    + `&join=worker.userid eq teamposition.userid as tp and teamposition.teamid eq team.id as tt`
                    + `&expand=workrelation.worker,workrelation.team,${expandMacro}`
                    + `&orderby=year(date) desc,month(date)`
                    + `&filter=year(date) ge ${(yr - 1)} and ( team.id gt 0 or tt.id gt 0 )`;
                    break;


            case 'persons':
                    this.query = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,businessrelation.name as title`
                    + `&join=worker.businessrelationid eq businessrelation.id`
                    + `&expand=workrelation.worker,${expandMacro}`
                    + `&orderby=year(date) desc,month(date)`
                    + `&filter=year(date) ge ${(yr - 1)}`;
                    break;

            case 'customers':
                    this.query = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,info.name as title`
                    + `&expand=customer.info,${expandMacro}`
                    + `&orderby=year(date) desc,month(date)`
                    + `&filter=year(date) ge ${(yr - 1)} and customerid gt 0`;
                    break;

            case 'projects':
                    this.query = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,info.projectname as title,sum(minutes)`
                    + `&expand=dimensions.info,${expandMacro}`
                    + `&orderby=year(date) desc,month(date),sum(minutes) desc`
                    + `&filter=year(date) ge ${(yr - 1)} and dimensions.projectid gt 0`;
                    break;

            case 'orders':
                    this.query = 'model=workitem'
                    + `&select=${valueMaro} as tsum,year(date) as yr,month(date) as md,customerorder.customername as title,sum(minutes)`
                    + `&expand=customerorder,${expandMacro}`
                    + `&orderby=year(date) desc,month(date),sum(minutes) desc`
                    + `&filter=year(date) ge ${(yr - 1)} and customerorderid gt 0`;
                    break;
        }

        if (state.year) {
            this.query += ` and year(date) eq ${parseInt(state.year, 10)}`;
        }

        if (state.month) {
            this.query += ` and month(date) eq ${parseInt(state.month, 10)}`;
        }

        if (this.isFilteredByTransfer) {
            this.query += ` and transferedtoorder eq 0`;
        }

        if (this.isFilteredByInvoicable) {
            this.query += ` and worktype.productid gt 0`;
        }

        this.query += ` and year(date) le ${yr}`;

        this.refreshData();
    }

    private refreshData() {
        this.busy = true;
        this.getStatistics(this.query)
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
                    level2 = new ReportRow(item.title);
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

    openDrilldownModal(row, col, index) {
        const modalOptions = {
        };

        this.modalService.open(HourTotalsDrilldownModal, {data: modalOptions});
    }

}

