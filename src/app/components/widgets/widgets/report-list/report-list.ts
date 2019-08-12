import {Component, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {WidgetDataService} from '../../widgetDataService';
import {IUniWidget} from '../../uniWidget';
import {Router} from '@angular/router';
import PerfectScrollbar from 'perfect-scrollbar';
import {ReportDefinition} from '@uni-entities';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';

import {SelectReportsModal} from './select-reports-modal';
import {UniReportParamsModal} from '@app/components/reports/modals/parameter/reportParamModal';
import {UniPreviewModal} from '@app/components/reports/modals/preview/previewModal';
import {AnnualSatementReportFilterModalComponent} from '@app/components/reports/modals/anualStatement/anualStatementReportFilterModal';

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

    constructor(
        private modalService: UniModalService,
        private widgetDataService: WidgetDataService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar('#report-list', {wheelPropagation: true});
        this.widgetDataService.getData('/api/biz/report-definitions?orderby=Category').subscribe(
            reports => {
                // Filter out salary reports that still run old modal for parameters
                // It got deprecated 2 years ago, f@$£ing refactor it..
                reports = (reports || []).filter(r => {
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

    ngOnDestroy() {
        if (this.scrollbar) {
            this.scrollbar.destroy();
        }
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
