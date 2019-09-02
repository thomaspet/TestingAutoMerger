import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {Project} from '../../../../unientities';
import * as utils from '../../../common/utils/utils';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {
    PageStateService,
    ProjectService,
    ErrorService,
    UserService
} from '../../../../services/services';
import * as moment from 'moment';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

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
    onDestroy$ = new Subject();

    public currentProjectID: number;
    public currentProject: Project;
    private filter: string;
    public busy: boolean = false;
    public report: Array<IReport>;
    public toolbarConfig: IToolbarConfig;

    filters = [
        { label: 'Timearter', name: 'worktypes' },
        { label: 'Personer', name: 'persons' },
    ];
    activeFilter = this.filters[0];

    constructor(
        private pageState: PageStateService,
        private http: UniHttp,
        private router: Router,
        private projectService: ProjectService
    ) {}

    public ngOnInit() {
        this.onActiveFilterChange(this.filters[0]);

        this.projectService.toolbarConfig.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe( cfg => {
            this.toolbarConfig = cfg;
        });

        this.projectService.currentProject.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe( p => {
            this.currentProject = p;
        });
    }

    ngOnDestroy() {
        this.removeContextMenu();
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    public onAddHoursClick() {
        if (this.currentProjectID) {
            this.router.navigateByUrl(`/timetracking/timeentry?projectID=${this.currentProjectID}`);
        } else {
            this.router.navigateByUrl('/timetracking/timeentry');
        }
    }

    public onActiveFilterChange(filter) {
        this.activeFilter = filter;
        this.createFilter(filter.name);
    }

    private createFilter(name: string) {

        var state: IPageState = this.pageState.getPageState();
        if (state.projectID) {
            this.currentProjectID = parseInt(state.projectID || '0');
        }

        if (!this.currentProjectID) {
            return;
        }

        switch (name) {
            default:
            case 'worktypes':
                this.filter = 'model=workitem'
                    + `&select=sum(minutes) as tsum,year(date) as yr,month(date) as md,worktype.name as title`
                    + `&expand=dimensions,worktype`
                    + `&orderby=year(date) desc,month(date)`
                    + `&filter=dimensions.projectid eq ${this.currentProjectID || 0} and year(date) gt 1980`;
                    break;

            case 'persons':
                    this.filter = 'model=workitem'
                    + `&select=sum(minutes) as tsum,year(date) as yr,month(date) as md,businessrelation.name as title`
                    + `&join=worker.businessrelationid eq businessrelation.id`
                    + `&expand=dimensions,workrelation.worker`
                    + `&orderby=year(date) desc,month(date)`
                    + `&filter=dimensions.projectid eq ${this.currentProjectID || 0} and year(date) gt 1980`;
                    break;
        }

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
            this.setupContextMenu();
        });
    }


    private setupContextMenu() {
        utils.addContextMenu(this.toolbarConfig, 'export', 'Eksporter timeoversikt', () => this.exportToFile());
        this.projectService.toolbarConfig.next(this.toolbarConfig);
    }

    private removeContextMenu() {
        if (this.toolbarConfig) {
            utils.removeContextMenu(this.toolbarConfig, 'export');
            this.projectService.toolbarConfig.next(this.toolbarConfig);
        }
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
        .map(response => response.body).map( x => x.Data );
    }


    public exportToFile(): Promise<boolean> {
        return new Promise<boolean>( (resolve, reject) => {
            var csv = [];

            if (!this.currentProject) {
                resolve(false);
                return;
            }

            // No report?
            if (!(this.currentProject && this.report && this.report.length > 0)) {
                resolve(false);
                return;
            }
            let colCount = this.report[0].columns.length + 2;

            // Title
            csv.push( utils.createRow(colCount, '',
                `Prosjektnr. ${this.currentProject.ProjectNumber} - ${this.currentProject.Name}` ));
            csv.push(utils.createRow(colCount, ''));
            csv.push(utils.createRow(colCount, ''));

            this.report.forEach( group => {

                var record = [];
                record.push(group.title);
                record.push('Sum');
                group.columns.forEach(element => {
                    record.push(element);
                });
                csv.push(record);

                group.rows.forEach( item => {
                    var itemRow = [];
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
                `ProjectHours_ProjectNumber${this.currentProject.ProjectNumber}.csv`);

            resolve(true);
        });
    }

}

class ReportRow implements IReportRow {
    public title: string;
    public sum: number;
    public prc: number;
    public items: Array<{tsum: number}>;
    constructor(title: string) {
        this.title = title;
        this.items = utils.createRow(12, () => { return { tsum: 0 }; });
        this.sum = 0;
        this.prc = 0;
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
