import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../../framework/ui/unitable/index';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {PostingSummary, LocalDate, PayrollRun, NumberSeries} from '../../../../unientities';
import {
    PayrollrunService, ErrorService, ReportDefinitionService, ReportParameter, ReportService,
    NumberSeriesService
} from '../../../../../app/services/services';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'posting-summary-modal',
    templateUrl: './postingSummaryModal.html'
})

export class PostingSummaryModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    public busy: boolean;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public formModel$: BehaviorSubject<{date: LocalDate, numberseriesID: string}> = new BehaviorSubject({date: new LocalDate(), numberseriesID: null});
    private showReceipt: boolean = false;
    private accountTableConfig: UniTableConfig;
    private payrollrunID: number;
    private summary: any;
    private journalNumber: string;
    private journalDate: string;
    private headerString: string = 'Konteringssammendrag';
    private numberSeries: NumberSeries[] = [];

    constructor(
        private payrollService: PayrollrunService,
        private errorService: ErrorService,
        private reportService: ReportService,
        private reportDefinitionService: ReportDefinitionService,
        private numberseriesService: NumberSeriesService
    ) { }

    public ngOnInit() {
        this.busy = true;
        const run: PayrollRun = this.options.data;
        this.payrollrunID = this.options.data.ID;
        this.formModel$.next({date: new LocalDate(run.PayDate), numberseriesID: null});
        this.createTableConfig();

        this.numberseriesService.getActiveNumberSeries('JournalEntry', new LocalDate(run.PayDate).year)
            .subscribe((response) => {
                let newFields: any[] = [
                    {
                        Property: 'date',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        Label: 'Bokføringsdato'
                    },
                    {
                        Property: 'numberseriesID',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Nummerserie',
                        Options: {
                            source: response,
                            valueProperty: 'ID',
                            template: (numberserie: NumberSeries) => numberserie
                                ? `${numberserie.DisplayName} - ${numberserie.AccountYear}`
                                : ''
                        }
                    }
                ];

                this.fields$.next(newFields);
            });

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
        const date = this.formModel$.getValue().date;
        const numberseriesID = this.formModel$.getValue().numberseriesID;

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
            .switchMap(file => this.payrollService.postTransactions(this.payrollrunID, date, file, numberseriesID))
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
