import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeListRowsCodeListRow, IncomeReportData, StatusCodeIncomeReport } from '@uni-entities';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IncomeReportsActions } from '../income-reports.actions';
import { IncomeReportHelperService } from '../shared/shared-services/incomeReportHelperService';



@Component({
    selector: 'income-reports-list-component',
    templateUrl: './income-reports-list.component.html',
    styleUrls: ['./income-reports-list.component.sass']
})

export class IncomeReportsListComponent {
    @ViewChild(AgGridWrapper) table: AgGridWrapper;
    lookupFunction: (params: HttpParams) => Observable<IncomeReportData[]>;

    onDestroy$ = new Subject();
    tabs = [];
    activeTab = null;
    imageUrl = 'themes/empty_state.svg';
    tabHasIncomeReports: boolean;
    tableConfig = null;
    busy: boolean = false;
    currentIncomeReportTab: string = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private incomeReportsActions: IncomeReportsActions,
        private incomeReportHelperService: IncomeReportHelperService,
    ) { }

    ngOnInit(): void {
        this.busy = true;
        this.incomeReportHelperService.getYtelseskoder().subscribe(res => {
            this.tableConfig = this.createIncomeReportsTableConfig(res);
            this.route.queryParams.pipe(takeUntil(this.onDestroy$))
                .subscribe(params => this.lookupFunction = (httpParams: HttpParams) => {
                    this.currentIncomeReportTab = params.incomereportstatus;
                    return this.incomeReportsActions.loadIncomeReports(params.incomereportstatus, httpParams);
                });
            this.busy = false;
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    onTabsReady(tabs) {
        this.tabs = tabs;
        this.checkNumberOfIncomeReports();
    }

    onActiveTabChange(tabName) {
        this.activeTab = tabName;
        this.checkNumberOfIncomeReports();
    }

    checkNumberOfIncomeReports() {
        if (this.tabs?.length > 0 && this.activeTab) {
            const tab = this.tabs.find(t => t.name === this.activeTab);
            this.tabHasIncomeReports = tab?.count > 0;
            return;
        }
        this.tabHasIncomeReports = false;
    }

    incomeReportSelected(incomereport: IncomeReportData) {
        if (incomereport.StatusCode !== StatusCodeIncomeReport.Deleted) {
            this.router.navigateByUrl(`/salary/incomereports/${incomereport.ID}`);
        }
    }

    private createIncomeReportsTableConfig(ytelser: CodeListRowsCodeListRow[]) {
        return new UniTableConfig(
            'income.reports.list', false, true, 15
        )
            .setSortable(true)
            .setVirtualScroll(true)
            .setSearchable(true)
            .setQuickFilters(
                [
                    {
                        field: '_employeeSearch',
                        label: 'Ansatt',
                        filterGenerator: query => query
                            ? `contains(BusinessRelationInfo.Name,'${query}') or startswith(Employee.EmployeeNumber,'${query}')`
                            : '',
                    }
                ]
            )
            .setColumnMenuVisible(true)
            .setColumns(
                [
                    new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number, false),
                    new UniTableColumn('BusinessRelationInfo.Name', 'Ansatt', UniTableColumnType.Link, false).setAlias('Name'),
                    new UniTableColumn('AltinnReceipt.Timestamp', 'Innsendt', UniTableColumnType.LocalDate, false).setWidth(100).setAlias('SentToAltinn'),
                    new UniTableColumn('Type', 'Type', UniTableColumnType.Text, false).setWidth(100)
                        .setTemplate(rowmodel => {
                            return this.incomeReportHelperService.getIncomReportTypeText(rowmodel.Type, ytelser);
                        }),
                    new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text, false)
                        .setTemplate(rowModel => {
                            switch (rowModel.StatusCode) {
                                case StatusCodeIncomeReport.Created:
                                    return 'Opprettet';
                                case StatusCodeIncomeReport.Sent:
                                    return 'Sendt';
                                case StatusCodeIncomeReport.Rejected:
                                    return 'Avvist';
                                case StatusCodeIncomeReport.Deleted:
                                    return 'Slettet';
                                default: return '';
                            }
                        }),
                    new UniTableColumn('MonthlyRefund', 'Mnd ref beløp', UniTableColumnType.Money, false).setWidth(100),
                    new UniTableColumn('Employment.ID', 'Arbeidsforhold', UniTableColumnType.Text, false).setWidth(100)
                        .setTemplate((item) => `${item.EmploymentNo} ${item.JobName}`).setVisible(false)
                ]
            )
            .setContextMenu(
                [
                    {
                        label: 'Opprett ny med denne inntektsmelding som mal',
                        action: line => this.incomeReportsActions.createIncomeReportBasedOnID(line.ID),
                        disabled: (item) => (item.StatusCode === StatusCodeIncomeReport.Deleted),
                    },
                    {
                        label: 'Slett',
                        action: line => this.incomeReportsActions.deleteIncomeReport(line)
                            .subscribe(() => this.table.refreshTableData()),
                        disabled: (item) => (item.StatusCode === StatusCodeIncomeReport.Deleted),
                    }
                ]
            );

    }
}
