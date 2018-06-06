import {Component, OnInit, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../../framework/ui/unitable/index';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {PostingSummary, LocalDate, PayrollRun, NumberSeries} from '../../../../unientities';
import {PayrollrunService, ErrorService, ReportDefinitionService, NumberSeriesService} from '../../../../../app/services/services';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
interface IBookingModel {
    date: LocalDate;
    numberseriesID: string;
    hasGrouping: boolean;
}
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
    public sum$: BehaviorSubject<number> = new BehaviorSubject(0);
    public formModel$: BehaviorSubject<IBookingModel> = new BehaviorSubject(
        {
            date: new LocalDate(),
            numberseriesID: null,
            hasGrouping: true
        });
    private showReceipt: boolean = false;
    private accountTableConfig: UniTableConfig;
    private payrollrunID: number;
    public summary: any;
    private journalNumber: string;
    private journalDate: string;
    private headerString: string = 'Konteringssammendrag';
    private numberSeries: NumberSeries[] = [];

    constructor(
        private payrollService: PayrollrunService,
        private errorService: ErrorService,
        private numberseriesService: NumberSeriesService
    ) { }

    public ngOnInit() {
        const run: PayrollRun = this.options.data;
        this.payrollrunID = this.options.data.ID;
        this.getPostingSummary(this.payrollrunID);
        this.formModel$.next({date: new LocalDate(run.PayDate), numberseriesID: null, hasGrouping: true});
        this.createTableConfig();
        this.createFormConfig(run);
    }

    private createFormConfig(run: PayrollRun) {
        this.numberseriesService
            .getActiveNumberSeries('JournalEntry', new LocalDate(run.PayDate).year)
            .subscribe((response) => {
                const newFields: any[] = [
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
                    },
                    {
                        Property: 'hasGrouping',
                        FieldType: FieldType.CHECKBOX,
                        Label: 'Splitt på dimensjoner'
                    }
                ];

                this.fields$.next(newFields);
            });
    }

    private getPostingSummary(payrollRunID: number, hasGrouping: boolean = true) {
        this.busy = true;
        this.payrollService
            .getPostingsummary(payrollRunID, hasGrouping)
            .finally(() => this.busy = false)
            .map((postingSummary: PostingSummary) => {
                postingSummary.PostList
                    .filter(x => x.DimensionsID)
                    .map(post => {
                        const dimension = post.Dimensions;
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
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .do(response => this.updateSum(response))
            .subscribe((response: PostingSummary) => {
                this.summary = response;
                this.headerString = 'Konteringssammendrag: '
                    + response.PayrollRun.ID + ' - ' + response.PayrollRun.Description
                    + ', utbetales ' + moment(response.PayrollRun.PayDate.toString()).format('DD.MM.YYYY');
            });
    }

    public postTransactions() {
        this.busy = true;
        const model = this.formModel$.getValue();
        const date = model.date;
        const numberseriesID = model.numberseriesID;
        const hasGrouping = model.hasGrouping;

        this.payrollService
            .postTransactions(this.payrollrunID, date, numberseriesID, hasGrouping)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .do((response) => {
                const config = this.options.modalConfig;
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

    private updateSum(summary: PostingSummary) {
        if (!summary || !summary.PostList) {
            this.sum$.next(0);
            return;
        }
        this.sum$.next(summary.PostList.reduce((acc, curr) => acc + curr.Amount, 0));
    }

    private createTableConfig(hasGrouping: boolean = true) {
        const nameCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text);
        const accountCol = new UniTableColumn('Account.AccountNumber', 'Konto', UniTableColumnType.Text)
            .setWidth('5rem');
        const sumCol = new UniTableColumn('Amount', 'Sum', UniTableColumnType.Money);
        const department = new UniTableColumn('_Department', 'Avdeling', UniTableColumnType.Number)
            .setWidth('6rem');
        const project = new UniTableColumn('_Project', 'Prosjekt', UniTableColumnType.Number)
            .setWidth('6rem');
        let cols = [nameCol, accountCol, sumCol];
        if (hasGrouping) {
            cols = [...cols, department, project];
        }
        this.accountTableConfig = new UniTableConfig('salary.payrollrun.postingSummaryModalContent', false, false)
            .setColumns(cols)
            .setColumnMenuVisible(false)
            .setSearchable(false);
    }

    public change(event: SimpleChanges) {
        if (event['hasGrouping']) {
            this.getPostingSummary(this.payrollrunID, event['hasGrouping'].currentValue);
            this.createTableConfig(event['hasGrouping'].currentValue);
        }
    }

    public close() {
        this.onClose.next(true);
    }
}
