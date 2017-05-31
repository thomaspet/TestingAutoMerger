import {Component, ViewChild, Output, EventEmitter, ElementRef} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {VatType} from '../../../../unientities';
import {VatTypeService, ErrorService} from '../../../../services/services';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';

@Component({
    selector: 'vattype-list',
    templateUrl: './vatTypeList.html'
})
export class VatTypeList {
    @Output() public uniVatTypeChange: EventEmitter<VatType> = new EventEmitter<VatType>();
    @ViewChild(UniTable) private table: UniTable;
    private vatTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private vatTypeService: VatTypeService,
        private errorService: ErrorService,
        private elementRef: ElementRef
    ) {
    }

    public ngOnInit() {
        this.setupTable();
    }

    public ngAfterViewInit() {
        const input = this.elementRef.nativeElement.querySelector('input');
        input.focus();
    }

    private onRowSelected (event) {
        this.uniVatTypeChange.emit(event.rowModel);
    };

    public refresh() {
        this.table.refreshTableData();
    }

    private setupTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            if (!params.get('orderby')) {
                params.set('orderby', 'VatCode');
            }

            params.set('expand', 'VatCodeGroup,IncomingAccount,OutgoingAccount,VatReportReferences,VatReportReferences.VatPost,VatReportReferences.Account');

            return this.vatTypeService.GetAllByUrlSearchParams(params).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };


        let groupCol = new UniTableColumn('VatCodeGroup.Name', 'Gruppe', UniTableColumnType.Text).setWidth('20%');
        let codeCol = new UniTableColumn('VatCode', 'Kode', UniTableColumnType.Text).setWidth('10%');
        let aliasCol = new UniTableColumn('Alias', 'Alias', UniTableColumnType.Text).setWidth('10%');
        let nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setWidth('30%');
        let incomingAccountCol = new UniTableColumn('IncomingAccount.AccountNumber', 'Inng. konto', UniTableColumnType.Text).setWidth('10%');
        let outgoingAccountCol = new UniTableColumn('OutgoingAccount.AccountNumber', 'Utg. konto', UniTableColumnType.Text).setWidth('10%');
        let percentCol = new UniTableColumn('VatPercent', 'Prosent', UniTableColumnType.Number)
            .setWidth('10%')
            .setTemplate((data) => data.VatPercent + '%')
            .setFilterOperator('eq');

        // Setup table
        this.vatTableConfig = new UniTableConfig(false, true, 25)
            .setSearchable(true)
            .setColumns([groupCol, codeCol, aliasCol, nameCol, incomingAccountCol, outgoingAccountCol, percentCol]);
    }
}
