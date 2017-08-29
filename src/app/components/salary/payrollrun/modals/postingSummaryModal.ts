import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions } from '../../../../../framework/uniModal/barrel';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '../../../../../framework/ui/unitable/index';
import { PostingSummary } from '../../../../unientities';
import {
    PayrollrunService,
    ErrorService,
    ReportDefinitionService,
    ReportParameter,
    ReportService
} from '../../../../../app/services/services';
import * as moment from 'moment';

@Component({
    selector: 'posting-summary-modal',
    templateUrl: './postingSummaryModal.html'
})

export class PostingSummaryModal implements OnInit, IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    public busy: boolean;
    private showReceipt: boolean = false;
    private accountTableConfig: UniTableConfig;
    private payrollrunID: number;
    private summary: any;
    private journalNumber: string;
    private journalDate: string;
    private headerString: string = 'Konteringssammendrag';
    constructor(
        private payrollService: PayrollrunService,
        private errorService: ErrorService,
        private reportService: ReportService,
        private reportDefinitionService: ReportDefinitionService
    ) { }

    public ngOnInit() {
        this.busy = true;
        this.payrollrunID = this.options.data.ID;
        this.createTableConfig();

        this.payrollService
            .getPostingsummary(this.payrollrunID)
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
            }, err =>  {
                this.errorService.handle(err);
            });
    }

    public postTransactions() {
        this.busy = true;
        this.reportDefinitionService
            .getReportByName('Konteringssammendrag')
            .switchMap(report => {
                let parameter = new ReportParameter();
                parameter.Name = 'RunID';
                parameter.value = this.payrollrunID.toString();
                report.parameters = [parameter];
                report.TemplateLinkId = 'PostingSummary.mrt';
                return this.reportService.generateReportPdfFile(report);
            })
            .switchMap(file => this.payrollService.postTransactions(this.payrollrunID, file))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .do((response) => {
                let config = this.options.modalConfig;
                if (response && config && config.update) {
                    config.update();
                }
            })
            .finally(() => this.busy = false)
            .subscribe((response) => this.showResponseReceipt(response));
    }

    public showResponseReceipt(successResponse: any) {
        if (successResponse) {
            this.showReceipt = true;
            this.journalNumber = successResponse[0].JournalEntryNumber;
            this.journalDate = moment(successResponse[0].FinancialDate).format('DD.MM.YYYY');
        }
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
        this.accountTableConfig = new UniTableConfig('salary.payrollrun.postingSummaryModalContent', false, false)
            .setColumns([accountCol, nameCol, sumCol, project, department])
            .setColumnMenuVisible(false)
            .setSearchable(false);
    }

    public close() {
        this.onClose.next(true);
    }
}