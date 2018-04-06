import {Component, Input, Output, EventEmitter, SimpleChange} from '@angular/core';
import {UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {Accrual, AccrualPeriod, LocalDate, Period} from '../../../unientities';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IUniModal, IModalOptions} from '../../../../framework/uni-modal';
import {
    AccountService,
    ErrorService,
    FinancialYearService,
    JournalEntryService,
    PeriodService,
    BrowserStorageService
} from '../../../services/services';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {
    UniSearchAccountConfig
} from '../../../services/common/uniSearchConfig/uniSearchAccountConfig';

declare const _;

@Component({
    selector: 'accrual-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 60vw">
            <header><h1>{{options?.data.title}}</h1></header>
            <article>
                <section class="accrual-periods"
                    *ngIf="modalConfig && modalConfig.model && modalConfig?.model['_periodYears'] && currentFinancialYearPeriods">
                    <table cols=4>
                        <tr>
                            <th></th>
                            <th>{{modalConfig?.model['_periodYears'][0]}}</th>
                            <th>{{modalConfig?.model['_periodYears'][1]}}</th>
                            <th>{{modalConfig?.model['_periodYears'][2]}}</th>
                        </tr>
                        <tr *ngFor="let period of currentFinancialYearPeriods; let i = index">
                            <td>{{period.Name}}</td>
                            <td align="center"><input type="checkbox" tabindex="10"
                                (click)="setSingleAccrualPeriod(period.No,1)"
                                [(ngModel)]="allCheckboxValues[i].period1"
                                [disabled]="allCheckBoxEnabledValues[i].period1"/>
                            </td>
                            <td align="center"><input type="checkbox" tabindex="10"
                                (click)="setSingleAccrualPeriod(period.No,2)"
                                [(ngModel)]="allCheckboxValues[i].period2"
                                [disabled]="allCheckBoxEnabledValues[i].period2"/>
                            </td>
                            <td align="center"><input type="checkbox" tabindex="10"
                                (click)="setSingleAccrualPeriod(period.No,3)"
                                [(ngModel)]="allCheckboxValues[i].period3"
                                [disabled]="allCheckBoxEnabledValues[i].period3"/>
                            </td>
                        </tr>
                    </table>
                </section>
                <section class="accrual-form">
                    <uni-form
                        [config]="formConfig$"
                        [fields]="fields$"
                        [model]="model$"
                        (changeEvent)="onFormChange($event)">
                    </uni-form>
                </section>
                <div style="clear: both;"></div>
            </article>
            <footer>
                <button (click)="close('ok')" class="good">Ok</button>
                <button (click)="close('cancel')">Avbryt</button>
                <button (click)="close('remove')" class="bad">Fjern</button>
            </footer>

        </section>
    `
})

export class AccrualModal implements IUniModal {

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    private modalConfig: any = {
        mode: null,
        disableQuestion: false,
    };

    public model$: BehaviorSubject<any>= new BehaviorSubject(null);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private currentFinancialYear: number;
    private currentFinancialYearPeriods: Array<Period> = [];
    private checkboxEnabledState: Boolean = false;
    private numberOfPeriods: number;
    private lastClickedPeriodNo: number = 0;
    private lastClickedYear: number = 0;

    private allCheckboxValues: any = [
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false}
    ];

    private allCheckBoxEnabledValues: any = [
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false},
        {period1: false, period2: false, period3: false}
    ];

    constructor(
        private periodService: PeriodService,
        private toastService: ToastService,
        private finacialYearService: FinancialYearService,
        private accountService: AccountService,
        private errorService: ErrorService,
        private yearService: FinancialYearService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private browserStorageService: BrowserStorageService,
        private journalEntryService: JournalEntryService
    ) { }

    public close(action: string) {
        if (action === 'ok') {
            if (this.modalConfig.model['_validationMessage']
            && this.modalConfig.model['_validationMessage'].length > 0) {
                this.modalConfig.model['_validationMessage'].forEach(msg => {
                this.toastService.addToast('Periodisering', ToastType.bad, 10, msg);
                });
            } else {
                this.modalConfig.model.Periods.forEach(item => {
                    item.Amount = 0;
                });
                this.onClose.emit({
                    action: action,
                    model: this.modalConfig.model
                });
            }
        } else if (action === 'remove') {
            this.onClose.emit({
                action: action
            });
        } else {
            this.onClose.emit(true);
        }
    }

    private getDefaultPeriods(accrualAmount: number, startYear: number, startPeriod: number): Array<AccrualPeriod> {

        let accrualPeriodAmount: number = accrualAmount / 3;
        let accrualPeriods: Array<AccrualPeriod> = [];

        let ap1: AccrualPeriod = new AccrualPeriod();
        ap1.Amount = accrualPeriodAmount;
        ap1.StatusCode = 33001;
        ap1.AccountYear = startYear;
        ap1.PeriodNo = startPeriod;

        let ap2: AccrualPeriod = new AccrualPeriod();
        ap2.Amount = accrualPeriodAmount;
        ap2.StatusCode = 33001;
        if (ap1.PeriodNo > 11) {
            ap2.AccountYear = ap1.AccountYear + 1;
            ap2.PeriodNo = 1;
        } else {
            ap2.AccountYear = ap1.AccountYear;
            ap2.PeriodNo = ap1.PeriodNo + 1;
        }

        let ap3: AccrualPeriod = new AccrualPeriod();
        ap3.Amount = accrualPeriodAmount;
        ap3.StatusCode = 33001;
        if (ap2.PeriodNo > 11) {
            ap3.AccountYear = ap2.AccountYear + 1;
            ap3.PeriodNo = 1;
        } else {
            ap3.AccountYear = ap2.AccountYear;
            ap3.PeriodNo = ap2.PeriodNo + 1;
        }

        accrualPeriods = [ ap1, ap2, ap3 ];
        return accrualPeriods;
    }

    public onFormChange(event) {

        if (event['_numberOfPeriods']) {

            // minimum periods must be 2, so always push back to 2 periods if not numeric of less than to is set
            this.numberOfPeriods = 2;

            if (Number(event['_numberOfPeriods'].currentValue) !== NaN) {
                this.numberOfPeriods = event['_numberOfPeriods'].currentValue;
                if (this.numberOfPeriods < 2) {
                    this.numberOfPeriods = 2;
                }
            }

            this.modalConfig.model['_numberOfPeriods'] = this.numberOfPeriods;
            this.reSelectCheckBoxes();
        } else {
            if (!this.numberOfPeriods) {
                this.numberOfPeriods = 3;
            }
            this.changeRecalculatePeriods();
        }
    }

    public ngOnInit() {
        let accrual = this.options.data.accrual;
        let accrualAmount = this.options.data.accrualAmount;
        let accrualStartDate = this.options.data.accrualStartDate;
        let journalEntryLineDraft = this.options.data.journalEntryLineDraft;

        if ((!journalEntryLineDraft && !accrual) && (!accrualStartDate || !accrualAmount)) {
            this.toastService.addToast('Periodisering', ToastType.bad, 10, 'Mangler informasjon om beløp og dato!');
            this.onClose.emit(false);
        }

        if (!accrual) {
            accrual = new Accrual();
            accrual.AccrualJournalEntryMode = 0;

            if (!journalEntryLineDraft) {
                accrual.AccrualAmount = accrualAmount;
                accrual['_isValid'] = false;
                accrual['_validationMessage'] = new Array<string>();

                // set this value to the id of the object in getAccrualPeriodsOptions
                // array to change default period value
                if (accrualStartDate) {
                    accrual['_financialDate'] = accrualStartDate;
                    accrual.Periods =
                        this.getDefaultPeriods(accrualAmount, accrualStartDate.year, accrualStartDate.month + 1);
                    accrual['_periodYears'] =
                        [accrualStartDate.year, accrualStartDate.year + 1, accrualStartDate.year + 2];
                    accrual['_numberOfPeriods'] = accrual.Periods.length;
                    accrual['_periodAmount'] = accrual.Periods[0].Amount.toFixed(2);
                }
            } else {
                accrual.AccrualAmount = journalEntryLineDraft.Amount;
                let startYear: number = journalEntryLineDraft.FinancialDate.year;

                let startPeriod: number = journalEntryLineDraft.FinancialDate.month;
                accrual['_isValid'] = false;
                accrual['_validationMessage'] =  new Array<string>();
                if (journalEntryLineDraft.FinancialDate) {
                    accrual.Periods = this.getDefaultPeriods(accrualAmount, startYear, startPeriod);
                    accrual['_periodYears'] = [startYear, startYear + 1, startYear + 2];
                    accrual['_financialDate'] = journalEntryLineDraft.FinancialDate;
                    accrual['_numberOfPeriods'] = accrual.Periods.length;
                    accrual['_periodAmount'] = accrual.Periods[0].Amount.toFixed(2);
                }
            }
        } else {
            accrual['_numberOfPeriods'] = accrual.Periods.length;

            // just incase amount is changed recalculate period amounts
            accrual['_periodAmount'] =  (accrual.AccrualAmount / accrual.Periods.length).toFixed(2);
            accrual.Periods.forEach(period => {
                period.Amount = accrual['_periodAmount'];
            });

            accrual['_isValid'] = false;
            accrual['_validationMessage'] =  new Array<string>();
            if (!accrual['financialDate'] || !accrual['_periodYears']) {
                if (accrual.JournalEntryLineDraft) {
                    accrual['_financialDate'] = accrual.JournalEntryLineDraft.FinancialDate;
                    accrual['_periodYears'] = [accrual.JournalEntryLineDraft.FinancialDate.year,
                        accrual.JournalEntryLineDraft.FinancialDate.month,
                        accrual.JournalEntryLineDraft.FinancialDate.year + 2];
                } else if (journalEntryLineDraft && journalEntryLineDraft.FinancialDate) {
                    let startYear: number = journalEntryLineDraft.FinancialDate.year;
                    accrual['_periodYears'] = [startYear, startYear + 1, startYear + 2];
                    accrual['_financialDate'] = journalEntryLineDraft.FinancialDate;
                    accrual['_numberOfPeriods'] = accrual.Periods.length;
                    accrual['_periodAmount'] = accrual.Periods[0].Amount.toFixed(2);
                } else if (accrualStartDate) {
                    let startYear: number = accrual.Periods[0].AccountYear;
                    accrual['_periodYears'] = [startYear, startYear + 1, startYear + 2];
                    accrual['_financialDate'] = accrualStartDate;
                    accrual['_numberOfPeriods'] = accrual.Periods.length;
                } else {
                    if (accrual.ID) {
                        this.toastService.addToast('Periodisering',
                            ToastType.bad, 10, 'Denne periodiseringen mangler en bilagslinjekladd!');
                    }
                }
            }
        }
        this.modalConfig.model = accrual;

        // changing BalanceAccountID on model to localStorage so that your newest selected
        // value becomes standard value on accrualModal initialization
        this.modalConfig.model.BalanceAccountID = this.browserStorageService.getItem('BalanceAccountID');
        this.model$.next(this.modalConfig.model);
        this.yearService.getActiveFinancialYear().subscribe(res => {
            this.currentFinancialYear = res.Year;
            this.periodService.GetAll<Period>(
                'filter=AccountYear eq '
                + this.currentFinancialYear
                + ' and periodseries.seriestype eq 1',
                ['PeriodSeries'])
                    .subscribe(periods => {
                        this.currentFinancialYearPeriods = periods;
                        this.setupForm();

                        if (this.modalConfig.model) {
                            this.checkboxEnabledState = this.isAccrualAccrued();
                            this.setAccrualPeriodBasedOnAccrual();
                            this.changeRecalculatePeriods();
                        }
                });
        });

    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        this.model$.next(this.modalConfig.model);
        this.setupForm();
    }

    private setupForm() {
        this.fields$.next(this.getFields());
        this.modalConfig.modelJournalEntryModes = this.getAccrualJournalEntryModes();
        this.extendFormConfig();
    }

    private extendFormConfig() {
        let fields = this.fields$.getValue();

        this.setAccountingLockedPeriods();

        let accrualJEMode: UniFieldLayout = fields.find(x => x.Property === 'AccrualJournalEntryMode');
        accrualJEMode.ReadOnly = this.isAccrualAccrued();
        accrualJEMode.Options = {
            source: this.modalConfig.modelJournalEntryModes,
            valueProperty: 'ID',
            displayProperty: 'Name'
        };

        this.model$.next(this.modalConfig.model);

        if (this.isAccrualAccrued()) {
            this.toastService.addToast(
                'Periodisering',
                ToastType.warn,
                8,
                'Denne periodiseringen er allerede periodisert, og kan ikke redigere ytterligere'
            );
        }
        this.fields$.next(fields);
    }

    private resetAllChechBoxValues(): void {
        this.allCheckboxValues = [
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false}
        ];
    }

    private setAccountingLockedPeriods(): void {
        let enablingValues = [
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false},
            {period1: false, period2: false, period3: false}
        ];

        let tempDate = this.journalEntryService.getAccountingLockedDate();
        if (tempDate) {
            let lockedDate = new LocalDate(tempDate.toString());
            let lockedMonth = lockedDate.month;
            let lockedYear = lockedDate.year;
            let year = this.currentFinancialYear;

            if (lockedYear === year) {

                for (let p: number = 0; p < lockedMonth; p++) {
                    enablingValues[p].period1 = true;
                }
            }
        }
        this.allCheckBoxEnabledValues = enablingValues;
    }

    private isAccrualAccrued(): boolean {
        let isAccrued = false;
        // should probably check status here, but that does not seem to be updated. However the
        // JournalEntryLineDraftID is set when accrual is run
        if (this.modalConfig.model.JournalEntryLineDraftID && this.modalConfig.model.JournalEntryLineDraftID > 0) {
            isAccrued = true;
        }
        return isAccrued;
    }

    private setAccrualPeriods(periodNo: number, yearNumber: number): void {

        if (this.isAccrualAccrued()) {
            return;
        }

        let checkBoxValue = !this.allCheckboxValues[periodNo - 1]['period' + yearNumber];

        let overAllCounter: number = 0;
        if (this.numberOfPeriods > 0) {
            this.resetAllChechBoxValues();
            let yearCounter: number = yearNumber;
            let counter: number = periodNo - 1;
            let maxYear: number = 3;

            while ( overAllCounter < this.numberOfPeriods && yearCounter <= maxYear ) {

                this.allCheckboxValues[counter]['period' + yearCounter] = checkBoxValue;
                counter++;

                if ( counter === 12 ) {
                    counter = 0;
                    yearCounter ++;
                }

                overAllCounter++;
            }

            if (checkBoxValue === true && this.numberOfPeriods > overAllCounter) {
                this.toastService.addToast(
                    'Periodisering',
                    ToastType.warn,
                    5,
                    'Begresninger i hvor langt frem et bilag kan periodiseres '
                    + 'i kombinasjon med valgte første periode gjorde at '
                    + 'beløpet kun kunne fordeles på '
                    + overAllCounter
                    + ' perioder.');
            }

        } else {
            this.allCheckboxValues[periodNo - 1]['period' + yearNumber] = checkBoxValue;
        }

        this.changeRecalculatePeriods();
    }

    public setSingleAccrualPeriod(periodNo: number, yearNumber: number) {

        this.lastClickedPeriodNo = periodNo;
        this.lastClickedYear = yearNumber;
        let checkBoxValue = !this.allCheckboxValues[periodNo - 1]['period' + yearNumber];
        this.allCheckboxValues[periodNo - 1]['period' + yearNumber] = checkBoxValue;
        this.changeRecalculatePeriods();

    }

    private reSelectCheckBoxes(): void {

        if (this.isAccrualAccrued()) {
            return;
        }

        if (this.modalConfig.model.Periods) {

            let periodNo = 1;
            let periodYear = 1;
            let yearNumber = 1;

            if (!this.modalConfig.model.Periods[0]) {
                periodNo =  this.lastClickedPeriodNo;
                periodYear = this.lastClickedYear;
                yearNumber = periodYear;
            } else {
                periodNo = this.modalConfig.model.Periods[0].PeriodNo;
                periodYear = this.modalConfig.model.Periods[0].AccountYear;


                if (this.modalConfig.model['_periodYears'][0] === periodYear) {
                    yearNumber = 1;
                } else if (this.modalConfig.model['_periodYears'][1] === periodYear) {
                    yearNumber = 2;
                } else {
                    yearNumber = 3;
                }
            }
            this.resetAllChechBoxValues();
            this.setAccrualPeriods(periodNo, yearNumber);
        }
    }

    private setAccrualPeriodBasedOnAccrual(): void {
        this.resetAllChechBoxValues();
        let yearNumber: number = 1;
        if (this.modalConfig.model.Periods) {
            this.modalConfig.model.Periods.forEach(item => {

                if (item.AccountYear === this.modalConfig.model['_periodYears'][0]) {
                    yearNumber = 1;
                } else if (item.AccountYear === this.modalConfig.model['_periodYears'][1]) {
                    yearNumber = 2;
                } else {
                    yearNumber = 3;
                }
                this.allCheckboxValues[item.PeriodNo - 1]['period' + yearNumber] = true;
            });
        }
    }

    private getAccrualJournalEntryModes (): Array<AccrualJournalEntryMode> {
    return [{ID: 0, Name: 'Per år'}, {ID: 2, Name: 'Per måned'}];
    }


    private isAccrualPeriodsEqualOrLessThan24(periods: Array<AccrualPeriod>): boolean {

        let numberOfPeriods: number = periods.length;
        let firstPeriod: AccrualPeriod = periods[0];
        let lastPeriod: AccrualPeriod = periods[numberOfPeriods - 1];

        if (!periods || (periods.length < 2)) {
            return true;
        }

        if ((lastPeriod.AccountYear -  firstPeriod.AccountYear) < 2) {
            return true;
        }

        if (lastPeriod.PeriodNo < firstPeriod.PeriodNo) {
            return true;
        }

        return false;

    }

    public validateAccrual(showToaster: boolean): Array<string> {

        let messages: Array<string> = new Array<string>();

        if (this.modalConfig.model.Periods.length < 2 ||
            this.isAccrualPeriodsEqualOrLessThan24(this.modalConfig.model.Periods) === false) {
            messages.push('Periodisering må være minst 2 perioder, og maks 24 perioder frem fra første periode');
        }

        if (!this.modalConfig.model.BalanceAccountID) {
            messages.push('Periodiseringen mangler balansekonto');
        }

        if (showToaster && messages.length > 0) {
            messages.forEach(msg => {
                this.toastService.addToast('Periodisering', ToastType.bad, 10, msg);
            });
        }
        return messages;

    }

    private changeRecalculatePeriods(): void {

        let accrualPeriods: Array<AccrualPeriod> = new Array<AccrualPeriod>();
        let yearCounter: number = 1;
        let periodCounter: number = 0;
        while (yearCounter < 4) {

            if (this.allCheckboxValues[periodCounter]['period' + yearCounter] === true) {
                const ap: AccrualPeriod = new AccrualPeriod();
                ap.AccountYear = this.modalConfig.model['_periodYears'][yearCounter - 1];
                ap.PeriodNo = periodCounter + 1;
                ap.StatusCode = 33001;
                accrualPeriods.push(ap);
            }

            periodCounter++;
            if (periodCounter === 12) {
                periodCounter = 0;
                yearCounter++;
            }
        }



        this.modalConfig.model.Periods = accrualPeriods;

        this.modalConfig.model['_numberOfPeriods'] = accrualPeriods.length;
        this.modalConfig.model['_periodAmount'] =
            (this.modalConfig.model.AccrualAmount / this.modalConfig.model.Periods.length).toFixed(2);
        this.modalConfig.model.Periods.forEach(item => {
            item.Amount = this.modalConfig.model['_periodAmount'];
        });

        let validationMsg: string [] = this.validateAccrual(false);
        if (validationMsg && validationMsg.length > 0) {
            this.modalConfig.model['_isValid'] = false;
            this.modalConfig.model['_validationMessage'] = validationMsg;
        } else {
            this.modalConfig.model['_isValid'] = true;
            this.modalConfig.model['_validationMessage'] = null;
        }

        this.model$.next(this.modalConfig.model);
    }

    private getFields() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        return [
            {
                EntityType: 'Accrual',
                Property: 'AccrualAmount',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Periodiseringsbeløp',
                FieldSet: 0,
                Section: 0,
                LineBreak: true,
            },
            {
                EntityType: 'Accrual',
                Property: 'BalanceAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Balansekonto',
                LineBreak: true,
                Sectionheader: 'Selskapsoppsett',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generate17XXAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'Accrual',
                Property: 'AccrualJournalEntryMode',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Bilagsmodus',
                FieldSet: 0,
                Section: 0,
                LineBreak: true,
                Classes: ''
            },
            {
                EntityType: 'Accrual',
                Property: '_numberOfPeriods',
                FieldType: FieldType.TEXT,
                Label: 'Antall Perioder',
                FieldSet: 0,
                Section: 0,
                LineBreak: true,
            },
            {
                EntityType: 'Accrual',
                Property: '_periodAmount',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Periodebeløp',
                FieldSet: 0,
                Section: 0,
                LineBreak: true,
            }
        ];
    }

}

 export class AccrualJournalEntryMode {
    public ID: number;
    public Name: string; // tslint:disable-line
}
