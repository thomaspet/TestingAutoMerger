import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UniTable, UniTableColumn, UniTableColumnType, UniTableConfig } from 'unitable-ng2/main';
import { PostingSummary, Dimensions } from '../../../unientities';
import { PayrollrunService, ErrorService, ReportDefinitionService, Report, ReportParameter } from '../../../../app/services/services';
import { UniHttp } from '../../../../framework/core/http/http';

import { Observable } from 'rxjs/Observable';

declare var moment;

@Component({
    selector: 'postingsummary-modal-content',
    templateUrl: 'app/components/salary/payrollrun/postingsummaryModalContent.html'
})
export class PostingsummaryModalContent implements OnInit {
    public busy: boolean;
    private showReceipt: boolean = false;
    private accountTableConfig: UniTableConfig;
    @Input() private config: any;
    private payrollrunID: number;
    private summary: any;
    private journalNumber: string;
    private journalDate: Date;
    private headerString: string = 'Konteringssammendrag';

    constructor(
        private payrollService: PayrollrunService,
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private http: UniHttp,
        private reportService: ReportDefinitionService
    ) {
        this.route.params.subscribe(params => {
            this.payrollrunID = +params['id'];
        });
    }

    public ngOnInit() {
        this.busy = true;
        this.createTableConfig();

        this.payrollService.getPostingsummary(this.payrollrunID)
            .finally(() => this.busy = false)
            .map((postingSummary: PostingSummary) => {
                postingSummary.PostList
                    .filter(x => x.DimensionsID)
                    .map(post => {
                        let dimension = post.Dimensions;
                        if (dimension) {
                            post['_Department'] = dimension.Department
                                ? dimension.Department.DepartmentNumber
                                : undefined;

                            post['_Project'] = dimension.Project
                                ? dimension.Project.ProjectNumber
                                : undefined;
                        }
                    });

                return postingSummary;
            })
            .subscribe((response: PostingSummary) => {
                this.summary = response;
                this.headerString = 'Konteringssammendrag: '
                    + this.summary.PayrollRun.ID + ' - ' + this.summary.PayrollRun.Description
                    + ', utbetales ' + moment(this.summary.PayrollRun.PayDate.toString()).format('DD.MM.YYYY');
            }, err => this.errorService.handle(err));
    }

    public postTransactions() {
        
        return this.reportService
            .getReportByName('Konteringssammendrag')
            .switchMap(report => {
                let parameter = new ReportParameter();
                parameter.Name = 'RunID';
                parameter.value = this.payrollrunID.toString();
                report.parameters = [parameter];
                report.TemplateLinkId = 'PostingSummary.mrt';
                return this.reportService.generateReportPdfFile(report);
            })
            .switchMap(file => this.payrollService.postTransactions(this.payrollrunID, file));
    }

    public showResponseReceipt(successResponse: any) {
        this.showReceipt = true;
        this.journalNumber = successResponse[0].JournalEntryNumber;
        this.journalDate = moment(successResponse[0].FinancialDate).format('DD.MM.YYYY');
    }

    public getAccountingSum(): number {
        var ret: number = 0;
        if (this.summary) {
            this.summary.PostList.forEach((val) => {
                ret += val.Amount;
            });
        }
        return ret;
    }

    private createTableConfig() {
        let nameCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text);
        let accountCol = new UniTableColumn('Account.AccountNumber', 'Konto', UniTableColumnType.Text)
            .setWidth('5rem');
        let sumCol = new UniTableColumn('Amount', 'Sum', UniTableColumnType.Money);
        let department = new UniTableColumn('_Department', 'Avdeling', UniTableColumnType.Number)
            .setWidth('6rem');
        let project = new UniTableColumn('_Project', 'Prosjekt', UniTableColumnType.Number)
            .setWidth('6rem');
        this.accountTableConfig = new UniTableConfig(false, false)
            .setColumns([accountCol, nameCol, sumCol, department, project])
            .setColumnMenuVisible(false)
            .setSearchable(false);
    }

    public log(err) {
        if (err._body) {
            alert(err._body);
        } else {
            alert(JSON.stringify(err));
        }
    }

}
