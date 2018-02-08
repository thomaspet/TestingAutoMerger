import {
    Component, OnInit, Input, Output, EventEmitter
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {PeriodSeries, CompanySettings} from '../../../unientities';
import {ISelectConfig} from '../../../../framework/ui/uniform/index';
import {CompanySettingsService, ErrorService} from '../../../services/services';
import {IUniModal, IModalOptions} from '@uni-framework/uniModal/interfaces';
import {PeriodSeriesService, FinancialYearService} from '../../../services/services';

declare const _; // lodash

// newAccount modal
@Component({
    selector: 'new-companysettings-periodseries-modal',
    template: `

    <section role="dialog" class="uni-modal">

        <header>Endre periodeoppsett:</header>
        <article class="change-companysettings-periodseries-form">

            <span>
                Endringer i periodeoppsett kan ha omfattende konsekvenser i regnskapet.
                Alle bilag som faller inn under endringene vil bli
                endret til å peke mot de nye periodene som opprettes.
                <BR/><BR/>
                Det er ikke mulig å endre på periode oppsett for mva dersom det er
                opprettet mva meldinger innenfor regnskapsåret som velges.
                Disse må da fjernes før endringer i periodeoppsettet kan gjøres.
                <BR/><BR/>
                Det gjøres endringer fra og med aktive regnskapsåret.
            </span><BR/><BR/>

            <div hidden>
            <span>Regnskapsperioder</span>

                <uni-select [config]="periodSeriesConfig"
                    [items]="periodSeriesAccountList"
                    (valueChange)="periodSeriesChanged($event, item)"
                    [value]="periodSeriesAccount">
                </uni-select>
            </div><BR/>

            <span>Mva Perioder</span>
            <div>
                <uni-select [config]="periodSeriesConfig"
                    [items]="periodSeriesVatList"
                    (valueChange)="periodSeriesChanged($event, item)"
                    [value]="periodSeriesVat">
                </uni-select>
            </div>
        </article>

        <footer>
            <button [disabled]="!isPeriodSeriesChanged" (click)="close('save')" class="good">Utfør</button>
            <button (click)="close('cancel')" class="bad">Avbryt</button>
        </footer>

    </section>
    `
})

export class ChangeCompanySettingsPeriodSeriesModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

    private periodSeriesConfig: ISelectConfig;
    private currentAccountYear: number;
    private periodSeriesAccount: PeriodSeries;
    private periodSeriesVat: PeriodSeries;
    private isPeriodSeriesChanged: boolean;
    private companySettings: CompanySettings;
    private periodSeriesAccountList: Array<PeriodSeries>;
    private periodSeriesVatList: Array<PeriodSeries>;

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
            this.CancelAndClose();
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

    private CancelAndClose() {
        this.onClose.emit(false);
    }

    private changeCompanySettingsPeriodSeriesAndClose() {
        this.companySettingsService
            .changeCompanySettingsPeriodSeriesSettings(this.periodSeriesVat.ID, this.currentAccountYear)
                .subscribe(res => {
                    this.onClose.emit(false);
                }, err => this.errorService.handle(err)
            );
    }

}

