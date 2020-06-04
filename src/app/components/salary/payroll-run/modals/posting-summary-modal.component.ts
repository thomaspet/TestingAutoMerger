import {Component, OnInit, Input, Output, EventEmitter, SimpleChanges, SimpleChange, OnDestroy} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../../framework/ui/unitable/index';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {
    PostingSummary, LocalDate, PayrollRun, NumberSeries,
    JournalEntryLine, JournalEntryLineDraft, CompanySalary, SummaryJobStatus, PostingSummaryDraft,
} from '../../../../unientities';
import {
    PayrollrunService,
    ErrorService,
    NumberSeriesService,
    BrowserStorageService,
    JournalEntryService,
    SalaryBookingType,
} from '../../../../services/services';
import * as moment from 'moment';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Router} from '@angular/router';
import {switchMap, map, repeatWhen, skipWhile, take, tap, catchError, takeUntil, finalize, filter} from 'rxjs/operators';
const NUMBER_SERIES_KEY = 'numberSeriesID_salaryBooking';
interface IBookingModel {
    date: LocalDate;
    numberseriesID: number;
    bookingType: SalaryBookingType;
}
@Component({
    selector: 'posting-summary-modal',
    templateUrl: './posting-summary-modal.component.html'
})

export class PostingSummaryModalComponent implements OnInit, IUniModal, OnDestroy {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    public busy: boolean;
    public jobBusy: boolean;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public sum$: BehaviorSubject<number> = new BehaviorSubject(0);
    public formModel$: BehaviorSubject<IBookingModel> = new BehaviorSubject(
        {
            date: new LocalDate(),
            numberseriesID: null,
            bookingType: null,
        });
    private destroy$: Subject<void> = new Subject();
    public showReceipt: boolean = false;
    public accountTableConfig: UniTableConfig;
    private payrollrunID: number;
    public summary: PostingSummary;
    public draft: PostingSummaryDraft;
    private journalNumber: string;
    private journalDate: string;
    public headerString: string = 'Konteringssammendrag';
    private numberSeries: NumberSeries[] = [];
    public valid: boolean;
    private companySalary: CompanySalary;
    private draftType: SalaryBookingType;
    private state: SummaryJobStatus;

    constructor(
        private payrollService: PayrollrunService,
        private errorService: ErrorService,
        private numberseriesService: NumberSeriesService,
        private browserStorageService: BrowserStorageService,
        private journalEntryService: JournalEntryService,
        private router: Router,
    ) {}

    public ngOnInit() {
        const run: PayrollRun = this.options.data;
        this.payrollrunID = this.options.data.ID;
        this.getPostingSummary(this.payrollrunID).subscribe((response: PostingSummary) => this.setPostingSummary(response));
        this.setDefaults(run);
        this.createTableConfig();
        this.createFormConfig(run);
    }

    public ngOnDestroy() {
        this.destroy$.next();
    }

    private setDefaults(run: PayrollRun) {
        const numberSeriesID = this.browserStorageService.getItemFromCompany(NUMBER_SERIES_KEY);
        this.formModel$.next({
            date: new LocalDate(run.PayDate),
            numberseriesID: numberSeriesID,
            bookingType: null,
        });
        if (numberSeriesID) {
            return;
        }
        this.setDefaultNumberSeries();
    }

    private getDefaultNumberSeries(): Observable<number> {
        return this.payrollService
            .getAll(`filter=StatusCode eq 5&orderby=PayDate desc&top=1`)
            .filter(run => run && !!run.length)
            .map(run => run[0])
            .switchMap(run => this.journalEntryService.GetAll(`filter=JournalEntryNumber eq '${run.JournalEntryNumber}'&top=1`))
            .map(je => je[0] && je[0].NumberSeriesID);
    }

    private setDefaultNumberSeries() {
        this.getDefaultNumberSeries()
            .pipe(
                switchMap(numberSeriesID => this.formModel$
                    .take(1)
                    .map(model => {
                        model.numberseriesID = numberSeriesID || model.numberseriesID;
                        return model;
                    }))
            )
            .subscribe(model => this.formModel$.next(model));
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
                        Property: 'bookingType',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Type bilag',
                        Options: {
                            source: [
                                {ID: SalaryBookingType.Dimensions, name: 'Bilag med dimensjoner kun på resultatkontoer'},
                                {ID: SalaryBookingType.DimensionsAndBalance, name: 'Bilag med dimensjoner på resultat- og balansekontoer'},
                                {ID: SalaryBookingType.NoDimensions, name: 'Bilag uten dimensjoner'}
                            ],
                            valueProperty: 'ID',
                            template: (el: any) => el.name,
                        }
                    }
                ];

                this.fields$.next(newFields);
            });
    }

    public rebuildPostings() {
        this.jobBusy = true;
        this.formModel$
            .pipe(
                take(1),
                switchMap(model => this.payrollService.generateDraft(this.payrollrunID, model.bookingType)),
                switchMap(() => this.getPostingSummary(this.payrollrunID)),
            )
            .subscribe(
                (response: PostingSummary) => this.setPostingSummary(response),
                (err) => {
                    this.errorService.handle(err);
                    this.busy = false;
                    this.jobBusy = false;
                }
            );
    }

    private setPostingSummary(postingSummary: PostingSummary) {
        this.summary = postingSummary;
        this.headerString = 'Konteringssammendrag: '
            + postingSummary.PayrollRun.ID + ' - ' + postingSummary.PayrollRun.Description
            + ', utbetales ' + moment(postingSummary.PayrollRun.PayDate.toString()).format('DD.MM.YYYY');
    }

    private getPostingSummary(payrollRunID: number): Observable<any> {

        this.busy = true;
        this.jobBusy = true;
        this.payrollService.invalidateCache();
        return this.payrollService
            .getPostingSummaryDraft(payrollRunID)
            .pipe(
                repeatWhen(draft => draft.debounceTime(2000)),
                tap(draft => this.state = draft.status),
                takeUntil(this.destroy$),
                skipWhile(draft => draft && draft.status === SummaryJobStatus.running),
                tap(draft => this.draft = draft),
                finalize(() => {
                    this.busy = false;
                    this.jobBusy = false;
                }),
                take(1),
                tap(draft => this.setDefaultBookingType(draft)),
                map(draft => this.getDraft(draft)),
                map(draft => JSON.parse(draft)),
                tap(postingSummary => this.valid = !postingSummary || !postingSummary.PostList.some(line => !line.Account)),
                tap(response => this.updateSum(response)),
                filter(postingSummary => !!postingSummary),
                map((postingSummary: PostingSummary) => {
                    postingSummary.PostList = postingSummary
                        .PostList
                        .sort((a, b) => this.GetNumberFromBool(!!a.Account) - this.GetNumberFromBool(!!b.Account));

                    return postingSummary;
                }),
                map((postingSummary: PostingSummary) => {
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
                }));
    }

    private setDefaultBookingType(draft: PostingSummaryDraft) {
        const type = this.getDefaultBookingType(draft);
        this.draftType = type;
        this.formModel$
            .pipe(
                take(1),
                map(model => {
                    model.bookingType = type;
                    return model;
                })
            )
            .subscribe(model => this.formModel$.next(model));
    }

    private getDefaultBookingType(draft: PostingSummaryDraft): SalaryBookingType {
        if (draft.draftBasic) {
            return SalaryBookingType.NoDimensions;
        }
        if (draft.draftWithDimsOnBalance) {
            return SalaryBookingType.DimensionsAndBalance;
        }
        return SalaryBookingType.Dimensions;
    }

    private getDraft(draft: PostingSummaryDraft) {
        return draft && (draft.draftBasic || draft.draftWithDims || draft.draftWithDimsOnBalance);
    }

    private GetNumberFromBool(bool: boolean): number {
        return bool ? 1 : 0;
    }

    private cacheNumberSeriesID(model: IBookingModel) {
        if (!model || !model.numberseriesID) {
            return;
        }
        this.browserStorageService.setItemOnCompany(NUMBER_SERIES_KEY, model.numberseriesID);
    }

    public postTransactions() {
        this.busy = true;
        const model = this.formModel$.getValue();
        const date = model.date;
        const numberseriesID = model.numberseriesID;
        const bookingType = model.bookingType;
        this.cacheNumberSeriesID(model);

        this.payrollService
            .postTransactions(this.payrollrunID, date, numberseriesID)
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

    private createTableConfig(bookingType: SalaryBookingType = SalaryBookingType.Dimensions) {
        const nameCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text);
        const accountCol = new UniTableColumn('Account.AccountNumber', 'Konto', UniTableColumnType.Text)
            .setWidth('5rem');
        const sumCol = new UniTableColumn('Amount', 'Sum', UniTableColumnType.Money);
        const department = new UniTableColumn('_Department', 'Avdeling', UniTableColumnType.Number)
            .setWidth('6rem');
        const project = new UniTableColumn('_Project', 'Prosjekt', UniTableColumnType.Number)
            .setWidth('6rem');
        const vat = new UniTableColumn('VatType', 'Mva', UniTableColumnType.Text)
            .setTemplate((rowModel: JournalEntryLine) => {
                if (!rowModel.VatType) {
                    return '';
                }
                const vatType = rowModel.VatType;
                return `${vatType.VatCode}:${vatType.VatPercent}%`;
            });
        let cols = [nameCol, accountCol, vat, sumCol];
        if (bookingType !== SalaryBookingType.NoDimensions) {
            cols = [...cols, department, project];
        }
        this.accountTableConfig = new UniTableConfig('salary.payrollrun.postingSummaryModalContent', false, false)
            .setColumns(cols)
            .setColumnMenuVisible(false)
            .setSearchable(false)
            .setConditionalRowCls((row: JournalEntryLineDraft) => !row.Account ? 'bad' : '');
    }

    public change(event: SimpleChanges) {
        if (event['bookingType']) {
            this.handleBookingTypeChange(event['bookingType']);
        }
    }

    private handleBookingTypeChange(change: SimpleChange) {
        this.busy = change.currentValue !== this.draftType;
        if (change.previousValue === SalaryBookingType.NoDimensions || change.currentValue === SalaryBookingType.NoDimensions) {
            this.createTableConfig(change.currentValue);
        }
    }

    public routeToSalarySettings() {
        this.busy = true;
        this.router
            .navigate(['settings/aga-and-subentities'])
            .then(() => this.close());
    }

    public close(link: boolean = false) {
        if (link) {
            const numberAndYear = this.journalNumber.split('-');
            let url = `/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=`;
            if (numberAndYear.length > 1) {
                url += numberAndYear[1];
            } else {
                const year = this.journalDate ? moment(this.journalDate).year() : moment().year();
                url += year;
            }
            this.router.navigateByUrl(url);
        }
        this.onClose.next(true);
    }
}
