import {Component, Input, Output, EventEmitter, SimpleChange, ViewChild} from '@angular/core';
import {UniForm} from '../../../../framework/ui/uniform/index';
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
import {BehaviorSubject} from 'rxjs';
import {
    UniSearchAccountConfig
} from '../../../services/common/uniSearchConfig/uniSearchAccountConfig';
import * as _ from 'lodash';
import { createGuid } from '@app/services/common/dimensionService';
import { of } from 'rxjs/observable/of';

@Component({
    selector: 'accrual-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 60vw">
            <header><h1>{{options?.data.title}}</h1></header>
            <article class="accrual-split-view">
                <section class="accrual-form">
                    <uni-form #form
                        [config]="formConfig$"
                        [fields]="fields$"
                        [model]="model$"
                        (changeEvent)="onFormChange($event)">
                    </uni-form>
                </section>
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

            </article>
            <footer>
                <button (click)="close('ok')" [disabled]="lockedDateSelected" class="good">Ok</button>
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

    @ViewChild('form') form: UniForm;

    public modalConfig: any = {
        mode: null,
        disableQuestion: false,
    };

    public model$: BehaviorSubject<any>= new BehaviorSubject(null);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private lockDate: any;
    public currentFinancialYear: number;
    public currentFinancialYearPeriods: Array<Period> = [];
    private checkboxEnabledState: Boolean = false;
    private numberOfPeriods: number;
    private lastClickedPeriodNo: number = 0;
    private lastClickedYear: number = 0;
    public lockedDateSelected: boolean = false;

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
        private financialYearService: FinancialYearService,
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

        const accrualPeriodAmount: number = accrualAmount / 3;
        let accrualPeriods: Array<AccrualPeriod> = [];

        const ap1: AccrualPeriod = new AccrualPeriod();
        ap1.Amount = accrualPeriodAmount;
        ap1.StatusCode = 33001;
        ap1.AccountYear = startYear;
        ap1.PeriodNo = startPeriod;

        const ap2: AccrualPeriod = new AccrualPeriod();
        ap2.Amount = accrualPeriodAmount;
        ap2.StatusCode = 33001;
        if (ap1.PeriodNo > 11) {
            ap2.AccountYear = ap1.AccountYear + 1;
            ap2.PeriodNo = 1;
        } else {
            ap2.AccountYear = ap1.AccountYear;
            ap2.PeriodNo = ap1.PeriodNo + 1;
        }

        const ap3: AccrualPeriod = new AccrualPeriod();
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
                if (this.numberOfPeriods < 1) {
                    this.numberOfPeriods = 1;
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
        this.lockDate = this.options.data.AccountingLockedDate;
        let accrual = this.options.data.accrual;
        const accrualAmount = this.options.data.accrualAmount;
        const accrualStartDate = this.options.data.accrualStartDate;
        const journalEntryLineDraft = this.options.data.journalEntryLineDraft;

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
                const startYear: number = journalEntryLineDraft.FinancialDate.year;

                const startPeriod: number = journalEntryLineDraft.FinancialDate.month;
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
                    const startYear: number = journalEntryLineDraft.FinancialDate.year;
                    accrual['_periodYears'] = [startYear, startYear + 1, startYear + 2];
                    accrual['_financialDate'] = journalEntryLineDraft.FinancialDate;
                    accrual['_numberOfPeriods'] = accrual.Periods.length;
                    accrual['_periodAmount'] = accrual.Periods[0].Amount.toFixed(2);
                } else if (accrualStartDate) {
                    const startYear: number = accrual.Periods[0].AccountYear;
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
        let key = document.querySelector('uni-bill') ? 'InvoiceBalanceAccountID' : 'BillBalanceAccountID';
        if (document.querySelector('journalentries')) {
            key = 'JournalEntriesBalanceAccount';
        }
        this.modalConfig.model.BalanceAccountID = this.browserStorageService.getItem(key);
        this.model$.next(this.modalConfig.model);
        this.currentFinancialYear = this.financialYearService.getActiveYear();

        this.periodService.GetAll<Period>(
            'filter=AccountYear eq '
            + this.currentFinancialYear
            + ' and periodseries.seriestype eq 1',
            ['PeriodSeries'])
            .subscribe(periods => {
                this.currentFinancialYearPeriods = periods;
                this.isLockedDate(periods);
                this.setupForm();

                if (this.modalConfig.model) {
                    this.checkboxEnabledState = this.isAccrualAccrued();
                    this.setAccrualPeriodBasedOnAccrual();
                    this.changeRecalculatePeriods();
                }
            });
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        this.model$.next(this.modalConfig.model);
        this.setupForm();
    }

    public isLockedDate(periodes: any = []) {
        if (!this.lockDate) {
            return;
        }
        periodes.forEach((period, index) => {
            this.allCheckBoxEnabledValues[index].period1 = new Date(this.lockDate) >= new Date(
                    this.modalConfig.model._periodYears[0],
                    new Date(period.FromDate).getMonth(),
                    new Date(period.FromDate).getDate()
                );
            this.allCheckBoxEnabledValues[index].period2 = new Date(this.lockDate) >= new Date(
                    this.modalConfig.model._periodYears[1],
                    new Date(period.FromDate).getMonth(),
                    new Date(period.FromDate).getDate()
                );
            this.allCheckBoxEnabledValues[index].period3 = new Date(this.lockDate) >= new Date(
                    this.modalConfig.model._periodYears[2],
                    new Date(period.FromDate).getMonth(),
                    new Date(period.FromDate).getDate()
                );
        });
    }

    private setupForm() {
        this.fields$.next(this.getFields());
        this.modalConfig.modelJournalEntryModes = this.getAccrualJournalEntryModes();
        this.extendFormConfig();
        setTimeout(() => {
            const section = this.form.section(1);
            if (section && !section.isOpen) {
                this.form.section(1).toggle();
            }
            const model = this.model$.getValue();
            const searchAccountConfig = this.uniSearchAccountConfig.generate17XXAccountsConfig();
            let promises = [];
            const uniBillElement = document.querySelector('uni-bill');
            const journalEntryElement = document.querySelector('journalentries');
            if (uniBillElement || journalEntryElement) {
                promises = [
                    searchAccountConfig.lookupFn('1749').toPromise(),
                    of(0).toPromise()
                ];
            } else {
                promises = [
                    searchAccountConfig.lookupFn('2900').toPromise(),
                    searchAccountConfig.lookupFn('3900').toPromise()
                ];
            }

            const defaultAccounts$ = Promise.all(promises);

            defaultAccounts$.then(([balanceAccount, resultAccount]) => {
                const hasResultBalanceAccount = balanceAccount && balanceAccount[0];
                const hasResultResultAccount = resultAccount && resultAccount[0];
                if (!model['BalanceAccountID']) {
                    model['BalanceAccountID'] = hasResultBalanceAccount ? balanceAccount[0].ID : null;
                }
                if (!model['ResultAccountID']) {
                    model['ResultAccountID'] = hasResultResultAccount ? resultAccount[0].ID : null;
                }
                const validationMsg: string [] = this.validateAccrual(false);
                if (validationMsg && validationMsg.length > 0) {
                    this.modalConfig.model['_isValid'] = false;
                    this.modalConfig.model['_validationMessage'] = validationMsg;
                } else {
                    this.modalConfig.model['_isValid'] = true;
                    this.modalConfig.model['_validationMessage'] = null;
                }
                this.model$.next(model);
            });
        }, 200);
    }

    private extendFormConfig() {
        if (this.isAccrualAccrued()) {
            this.toastService.addToast(
                'Periodisering',
                ToastType.warn,
                8,
                'Denne periodiseringen er allerede periodisert, og kan ikke redigere ytterligere'
            );
        }
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
        const enablingValues = [
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

        const tempDate = this.journalEntryService.getAccountingLockedDate();
        if (tempDate) {
            const lockedDate = new LocalDate(tempDate.toString());
            const lockedMonth = lockedDate.month;
            const lockedYear = lockedDate.year;
            const year = this.currentFinancialYear;

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

        const checkBoxValue = !this.allCheckboxValues[periodNo - 1]['period' + yearNumber];

        let overAllCounter: number = 0;
        if (this.numberOfPeriods > 0) {
            this.resetAllChechBoxValues();
            let yearCounter: number = yearNumber;
            let counter: number = periodNo - 1;
            const maxYear: number = 3;

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
        const checkBoxValue = !this.allCheckboxValues[periodNo - 1]['period' + yearNumber];
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
                // TODO: Logic to find new period if autoselect is locked
                this.allCheckboxValues[item.PeriodNo - 1]['period' + yearNumber] = true;
                if (this.allCheckBoxEnabledValues[item.PeriodNo - 1]['period' + yearNumber]) {
                    this.lockedDateSelected = true;
                    this.toastService.addToast('OBS: Låst regnskapsår', ToastType.bad, 10,
                        'Periodisering ikke mulig med gitt dato. Sjekk bilagslinjen eller Regnskapslås.');
                }
            });
        }
    }

    private getAccrualJournalEntryModes (): Array<AccrualJournalEntryMode> {
        return [{ID: 0, Name: 'Per år'}, {ID: 2, Name: 'Per måned'}];
    }


    private isAccrualPeriodsEqualOrLessThan24(periods: Array<AccrualPeriod>): boolean {

        const numberOfPeriods: number = periods.length;
        const firstPeriod: AccrualPeriod = periods[0];
        const lastPeriod: AccrualPeriod = periods[numberOfPeriods - 1];

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

        const messages: Array<string> = new Array<string>();

        if (this.modalConfig.model.Periods.length < 1 ||
            this.isAccrualPeriodsEqualOrLessThan24(this.modalConfig.model.Periods) === false) {
            messages.push('Periodisering må være minst 1 periode, og maks 24 perioder frem fra første periode');
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

        const accrualPeriods: Array<AccrualPeriod> = new Array<AccrualPeriod>();
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


        const newAccrualPeriods = accrualPeriods.filter(period => {
            return !this.modalConfig.model.Periods.find(x => {
                return period.AccountYear === x.AccountYear
                    && period.PeriodNo === x.PeriodNo;
            });
        });

        // remove those periods that are not selected
        this.modalConfig.model.Periods = this.modalConfig.model.Periods.filter(period => {
            return accrualPeriods.find(x => {
                return period.AccountYear === x.AccountYear
                    && period.PeriodNo === x.PeriodNo;
            });
        });
        newAccrualPeriods.forEach(period => period['_createguid'] = createGuid());
        this.modalConfig.model.Periods = this.modalConfig.model.Periods.concat(newAccrualPeriods);

        this.modalConfig.model['_numberOfPeriods'] = accrualPeriods.length;
        this.modalConfig.model['_periodAmount'] =
            (this.modalConfig.model.AccrualAmount / this.modalConfig.model.Periods.length).toFixed(2);
        this.modalConfig.model.Periods.forEach(item => {
            item.Amount = this.modalConfig.model['_periodAmount'];
        });

        const validationMsg: string [] = this.validateAccrual(false);
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
            },
            {
                EntityType: 'Accrual',
                Property: 'BalanceAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Balansekonto',
                LineBreak: true,
                Sectionheader: 'Periodiseringskonto',
                Section: 1,
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generate17XXAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'Accrual',
                Property: 'ResultAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Resultatkonto',
                LineBreak: true,
                Sectionheader: 'Periodiseringskonto',
                Section: 1,
                Hidden: !!document.querySelector('uni-bill') || !!document.querySelector('journalentries'),
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generate17XXAccountsConfig(),
                    valueProperty: 'ID'
                }
            }
        ];
    }
}

 export class AccrualJournalEntryMode {
    public ID: number;
    public Name: string; // tslint:disable-line
}
