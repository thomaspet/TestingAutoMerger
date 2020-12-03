import { ErrorHandler, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { safeInt } from '@app/components/common/utils/utils';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ErrorService } from '@app/services/services';
import { IncomeReportData } from '@uni-entities';
import { IUniSaveAction } from '@uni-framework/save/save';
import { UniModalService } from '@uni-framework/uni-modal';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { IncomeReportModal } from '../income-report-modal/income-report-modal';
import { IncomeReportsActions } from '../income-reports.actions';
import { IncomeReportsService } from '../shared-services/incomeReportsService';

@Component({
    selector: 'income-report-tab',
    templateUrl: './income-report.component.html',
})

export class IncomeReportComponent implements OnInit {
    onDestroy$ = new Subject();

    saveActions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig;

    incomereportdata: IncomeReportData;


    public childRoutes: any[] = [
        { name: 'Arbeidsgiver', path: 'employer' },
        { name: 'Inntekt og arbeidsforhold', path: 'incomedetails' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private errorService: ErrorService,
        private incomeReportService: IncomeReportsService,
        private modalService: UniModalService,
        private incomeReportsActions: IncomeReportsActions,
        private tabService: TabService,
        private errorHandler: ErrorHandler
    ) { }

    ngOnInit(): void {
        this.setSaveActions();

        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map(parentParams => safeInt(parentParams.id))
        ).subscribe((id) => {
            // if (id === 0) {
            //     this.modalService.open(IncomeReportModal).onClose.subscribe(incomereportdata => {
            //         if (incomereportdata) {
            //             this.router.navigateByUrl('/salary/incomereports/' + incomereportdata.ID);
            //         }
            //     });
            // } else {
                this.incomeReportService.Get(id, ['Employment', 'Employment.Employee', 'AltinnReceipt']).subscribe(incomereport => {
                    this.incomereportdata = incomereport;
                    this.addTab(this.incomereportdata);
                    this.setToolbarConfig(this.incomereportdata);
                });
            // }
        }, error => this.errorService.handle(error));
    }

    createStatus(incomereport: IncomeReportData) {
        if (!incomereport || !incomereport?.ID) {
            return [];
        }
        return [];
    }


    private setToolbarConfig(incomereport: IncomeReportData) {
        this.toolbarconfig = {
            title: incomereport?.Type ? `${incomereport?.Type} ${incomereport?.ID}` : 'Ny inntektsmelding',
            statustrack: this.createStatus(incomereport),
            navigation: {
                add: {
                    label: '',
                    action: () => this.router.navigateByUrl('/salary/incomereports/0')
                }
            }
        };
    }
    private setSaveActions() {
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
            main: true
        },
        {
            label: 'Opprett endring',
            action: (done) => {
                this.modalService.open(IncomeReportModal, { data: this.incomereportdata }).onClose
                    .subscribe(incomereportdata => {
                        if (incomereportdata) {
                            this.router.navigateByUrl('/salary/incomereports/' + incomereportdata.ID);
                        }
                    });
                    done();
            },
            disabled: !!this.incomereportdata?.ID
        }];
    }

    private addTab(incomereport: IncomeReportData) {
        const title = incomereport?.Type ? `${incomereport?.Type} ${incomereport?.ID}` : 'Ny inntektsmelding';
        const id = incomereport?.ID ? incomereport.ID : 0;
        this.tabService.addTab({
            name: `${title}`, url: `/salary/incomereports/${id}`,
            moduleID: UniModules.IncomeReports, active: true
        });
    }


}
