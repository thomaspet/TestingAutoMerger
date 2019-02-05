import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {BrowserStorageService, ReportDefinitionService, CompanySettingsService, IPaycheckEmailInfo} from '@app/services/services';
import {ReportDefinition, CompanySettings} from '@uni-entities';
import {map} from 'rxjs/operators';

const DEFAULT_OPTIONS_KEY = 'Default_Paycheck_Options';

@Component({
    selector: 'uni-paycheck-mail-options',
    templateUrl: './paycheck-mail-options.component.html',
    styleUrls: ['./paycheck-mail-options.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaycheckMailOptionsComponent implements OnInit {
    @Output() public mailOptions: EventEmitter<IPaycheckEmailInfo> = new EventEmitter();
    public formModel$: BehaviorSubject<IPaycheckEmailInfo> = new BehaviorSubject({});
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    constructor(
        private storageService: BrowserStorageService,
        private reportDefinitionService: ReportDefinitionService,
        private companySettingsService: CompanySettingsService,
    ) { }

    public ngOnInit() {
        this.GetReports()
            .pipe(map(r => this.getLayout(r)))
            .subscribe(l => this.fields$.next(l));

        this.getDefault()
            .do(def => this.mailOptions.next(def))
            .subscribe(def => this.formModel$.next(def));
    }

    private getDefault(): Observable<IPaycheckEmailInfo> {
        const def: IPaycheckEmailInfo = this.storageService.getItemFromCompany(DEFAULT_OPTIONS_KEY) || { grouped: false };
        if (def.Subject && def.Message) {
            return of(def);
        }
        return this.companySettingsService
            .getCompanySettings()
            .pipe(map(settings => {
                if (!def.ReportID) {
                    def.ReportID = 10;
                }
                if (!def.Subject) {
                    def.Subject = this.defaultSubject(settings);
                }
                if (!def.Message) {
                    def.Message = this.defaultMessage(settings);
                }
                return def;
            }));
    }

    private defaultSubject(compSettings: CompanySettings) {
        return `Lønnsslipp fra ${compSettings.CompanyName}`;
    }

    private defaultMessage(compSettings: CompanySettings) {
        return `Vedlagt lønnsslipp \n\r`
            + `Merk: Passordet for vedlagt fil er ditt fødselsnummer (11 siffer) \n\r`
            + `Med vennlig hilsen \n`
            + compSettings.CompanyName;
    }

    private getLayout(reports: ReportDefinition[]): UniFieldLayout[] {
        return <any[]>[
            {
                Property: 'ReportID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Rapport',
                Options: {
                    source: reports,
                    displayProperty: 'Description',
                    valueProperty: 'ID'
                }
            },
            {
                Property: 'Subject',
                FieldType: FieldType.TEXT,
                Label: 'Epost emne',
            },
            {
                Property: 'Message',
                FieldType: FieldType.TEXTAREA,
                Label: 'Epost melding',
            },
            {
                FieldType: FieldType.CHECKBOX,
                Label: 'Gruppering på lønnsart',
                Property: 'GroupByWageType',
                Tooltip: {
                    Text: 'Grupperer på lønnsart når lønnsart og sats er lik. Tekst på lønnsposten blir lik lønnsartnavn',
                    Alignment: 'bottom'
                }
            }
        ];
    }

    private GetReports(): Observable<ReportDefinition[]> {
        return this.reportDefinitionService
            .GetAll(`filter=contains(Name,'lønnslipp') or contains(Name,'lønnsslipp')`
                , ['ReportDefinitionDataSources'])
            .pipe(map((reports: ReportDefinition[]) => reports.filter(r => !r.Name.endsWith('emp_filter'))));
    }

    public formChange() {
        this.formModel$
            .take(1)
            .do(model => this.storageService.setItemOnCompany(DEFAULT_OPTIONS_KEY, model))
            .subscribe(m => this.mailOptions.next(m));
    }

}
