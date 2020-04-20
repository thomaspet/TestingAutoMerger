import {Component, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {WidgetDataService} from '../../widgetDataService';
import {IUniWidget} from '../../uniWidget';
import {Router} from '@angular/router';
import PerfectScrollbar from 'perfect-scrollbar';
import {ReportDefinition} from '@uni-entities';
import {UniModalService, ConfirmActions, UniPreviewModal} from '@uni-framework/uni-modal';

import {SelectReportsModal} from './select-reports-modal';
import {UniReportParamsModal} from '@app/components/reports/modals/parameter/reportParamModal';
import {AnnualSatementReportFilterModalComponent} from '@app/components/reports/modals/anualStatement/anualStatementReportFilterModal';
import {AuthService} from '@app/authService';

const LOCALSTORAGE_KEY = 'report_shortcuts_widget';

@Component({
    selector: 'uni-report-list-widget',
    templateUrl: './report-list.html',
    styleUrls: ['./report-list.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniReportListWidget implements AfterViewInit {
    widget: IUniWidget;
    reports: any[] = [];
    scrollbar: PerfectScrollbar;
    loadingErrorMsg: string = '';

    reportGroups: { name: string; reports: ReportDefinition[] }[];
    selectedReports: ReportDefinition[];
    unauthorized: boolean;
    QUERY: string = `/api/statistics?model=ReportDefinition` +
    `&select=ID as ID,Name as Name,Description as Description,Category as Category` +
    `&filter=visible ne 'false' and isstandard ne 'false'&orderby=Category`;

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private widgetDataService: WidgetDataService,
        private cdr: ChangeDetectorRef
    ) {}

    ngAfterViewInit() {
        let hasAccess = true;
        if (this.widget.permissions && this.widget.permissions.length) {
            const user = this.authService.currentUser;
            hasAccess = this.widget.permissions.some(p => this.authService.hasUIPermission(user, p));
        }

        if (hasAccess) {
            setTimeout(() => this.init());
        } else {
            this.unauthorized = true;
            this.cdr.markForCheck();
        }
    }

    ngOnDestroy() {
        if (this.scrollbar) {
            this.scrollbar.destroy();
        }
    }

    init() {
        this.scrollbar = new PerfectScrollbar('#report-list', {wheelPropagation: true});
        this.widgetDataService.getData(this.QUERY).subscribe(
            reports => {
                // Filter out salary reports that still run old modal for parameters
                // It got deprecated 2 years ago, f@$£ing refactor it..
                reports = (reports && reports.Data || []).filter(r => {
                    return r.ID !== 7 && r.ID !== 8 && r.ID !== 9 && r.ID !== 10 && r.ID !== 11;
                });

                let savedReportIDs = [];
                try {
                    savedReportIDs = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || [];
                } catch (e) {
                    console.error(e);
                }

                const selectedReports = [];
                savedReportIDs.forEach(reportID => {
                    const report = reports.find(r => r.ID === reportID);
                    if (report) {
                        selectedReports.push(report);
                    }
                });

                this.selectedReports = selectedReports;

                // Get report groups for setup dialog
                const groups = {};
                (reports || []).forEach((report: ReportDefinition) => {
                    const category = this.getCategory(report);
                    if (!groups[category]) {
                        groups[category] = [];
                    }

                    groups[category].push(report);
                });

                const reportGroups = [];
                Object.keys(groups).forEach(key => {
                    reportGroups.push({
                        name: key,
                        reports: groups[key]
                    });
                });

                this.reportGroups = reportGroups;

                this.cdr.markForCheck();
                setTimeout(() => {
                    this.scrollbar.update();
                });
            },
            err => console.error(err)
        );
    }

    openReport(report: ReportDefinition) {
        const modalConfig = {
            data: report,
            header: report.Name,
            message: report.Description
        };

        if (report.Name === 'Årsoppgave') {
            this.modalService.open(AnnualSatementReportFilterModalComponent, modalConfig).onClose.subscribe(res => {
                if (res === ConfirmActions.ACCEPT) {
                    this.modalService.open(UniPreviewModal, {data: report});
                }
            });
        } else {
            this.modalService.open(UniReportParamsModal, {
                data: report,
                header: report.Name,
                message: report.Description
            }).onClose.subscribe(modalResult => {
                if (modalResult === ConfirmActions.ACCEPT) {
                    this.modalService.open(UniPreviewModal, {
                        data: report
                    });
                }
            });
        }
    }

    openSetupModal() {
        this.modalService.open(SelectReportsModal, {
            data: {
                reportGroups: this.reportGroups,
                selectedReports: this.selectedReports
            }
        }).onClose.subscribe(selectedReports => {
            if (selectedReports) {
                this.selectedReports = selectedReports;
                const reportIDs = selectedReports.map(r => r.ID);
                localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(reportIDs));

                this.cdr.markForCheck();
                setTimeout(() => this.scrollbar && this.scrollbar.update());
            }
        });
    }

    private getCategory(report: ReportDefinition) {
        if (!report.Category) {
            return 'Ingen kategori';
        }

        const category = report.Category.split('.')[0];
        switch (category) {
            case 'Accounting':
                return 'Regnskap';
            case 'Salary':
                return 'Lønn';
            case 'Sales':
            case 'Faktura':
                return 'Salg';
            default:
                return category;
        }
    }
}
