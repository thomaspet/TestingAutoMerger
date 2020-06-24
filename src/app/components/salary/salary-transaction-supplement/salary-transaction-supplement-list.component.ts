import { ICellClickEvent } from '@uni-framework/ui/ag-grid/interfaces';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { ReplaySubject } from 'rxjs';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ActivatedRoute } from '@angular/router';
import { UniModalService } from '@uni-framework/uni-modal';
import { UniSupplementEditModal } from '@app/components/salary/salary-transaction-supplement/edit-value-modal.component';
import { SalaryTransactionSupplementListService, ISupplementLine } from '@app/components/salary/salary-transaction-supplement/shared/service/salary-transaction-supplement-list.service';
import { HttpParams } from '@angular/common/http';

@Component({
    selector: 'salary-transaction-supplement-list',
    templateUrl: './salary-transaction-supplement-list.component.html'
})
export class SalaryTransactionSupplementListComponent implements OnInit {

    @ViewChild(AgGridWrapper, { static: true })
    private table: AgGridWrapper;
    lookupFunction: (urlParams: HttpParams) => any;
    public tableConfig$: ReplaySubject<UniTableConfig>;
    public toolbarConfig: IToolbarConfig = {
        title: 'Tilleggsopplysninger'
    };

    constructor(
        private tabService: TabService,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private supplementListService: SalaryTransactionSupplementListService,
    ) {
        this.tableConfig$ = new ReplaySubject<UniTableConfig>(1);

        this.tabService.addTab({
            moduleID: UniModules.Supplements,
            name: 'Tilleggsopplysninger',
            url: 'salary/supplements'
        });


    }

    public ngOnInit() {
        this.route.params.subscribe(params => {
            this.lookupFunction = httpParams => this.supplementListService
                    .getAllSupplements(+params['runID'] || undefined, httpParams);
        });
        this.tableConfig$.next(this.getConfig());
    }

    private getConfig(): UniTableConfig {
        const employeeNumberCol = new UniTableColumn('_EmployeeNumber', 'Ansattnummer', UniTableColumnType.Number, false);
        const employeeNameCol = new UniTableColumn('_EmployeeName', 'Ansattnavn', UniTableColumnType.Text);
        const wageTypeCol = new UniTableColumn('_WageTypeNumber', 'Lønnsart', UniTableColumnType.Number, false)
            .setWidth('5.5rem');
        const textCol = new UniTableColumn('_Text', 'Tekst', UniTableColumnType.Text, false);
        const supplementTextCol = new UniTableColumn('_Name', 'Opplysningsfelt',
            UniTableColumnType.Text, false);
        const valueCol = new UniTableColumn('_Value', 'Verdi', UniTableColumnType.Text, true)
            .setTemplate((rowModel: ISupplementLine) => this.supplementListService.getDisplayValue(rowModel))
            .setFilterable(false);
        const fromDate = new UniTableColumn('_FromDate', 'Fra dato', UniTableColumnType.LocalDate, false)
            .setWidth('6rem');
        const toDate = new UniTableColumn('_ToDate', 'Til dato', UniTableColumnType.LocalDate, false)
            .setWidth('6rem');
        const runCol = new UniTableColumn('_PayrollRunID', 'Avregning', UniTableColumnType.Number, false)
            .setWidth('6rem');
        const amountCol = new UniTableColumn('_Amount', 'Antall', UniTableColumnType.Number, false);
        const sumCol = new UniTableColumn('_Sum', 'Beløp', UniTableColumnType.Money, false);

        let pageSize = window.innerHeight - 350;

        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34);

        return new UniTableConfig('salary.salaryTransactionSupplementsList.v2', false, true)
            .setAutoAddNewRow(false)
            .setColumns([employeeNumberCol, employeeNameCol, wageTypeCol, textCol, supplementTextCol, valueCol,
                fromDate, toDate, runCol, amountCol, sumCol])
            .setSearchable(true)
            .setContextMenu([{
                label: 'Rediger verdi',
                action: line => this.editValue(line)
            }]);
    }

    onCellClick(clickEvent: ICellClickEvent) {
        if (clickEvent && clickEvent.column && clickEvent.column.field === '_Value') {
            this.editValue(clickEvent.row);
        }
    }

    public editValue(line) {
        this.modalService.open(UniSupplementEditModal, { data: { line: line } }).onClose.subscribe((newLine) => {
            // Replace old line with new line in the array. No need to get data again.
            if (!newLine) {
                return;
            }
            this.table.refreshTableData();
        });
    }
}
