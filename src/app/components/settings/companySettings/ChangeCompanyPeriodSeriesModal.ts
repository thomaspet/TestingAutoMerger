import {
    Component, OnInit, Input, Output, EventEmitter
} from '@angular/core';
import {Observable} from 'rxjs';
import {PeriodSeries, CompanySettings} from '../../../unientities';
import {ISelectConfig} from '../../../../framework/ui/uniform/index';
import {CompanySettingsService, ErrorService} from '../../../services/services';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {PeriodSeriesService, FinancialYearService} from '../../../services/services';

declare const _; // lodash

// newAccount modal
@Component({
    selector: 'new-companysettings-periodseries-modal',
    template: `

    <section role="dialog" class="uni-modal">

        <header><h1>Endre periodeoppsett</h1></header>
        <article class="change-companysettings-periodseries-form">

            <span>
                Endringer i periodeoppsett kan ha omfattende konsekvenser i regnskapet.
                Alle bilag som faller inn under endringene vil bli
                endret til å peke mot de nye periodene som opprettes.
                <BR/><BR/>
                Det er ikke mulig å endre på periodeoppsett for mva dersom det er
                opprettet mva meldinger innenfor regnskapsåret som velges.
                Disse må da fjernes før endringer i periodeoppsettet kan gjøres.
                <BR/><BR/>
                Det gjøres endringer fra og med aktive regnskapsåret.
            </span><BR/><BR/>

            <div hidden>
            <span>Regnskapsperioder</span>

                <uni-select [config]="periodSeriesConfig"
                    [items]="periodSeriesAccountList"
                    (valueChange)="periodSeriesChanged($event)"
                    [value]="periodSeriesAccount">
                </uni-select>
            </div><BR/>

            <span>Mva Perioder</span>
            <div>
                <uni-select [config]="periodSeriesConfig"
                    [items]="periodSeriesVatList"
                    (valueChange)="periodSeriesChanged($event)"
                    [value]="periodSeriesVat">
                </uni-select>
            </div>
        </article>

        <footer>
            <button
                [disabled]="!isPeriodSeriesChanged || isSaving"
                [attr.aria-busy]="isSaving"
                (click)="close('save')"
                class="good">Utfør</button>
            <button
                [disabled]="isSaving"
                (click)="close('cancel')"
                class="bad">Avbryt</button>
        </footer>

    </section>
    `
})

export class ChangeCompanySettingsPeriodSeriesModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

    public periodSeriesConfig: ISelectConfig;
    public currentAccountYear: number;
    public periodSeriesAccount: PeriodSeries;
    public periodSeriesVat: PeriodSeries;
    public isPeriodSeriesChanged: boolean;
    public companySettings: CompanySettings;
    public periodSeriesAccountList: Array<PeriodSeries>;
    public periodSeriesVatList: Array<PeriodSeries>;

    private isSaving: boolean = false;

    constructor(
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private periodSeriesService: PeriodSeriesService,
        private financialYearService: FinancialYearService
    ) { }

    public ngOnInit() {
        this.isPeriodSeriesChanged = false;
        this.getData();
        this.periodSeriesConfig = {
            displayProperty: 'Name',
            placeholder: 'Velg måleenhet',
            searchable: false
        };
    }

    private getData() {
        this.financialYearService.lastSelectedFinancialYear$.subscribe(
            res => this.currentAccountYear = res.Year || this.currentAccountYear,
            err => this.errorService.handle(err)
        );

        this.companySettingsService.invalidateCache();
        Observable.forkJoin(
            this.companySettingsService.Get(1),
            this.periodSeriesService.GetAll(null),
        ).subscribe(
            (dataset) => {
                this.companySettings = dataset[0];
                this.periodSeriesAccountList = dataset[1].filter(x => x.SeriesType === '1');
                this.periodSeriesVatList = dataset[1].filter(x => x.SeriesType === '0');
                this.periodSeriesAccount = dataset[1].filter(
                    x => x.ID ===  this.companySettings.PeriodSeriesAccountID
                )[0];
                this.periodSeriesVat = dataset[1].filter(x => x.ID === this.companySettings.PeriodSeriesVatID)[0];
            },
            err => this.errorService.handle(err)
        );
    }

    public close(action: any) {
        if (action === 'cancel') {
            this.cancelAndClose();
        }
        if (action === 'save') {
            this.changeCompanySettingsPeriodSeriesAndClose();
        }
    }

    public periodSeriesChanged(changed) {
        if (changed.SeriesType === '0') {
            this.periodSeriesVat = changed;
        }
        if (changed.SeriesType === '1') {
            this.periodSeriesAccount = changed;
        }
        this.isPeriodSeriesChanged = this.isPeriodSeriesChangedFromCurrentSettings();
    }

    private isPeriodSeriesChangedFromCurrentSettings() {
        return this.periodSeriesAccount.ID !== this.companySettings.PeriodSeriesAccountID ||
            this.periodSeriesVat.ID !== this.companySettings.PeriodSeriesVatID;
    }

    private cancelAndClose() {
        this.onClose.emit(false);
    }

    private changeCompanySettingsPeriodSeriesAndClose() {
        this.isSaving = true;
        this.companySettingsService
            .changeCompanySettingsPeriodSeriesSettings(this.periodSeriesVat.ID, this.currentAccountYear)
                .subscribe(res => {
                    this.isSaving = false;
                    this.onClose.emit(false);
                }, err => {
                    this.isSaving = false;
                    this.errorService.handle(err);
                }
            );
    }

}

