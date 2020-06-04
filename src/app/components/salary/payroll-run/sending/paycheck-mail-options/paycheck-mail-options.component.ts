import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {BrowserStorageService, ReportDefinitionService, CompanySettingsService, IPaycheckEmailInfo, ReportNames} from '@app/services/services';
import {ReportDefinition, CompanySettings} from '@uni-entities';
import {map, tap} from 'rxjs/operators';

const DEFAULT_OPTIONS_KEY = 'Default_Paycheck_Options';

@Component({
    selector: 'uni-paycheck-mail-options',
    templateUrl: './paycheck-mail-options.component.html',
    styleUrls: ['./paycheck-mail-options.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaycheckMailOptionsComponent implements OnInit {
    @Output() public mailOptions: EventEmitter<IPaycheckEmailInfo> = new EventEmitter();
    @Output() public printReport: EventEmitter<ReportDefinition> = new EventEmitter();
    public formModel$: BehaviorSubject<IPaycheckEmailInfo> = new BehaviorSubject({});
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    reports: ReportDefinition[] = [];
    constructor(
        private storageService: BrowserStorageService,
        private reportDefinitionService: ReportDefinitionService,
        private companySettingsService: CompanySettingsService,
    ) { }

    public ngOnInit() {
        this.GetMailReports()
            .pipe(
                map(r => this.getLayout(r))
            )
            .subscribe(l => this.fields$.next(l));

        this.getDefault()
            .pipe(
                tap(def => this.mailOptions.next(def)),
                tap(def => this.emitPrintReport(def)),
            )
            .subscribe(def => this.formModel$.next(def));
    }

    public ngOnDestroy() {
        this.reports = [];
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

    private emitPrintReport(info: IPaycheckEmailInfo) {
        this.GetPrintReport(info)
            .subscribe(r => this.printReport.next(r));
    }

    private GetMailReports(): Observable<ReportDefinition[]> {
        return this.GetReports()
            .pipe(map((reports: ReportDefinition[]) => reports.filter(r => !r.Name.endsWith('emp_filter'))));
    }

    private GetPrintReport(info: IPaycheckEmailInfo): Observable<ReportDefinition> {
        let name: string = null;
        return this.GetReports()
            .pipe(
                tap(reports => {
                    const report = reports.find(r => r.ID === info.ReportID);
                    name = report && report.Name;
                }),
                map((reports: ReportDefinition[]) => reports.filter(r => r.Name.endsWith('emp_filter'))),
                map((reports: ReportDefinition[]) => {
                    return reports.find(r => r.Name.replace('emp_filter', '').trim() === name)
                        || reports.find(r => r.Name === ReportNames.PAYCHECK_EMP_FILTER);
                }),
            );
    }

    private GetReports(): Observable<ReportDefinition[]> {
        if (this.reports && this.reports.length) {
            return of(this.reports);
        }
        this.reportDefinitionService.invalidateCache();
        return this.reportDefinitionService
            .GetAll(`filter=contains(Name,'lønnslipp') or contains(Name,'lønnsslipp')`
                , ['ReportDefinitionDataSources']);
    }

    public formChange() {
        this.formModel$
            .take(1)
            .do(model => this.storageService.setItemOnCompany(DEFAULT_OPTIONS_KEY, model))
            .pipe(
                tap(m => this.emitPrintReport(m)),
            )
            .subscribe(m => {
                this.mailOptions.next(m);
            });
    }

}
