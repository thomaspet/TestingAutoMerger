import { ErrorHandler, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IToolbarConfig, IToolbarValidation, ToolbarDropdownButton } from '@app/components/common/toolbar/toolbar';
import { safeInt } from '@app/components/common/utils/utils';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ErrorService } from '@app/services/services';
import { CodeListRowsCodeListRow, IncomeReportData, StatusCodeIncomeReport } from '@uni-entities';
import { IUniSaveAction } from '@uni-framework/save/save';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { IncomeReportsActions } from '../income-reports.actions';
import { IncomeReportsService } from '../shared/shared-services/incomeReportsService';
import { IIncomeReportState, IncomeReportStore } from '../income-reports.store';
import { IUniTab } from '@uni-framework/uni-tabs';
import { IncomeReportHelperService } from '../shared/shared-services/incomeReportHelperService';

@Component({
    selector: 'income-report-tab',
    templateUrl: './income-report.component.html',
    styleUrls: ['./income-report.component.sass']
})

export class IncomeReportComponent implements OnInit {
    state$: Observable<IIncomeReportState>;
    onDestroy$ = new Subject();
    readOnly: boolean;

    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig;
    toolbarStatusValidation: IToolbarValidation[];

    ytelser: CodeListRowsCodeListRow[];

    statusInfoText: string = '';
    isHidden: boolean = false;

    incomereportdata$ = new BehaviorSubject<IncomeReportData>(null);

    public activeTabIndex: number = 0;

    public childRoutes: IUniTab[] = [
        { name: 'Arbeidsgiver' },
        { name: 'Inntekt og arbeidsforhold' }
    ];

    dropdownButton: ToolbarDropdownButton;


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private incomeReportService: IncomeReportsService,
        private incomeReportHelperService: IncomeReportHelperService,
        private incomeReportsActions: IncomeReportsActions,
        private tabService: TabService,
        private errorHandler: ErrorHandler,
        private incomeReportStore: IncomeReportStore
    ) {
    }

    ngOnInit(): void {
        this.state$ = this.incomeReportStore.state$;
        this.incomeReportHelperService.getYtelseskoder().subscribe(res => this.ytelser = res);
        this.route.params.pipe(
            map(parentParams => safeInt(parentParams.id)),
            switchMap(id => this.incomeReportService.Get(id, ['Employment', 'Employment.Employee', 'Employment.Employee.BusinessRelationInfo', 'AltinnReceipt'])),
            takeUntil(this.onDestroy$),
        ).subscribe(incomereport => {
            this.incomeReportStore.incomeReportIsDirty = false;
            this.isHidden = false;
            this.addTab(incomereport);
            this.setToolbarConfig(incomereport);
            this.incomeReportStore.currentIncomeReport = incomereport;
            this.incomereportdata$.next(incomereport);
        }, error => this.errorService.handle(error));

        this.incomeReportStore
            .state$
            .pipe(
                takeUntil(this.onDestroy$),
                tap(() => this.readOnly = this.incomeReportStore.incomeReportIsReadOnly),
            )
            .subscribe(state => this.setSaveActions(state));
    }


    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.incomeReportStore.incomeReportIsDirty) {
            return true;
        }
        return this.incomeReportsActions.openAskForSaveIncomeReportModal();
    }

    private setIncomeReportStatusOnToolbar(incomereport: IncomeReportData) {
        const activeStatusCode = incomereport.StatusCode;

        let type: 'good' | 'bad' | 'warn';
        let label: string;

        switch (activeStatusCode) {
            case StatusCodeIncomeReport.Created:
                type = 'warn';
                label = 'Opprettet';
                this.statusInfoText = 'Du kan lagre underveis og gjøre endringer.  Når skjemaet er ferdig utfylt kan det sendes inn til Altinn ved å velge Send inn Inntektsmelding i Grønn knapp. Skjemaet kan bare sendes inn en gang, vil en gjøre endringer på innsendt skjema må en lage en kopi av skjemaet og sende inn som endring av skjema';
                break;
            case StatusCodeIncomeReport.Sent:
                type = 'good';
                label = 'Innsendt';
                this.statusInfoText = 'Skjemaet er sendt inn til Altinn, ønskes det å sende nytt skjema med endringer Velg Opprett ny basert på. Da lages en kopi av skjemaet med opplysningene en har fylt ut og en kan gjøre endringer og sende inn på nytt.';
                break;
            case StatusCodeIncomeReport.Rejected:
                type = 'bad';
                label = 'Avvist';
                this.statusInfoText = 'Skjemaet er avvist i Altinn. Korriger feilen(e), og send på nytt';
                break;
        }

        if (type && label) {
            this.toolbarStatusValidation = [{
                label: label,
                type: type,
            }];
        }
    }


    tabOnClick(clickedTab) {
        this.activeTabIndex = this.childRoutes.findIndex(tab => tab.name === clickedTab.name);
    }


    private setToolbarConfig(incomereport: IncomeReportData) {
        const reportTypeText = this.incomeReportHelperService.getIncomReportTypeText(incomereport.Type, this.ytelser) || incomereport.Type;
        this.setIncomeReportStatusOnToolbar(incomereport);
        this.toolbarconfig = {
            title: incomereport?.Type ? `${incomereport?.ID} - ${reportTypeText}` : 'Ny inntektsmelding',
        };
    }

    private setSaveActions(state: IIncomeReportState) {
        this.dropdownButton = {
            label: 'Opprett ny',
            class: 'dropdown-button',
            items: [
                { label: 'Opprett ny', action: () => this.router.navigateByUrl('/salary/incomereports/0') },
                { label: 'Opprett ny med denne inntektsmeldingen som mal'
                    , action: () => this.incomeReportsActions.createIncomeReportBasedOn(state.currentIncomeReport) }
            ]
        };

        this.saveActions = [{
            label: 'Lagre',
            action: (done) => this.incomeReportsActions.save().subscribe(incomereport => {
                if (incomereport.ID === 0) {
                    done('Inntektsmelding ikke lagret');
                } else {
                    done('Inntektsmelding  lagret');
                }
                this.router.navigateByUrl(`/salary/incomereports/${incomereport.ID}`);
            }, (error) => {
                this.errorHandler.handleError(error);
                done();
            }),
            disabled: state.currentIncomeReport?.StatusCode === StatusCodeIncomeReport.Sent || !state.incomeReportIsDirty,
            main: state.currentIncomeReport?.StatusCode !== StatusCodeIncomeReport.Sent
        },
        {
            label: 'Send inn inntektsmelding',
            action: (done) => this.sendIncomeReport(done),
            disabled: state.currentIncomeReport?.StatusCode === StatusCodeIncomeReport.Sent
        }];
    }

    public saveAndcontinue() {
        this.incomeReportsActions.save().subscribe(incomereport => {
            this.activeTabIndex = 1;
            this.incomereportdata$.next(incomereport);
        });
    }

    private addTab(incomereport: IncomeReportData) {
        const title = incomereport?.Type ? `${incomereport?.Type} ${incomereport?.ID}` : 'Ny inntektsmelding';
        const id = incomereport?.ID ? incomereport.ID : 0;
        this.tabService.addTab({
            name: `${title}`, url: `/salary/incomereports/${id}`,
            moduleID: UniModules.IncomeReports, active: true
        });
    }

    private sendIncomeReport(done) {
        this.incomeReportService.sendIncomeReport(this.incomeReportStore.currentIncomeReport.ID).subscribe((response: IncomeReportData) => {
            if (response) {
                this.incomeReportStore.currentIncomeReport = response;
                if (this.incomeReportStore.currentIncomeReport.StatusCode === StatusCodeIncomeReport.Sent) {
                    done('Inntektsmelding sendt inn');
                } else {
                    done('Inntektsmelding avvist med feil');
                }
                this.setToolbarConfig(this.incomeReportStore.currentIncomeReport);
            }
        }, err => {
            this.errorService.handle(err);
            const msg = err.status === 500 ? 'Sjekk Altinn innstillinger, ' : '';
            done(msg + err.statusText);
        });
    }



}
