import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IncomeReportData, StatusCodeIncomeReport } from '@uni-entities';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IncomeReportsActions } from '../income-reports.actions';



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
    currentIncomeReportTab: string = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private incomeReportsActions: IncomeReportsActions
    ) {}

    ngOnInit(): void {
        this.tableConfig = this.createIncomeReportsTableConfig();
        this.route.queryParams.pipe(takeUntil(this.onDestroy$))
        .subscribe(params => this.lookupFunction = (httpParams: HttpParams) => {
            this.currentIncomeReportTab = params.incomereportstatus;
            return this.incomeReportsActions.loadIncomeReports(params.incomereportstatus, httpParams);
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
    onActiveTabChange(assetType) {
        this.activeTab = assetType;
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


    private createIncomeReportsTableConfig() {
        return new UniTableConfig(
            'income.reports.list', false, true, 15
        )
        .setSortable(true)
        .setVirtualScroll(true)
        .setSearchable(true)
        .setColumnMenuVisible(true)
        .setColumns(
            [
                new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number, false)
                    .setLinkClick(rowModel => this.router.navigateByUrl(`/salary/incomereports/incomereport/${rowModel.ID}`)),
                new UniTableColumn('BusinessRelationInfo.Name', 'Ansatt', UniTableColumnType.Link, false).setAlias('Name'),
                new UniTableColumn('AltinnReceipt.Timestamp', 'Innsendt', UniTableColumnType.LocalDate, false).setWidth(100).setAlias('SentToAltinn'),
                new UniTableColumn('Type', 'Type', UniTableColumnType.Text, false).setWidth(100),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text, false)
                .setTemplate(rowModel => {
                    switch (rowModel.StatusCode) {
                        case StatusCodeIncomeReport.Created:
                            return 'Opprettet';
                        case StatusCodeIncomeReport.Sendt:
                            return 'Sendt';
                        default : return '';
                    }
                }),
                new UniTableColumn('MonthlyRefund', 'Mnd ref beløp', UniTableColumnType.Money, false).setWidth(100)
            ]
       );

    }
}
