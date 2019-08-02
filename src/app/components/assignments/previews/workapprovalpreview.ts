import {Component, Input} from '@angular/core';
import {ErrorService} from '../../../services/services';
import {Task, WorkItemGroup} from '../../../unientities';
import {UniHttp} from '../../../../framework/core/http/http';

@Component({
    selector: 'work-approval-preview',
    templateUrl: './workapprovalpreview.html',
    styles: [ `
        table {
            width: 100%;
            table-layout: fixed;
            overflow: hidden;
            padding: 0;
        }
        th {
            border-bottom: 1px solid #eee;
        }
        td {
            padding: 0.2em 0.2em 0.2em 0;
            border-bottom: 1px solid #efefef;
            border-left: 1px solid #efefef;
            white-space: nowrap;
            overflow: hidden;
        }
        tr td:first-of-type {
            border-left: 0;
        }
        th.s1 {
            width: 3em;
        }
        th.s2 {
            width: 4em;
        }
        th.s3 {
            width: 5em;
        }
        th.left {
            text-align: left
        }
        th.right, td.right {
            text-align: right;
        }
        th.center, td.center {
            text-align: center;
        }
    `]
})
export class WorkApprovalPreview {
    @Input() public task: Task;
    public group: WorkItemGroup;
    public busy: boolean = true;
    public counter: number;
    public report: { Relation: any, FromDate: Date, ToDate: Date, Items: Array<any> };

    constructor(
        private errorService: ErrorService,
        private http: UniHttp
    ) {
    }

    public ngOnChanges() {
        if (this.task && this.task.EntityID) {
            this.fetchGroupDetails(this.task.EntityID);
        }
    }

    private fetchGroupDetails(id: number) {
        this.busy = true;
        this.getStatistics('model=workitem&select=workrelationid as WorkrelationID'
            + ',min(date) as MinDate,max(date) as MaxDate'
            + ',count(id) as Count&filter=workitemgroupid eq ' + id)
            .map( x => x.Data )
            .finally( () => this.busy = false)
            .subscribe( (list: Array<{ WorkrelationID, MinDate, MaxDate, Count}>) => {
                if (list && list.length > 0) {
                    var item = list[0];
                    this.counter = item.Count;
                    this.fetchTimeSheet( list[0].WorkrelationID, list[0].MinDate, list[0].MaxDate);
                }
            },
            err => this.errorService.handle(err));
    }

    private fetchTimeSheet(relationId: number, fromDate: string, toDate: string) {
        var d1 = fromDate.substr(0, 10);
        var d2 = toDate.substr(0, 10);
        this.get(`workrelations/${relationId}?action=timesheet&fromdate=${d1}&todate=${d2}`)
            .subscribe( report => {
                this.report = report;
            });
    }

    private get(route: string, params?: any ) {
        return this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send(params)
        .map(response => response.body);
    }

    private getStatistics(query: string) {
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint('?' + query).send()
        .map(response => response.body);

    }

}
