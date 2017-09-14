import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {
    PageStateService,
    ErrorService
} from '../../../../services/services';
import * as moment from 'moment';

interface IPageState { 
    projectID?: string; 
    month?: string; 
    year?: string;
}

@Component({
    selector: 'project-hourtotals',
    templateUrl: 'hourtotals.html'
})
export class ProjectHourTotals {
    private currentProjectID: number;
    private filter: string; 
    private busy: boolean = false;
    private report: Array<IReport>;

    constructor(
        private pageState: PageStateService,
        private http: UniHttp,
        private route: ActivatedRoute,
        private errorService: ErrorService) {
        
    }

    public ngOnInit() {        
        this.route.queryParams.subscribe((params) => {
            this.createFilter();
        });
    }

    private createFilter() {

        var state: IPageState = this.pageState.getPageState();
        if (state.projectID) {
            this.currentProjectID = parseInt(state.projectID || '0');
        }

        this.filter = 'model=workitem'
            + `&select=sum(minutes) as tsum,year(date) as yr,month(date) as md,worktype.name as title`
            + `&join=worker.businessrelationid eq businessrelation.id`
            + `&expand=dimensions,worktype,workrelation.worker`
            + `&orderby=year(date) desc,month(date)`
            + `&filter=dimensions.projectid eq ${this.currentProjectID || 0} and year(date) gt 1980`;

        if (state.year) {
            this.filter += ` and year(date) eq ${parseInt(state.year)}`;
        }

        if (state.month) {
            this.filter += ` and month(date) eq ${parseInt(state.month)}`;
        }

        this.refreshData();
    }

    private refreshData() {
        this.busy = true;
        this.getStatistics(this.filter)            
        .finally( () => this.busy = false)
        .subscribe( result => {
            this.report = this.buildReport(result);
        });
    }

    private buildReport(data: Array<IQueryData>): Array<IReport> {
        var groupedReports = [];
        var level1: IReport;
        var level2: IReportRow;
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
            report.rows.forEach( row => row.prc = parseInt( (row.sum / ( report.sum || 1) * 100).toFixed() ) );
        });
        return groupedReports;
    }

    private getStatistics(query: string) {
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint(`?${query}`).send()
        .map(response => response.json()).map( x => x.Data );
    }
   
}

class ReportRow implements IReportRow {
    public title: string;
    public sum: number;
    public prc: number;
    public items: Array<{tsum: number}>;    
    constructor(title: string) {
        this.title = title;
        this.items = this.newSums();
        this.sum = 0;
        this.prc = 0;
    }

    private newSums(): Array<{ tsum: number }> {
        var sums = [];
        for (var i = 0; i < 12; i++) { sums.push( { tsum: 0 }); }
        return sums;
    }    
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
