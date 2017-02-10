import {Component, Type, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChange} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {Observable} from 'rxjs/Observable';
import {UniForm, UniFieldLayout} from 'uniform-ng2/main';
import {Accrual, AccrualPeriod, Account, JournalEntryLineDraft, LocalDate, Period} from '../../../unientities';
import {ToastService, ToastType} from '../../../../framework/unitoast/toastservice';
import {AccountService, ErrorService, FinancialYearService, PeriodService} from '../../../services/services';
import {FieldType} from 'uniform-ng2/main';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

declare const _; // lodash

// Reusable address form
@Component({
    selector: 'accrual-form',

    template: `
        <article class="modal-content accrual-modal">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <section class="accrual-form">
                <uni-form
                    [config]="formConfig$"
                    [fields]="fields$"
                    [model]="model$"
                    (changeEvent)="onFormChange($event)">
                </uni-form>
            </section>
            <section class="accrual-periods">
                <table cols=4>
                    <tr>
                        <th></th>
                        <th>{{config.model['_periodYears'][0]}}</th>
                        <th>{{config.model['_periodYears'][1]}}</th>
                        <th>{{config.model['_periodYears'][2]}}</th>
                    </tr>
                    <tr *ngFor="let period of currentFinancialYearPeriods; let i = index">
                        <td>{{period.Name}}</td>
                        <td align="center"><input type="checkbox" tabindex="10"
                            (click)="setAccrualPeriodBasedOnTemplate(period.No,1)"
                            [(ngModel)]="allCheckboxValues[i].period1" [disabled]="checkboxEnabledState"/></td>
                        <td align="center"><input type="checkbox" tabindex="10"
                            (click)="setAccrualPeriodBasedOnTemplate(period.No,2)"
                            [(ngModel)]="allCheckboxValues[i].period2" [disabled]="checkboxEnabledState"/></td>
                        <td align="center"><input type="checkbox" tabindex="10"
                            (click)="setAccrualPeriodBasedOnTemplate(period.No,3)"
                            [(ngModel)]="allCheckboxValues[i].period3" [disabled]="checkboxEnabledState"/></td>
                    </tr>
                </table>

            </section>
            <footer>
                <button
                    *ngFor="let action of config.actions; let i=index"
                    (click)="action.method()"
                    [ngClass]="action.class"
                    type="button"
                    [disabled]="action.isDisabled()">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class AccrualForm implements OnChanges {
    @ViewChild(UniForm) public form: UniForm;
    public config: any = {};
    private model$: BehaviorSubject<any>= new BehaviorSubject(null);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private currentFinancialYear: number;
    private currentFinancialYearPeriods: Array<Period> = [];
    private checkboxEnabledState: Boolean = false;

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



    constructor(
        private accountService: AccountService,
        private errorService: ErrorService,
        private yearService: FinancialYearService,
        private periodService: PeriodService,
        private toastService: ToastService
    ) {
    }

    public onFormChange(event) {
        this.changeRecalculatePeriods();
    }

    public ngOnInit() {
        this.model$.next(this.config.model);
        this.yearService.getActiveFinancialYear().subscribe(res => {
            this.currentFinancialYear = res.Year;
            this.periodService.GetAll<Period>('filter=AccountYear eq ' + this.currentFinancialYear + ' and periodseries.seriestype eq 1', ['PeriodSeries']).subscribe(periods => {
                this.currentFinancialYearPeriods = periods;
                this.setupForm();
                if (this.config.model) {
                    this.checkboxEnabledState = this.isAccrualSaved();
                    this.setAccrualPeriodBasedOnAccrual();
                    this.changeRecalculatePeriods();
                }
            });
        });
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        this.model$.next(this.config.model);
        this.setupForm();
    }

    private setupForm() {
        this.fields$.next(this.getFields());
        this.config.modelJournalEntryModes = this.getAccrualJournalEntryModes();
        this.config.modelPeriodsTemplates = this.getAccrualPeriodsOptions();
        this.extendFormConfig();
    }

    private extendFormConfig() {
        let fields = this.fields$.getValue();
        let accountField: UniFieldLayout = fields.find(x => x.Property === 'BalanceAccountID');
        accountField.ReadOnly = this.isAccrualSaved();
        accountField.Options = {
            getDefaultData: () => this.getDefaultBalanceAccountData(),
            displayProperty: 'AccountNumber',
            valueProperty: 'ID',
            debounceTime: 200,
            search: (searchValue: string) => this.accountSearch(searchValue),
            events: {select: () => this.updateBalanceAccount()},
            template: (account: Account) => {
                return account && account.ID !== 0 ? `${account.AccountNumber} ${account.AccountName }` : '';
            }
        };

       let accrualJEMode: UniFieldLayout = fields.find(x => x.Property === 'AccrualJournalEntryMode');
       accrualJEMode.ReadOnly = this.isAccrualSaved();
       accrualJEMode.Options = {
           source: this.config.modelJournalEntryModes,
           valueProperty: 'ID',
           displayProperty: 'Name'
       };

       let accrualPeriodTemplate: UniFieldLayout = fields.find(x => x.Property === '_accrualPeriodsTemp');
       accrualPeriodTemplate.ReadOnly = this.isAccrualSaved();
       accrualPeriodTemplate.Options = {
           source: this.config.modelPeriodsTemplates,
           valueProperty: 'ID',
           displayProperty: 'Name',
           events: {select: () => this.reSelectCheckBoxesAccordingtoTemplate() }
       };
       this.model$.next(this.config.model);

       if (this.isAccrualSaved()) {
            this.toastService.addToast('Periodisering', ToastType.warn, 8, 'Denne periodiseringen er allerede lagret, og kan ikke redigere ytterligere');
       }
       this.fields$.next(fields);
    }

    private resetAllChechBoxValues(): void {
        this.allCheckboxValues = [{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false},{period1: false, period2: false, period3: false}];
    }


    private isAccrualSaved(): boolean {
        let isSaved = false;
        if(this.config.model.ID && this.config.model.ID > 0) {
            isSaved = true;
        }
        return isSaved;
    }


    private setAccrualPeriodBasedOnTemplate(periodNo: number, yearNumber: number): void {

        if (this.isAccrualSaved()) {
            return;
        }

        let template: number = this.config.model['_accrualPeriodsTemp'];
        let checkBoxValue = !this.allCheckboxValues[periodNo - 1]['period' + yearNumber];

        let overAllCounter: number = 0;
        if (template > 0) {
            this.resetAllChechBoxValues();
            let yearCounter: number = yearNumber;
            let counter: number = periodNo - 1;
            let maxYear: number = 3;
            let howManyCheckboxWasMarked = 0;

            while ( overAllCounter < template && yearCounter <= maxYear ) {
                this.allCheckboxValues[counter]['period' + yearCounter] = checkBoxValue;
                counter++;
                if ( counter === 12 ) {
                    counter = 0;
                    yearCounter ++;
                }
                overAllCounter++;
            }

            if (checkBoxValue === true && template > overAllCounter) {
                this.toastService.addToast('Periodisering', ToastType.warn, 5,
                    "Begresninger i hvor langt frem et bilag kan periodiseres i kombinasjon med valgte første periode gjorde at beløpet kun kunne fordeles på " + overAllCounter + " perioder.");
            }

        } else {
            this.allCheckboxValues[periodNo - 1]['period' + yearNumber] = checkBoxValue;
        }



        this.changeRecalculatePeriods();
    }

    private reSelectCheckBoxesAccordingtoTemplate(): void {

        if (this.isAccrualSaved()) {
            return;
        }

        if (this.config.model.Periods && this.config.model['_accrualPeriodsTemp'] > 0) {
            let periodNo = this.config.model.Periods[0].PeriodNo;
            let periodYear = this.config.model.Periods[0].AccountYear;
            let yearNumber = 1;
            if (this.config.model['_periodYears'][0] === periodYear) {
                yearNumber = 1;
            } else if (this.config.model['_periodYears'][1] === periodYear) {
                yearNumber = 2;
            } else {
                yearNumber = 3;
            }
            this.resetAllChechBoxValues();
            this.setAccrualPeriodBasedOnTemplate(periodNo, yearNumber);
        }
    }

    private setAccrualPeriodBasedOnAccrual(): void {
        this.resetAllChechBoxValues();
        let yearNumber: number = 1;
        if (this.config.model.Periods) {
            this.config.model.Periods.forEach(item => {

                if (item.AccountYear === this.config.model['_periodYears'][0]) {
                    yearNumber = 1;
                } else if (item.AccountYear === this.config.model['_periodYears'][1]) {
                    yearNumber = 2;
                } else {
                    yearNumber = 3;
                }
                this.allCheckboxValues[item.PeriodNo - 1]['period' + yearNumber] = true;
            });
        }
    }

    private getAccrualJournalEntryModes (): Array<AccrualJournalEntryMode> {
       return [{ID: 1, Name: 'Per år'}, {ID: 2, Name: 'Per måned'}];
    }

    private getAccrualPeriodsOptions (): any {
        return [
            {ID: 0, Name: 'Fleksibel'},
            {ID: 3, Name: 'Kvartal'},
            {ID: 6, Name: 'Halvår'},
            {ID: 12, Name: 'År'},
            {ID: 24, Name: '2 år'}
        ];
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

        if (this.config.model.Periods.length < 2 ||
            this.isAccrualPeriodsEqualOrLessThan24(this.config.model.Periods) === false) {
            messages.push('Periodisering må være minst 2 perioder, og maks 24 perioder frem fra første periode');
        }

        if (!this.config.model.BalanceAccountID) {
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
                ap.AccountYear = this.config.model['_periodYears'][yearCounter - 1];
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

        this.config.model.Periods = accrualPeriods;
        this.config.model['_numberOfPeriods'] = accrualPeriods.length;
        this.config.model['_periodAmount'] =
            (this.config.model.AccrualAmount / this.config.model.Periods.length).toFixed(2);
        this.config.model.Periods.forEach(item => {
            item.Amount = this.config.model['_periodAmount'];
        });

        let validationMsg: string [] = this.validateAccrual(false);
        if (validationMsg && validationMsg.length > 0) {
            this.config.model['_isValid'] = false;
            this.config.model['_validationMessage'] = validationMsg;
        } else {
            this.config.model['_isValid'] = true;
            this.config.model['_validationMessage'] = null;
        }

        this.model$.next(this.config.model);
    }

    private getDefaultBalanceAccountData() {
        if (this.config.model && this.config.model.BalanceAccount ) {
            return Observable.of([this.config.model.BalanceAccount]);
        } else {
            return Observable.of([]);
        }
    }

     private accountSearch(searchValue: string): Observable<any> {

        let filter = '';
        if (searchValue === '') {
            filter = `Visible eq 'true' and TopLevelAccountGroup.GroupNumber eq 1 and isnull(AccountID,0) eq 0`;
        } else {
            let copyPasteFilter = '';
            if (searchValue.indexOf(':') > 0) {
                let accountNumberPart = searchValue.split(':')[0].trim();
                let accountNamePart =  searchValue.split(':')[1].trim();
                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}'
                    and AccountName eq '${accountNamePart}')`;
            }
            filter = `Visible eq 'true' and (startswith(AccountNumber\,'${searchValue}')
                or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
        }
        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }


    private updateBalanceAccount() {
        if (this.config.model && this.config.model.BalanceAccountID) {
            this.accountService.Get(this.config.model.BalanceAccountID)
                .subscribe(account => {
                    if (account) {
                        this.config.model.BalanceAccount = account;
                        this.config.model = _.cloneDeep(this.config.model);
                    }
                },
                err => this.errorService.handle(err)
            );
        }
    }

    private getFields() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        return [
            {
                ComponentLayoutID: 1,
                EntityType: 'Accrual',
                Property: 'AccrualAmount',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                LookupField: false,
                Label: 'Periodiseringsbeløp',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Accrual',
                Property: 'BalanceAccountID',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Balansekonto',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null,
                Classes: ''
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Accrual',
                Property: 'AccrualJournalEntryMode',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Bilagsmodus',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null,
                Classes: ''
            },
             {
                ComponentLayoutID: 1,
                EntityType: 'Accrual',
                Property: '_accrualPeriodsTemp',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                LookupField: false,
                Label: 'Periodeoppsett',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null,
                Classes: ''
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Accrual',
                Property: '_numberOfPeriods',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                LookupField: false,
                Label: 'Antall Perioder',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            },
            {
                ComponentLayoutID: 1,
                EntityType: 'Accrual',
                Property: '_periodAmount',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                LookupField: false,
                Label: 'Periodebeløp',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: true,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 1,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null
            }
        ];
    }

}

// accrual modal
@Component({
    selector: 'accrual-modal',
    template: `<uni-modal [type]="type" [config]="modalConfig" [destroyOnClose]="'true'"></uni-modal>`
})

export class AccrualModal {
    @Input() public accrual: Accrual;
    @Input() public question: string;
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public Changed = new EventEmitter<Accrual>();
    @Output() public Canceled = new EventEmitter<boolean>();
    @Output() public Deleted = new EventEmitter<any>();

    private modalConfig: any = {};
    private type: Type<any> = AccrualForm;

    constructor(
        private periodService: PeriodService,
        private toastService: ToastService,
        private finacialYearService: FinancialYearService
    ) {
    }

    public ngOnInit() {
        this.modalConfig = {
            title: 'Periodisering',
            mode: null,
            question: this.question,
            disableQuestion: false,

            actions: [
                {
                    text: 'Ok',
                    class: 'good',
                    method: () => {
                        if (this.modalConfig.model['_validationMessage'] &&
                                this.modalConfig.model['_validationMessage'].length > 0) {
                            this.modalConfig.model['_validationMessage'].forEach(msg => {
                                this.toastService.addToast('Periodisering', ToastType.bad, 10, msg);
                            });
                        } else {
                            this.modalConfig.model.Periods.forEach(item => {
                                item.Amount = 0;
                            });
                            this.modal.close();
                            this.Changed.emit(this.modalConfig.model);
                            return false;
                        }
                    },
                    isDisabled: () =>  false
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.close();
                        this.Canceled.emit(true);
                        return false;
                    },
                    isDisabled: () => false
                },
                {
                    text: ' Fjern ' ,
                    class: 'bad',
                    method: () => {
                        this.Deleted.emit();
                        this.modal.close();
                    },
                    isDisabled: () => false
                }
            ]
        };
    }

    private getDefaultPeriods(accrualAmount: number, startYear: number, startPeriod: number): Array<AccrualPeriod>{

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

    public openModal(
            accrualAmount: number,
            accrualStartDate: LocalDate,
            journalEntryLineDraft: JournalEntryLineDraft,
            accrual: Accrual,
            title?: string) {

        if (title) {
            this.modalConfig.title = title;
        }

        if ((!journalEntryLineDraft && !accrual) && (!accrualStartDate || !accrualAmount)) {
            this.toastService.addToast('Periodisering', ToastType.bad, 10, 'Mangler informasjon om beløp og dato!');
            this.modal.close();
        }

        if (!accrual) {
            accrual = new Accrual();
            accrual.AccrualJournalEntryMode = 1;

            if (!journalEntryLineDraft) {
                accrual.AccrualAmount = accrualAmount;
                accrual['_isValid'] = false;
                accrual['_validationMessage'] = new Array<string>();
                accrual['_accrualPeriodsTemp'] = 3;
                if (accrualStartDate) {
                    accrual.Periods =
                        this.getDefaultPeriods(accrualAmount, accrualStartDate.year, accrualStartDate.month + 1);
                    accrual['_financialDate'] = accrualStartDate;
                    accrual['_periodYears'] =
                        [accrualStartDate.year, accrualStartDate.year + 1, accrualStartDate.year + 2];
                    accrual['_numberOfPeriods'] = accrual.Periods.length;
                    accrual['_periodAmount'] = accrual.Periods[0].Amount.toFixed(2);
                }
            } else {
                accrual.AccrualAmount = journalEntryLineDraft.Amount;
                let startYear: number = journalEntryLineDraft.FinancialDate.getFullYear();
                let startPeriod: number = journalEntryLineDraft.FinancialDate.getMonth();
                accrual['_isValid'] = false;
                accrual['_validationMessage'] =  new Array<string>();
                accrual['_accrualPeriodsTemp'] = 3;
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
                    accrual['_periodYears'] = [accrual.JournalEntryLineDraft.FinancialDate.getFullYear(),
                        accrual.JournalEntryLineDraft.FinancialDate.getFullYear() + 1,
                        accrual.JournalEntryLineDraft.FinancialDate.getFullYear() + 2];
                } else {
                    if (accrual.ID) {
                        this.toastService.addToast('Periodisering',
                            ToastType.bad, 10, 'Denne periodiseringen mangler en bilagslinjekladd!');
                    }
                }
            }
        }
        this.modalConfig.model = accrual;
        this.modal.open();
    }
}

 export class AccrualJournalEntryMode {
    public ID: number;
    public Name: string;
}
