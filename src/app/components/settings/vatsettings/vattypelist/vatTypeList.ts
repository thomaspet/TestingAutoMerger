import {Component, ViewChild, Output, EventEmitter} from '@angular/core';
import {URLSearchParams} from '@angular/http';

import {VatType} from '../../../../unientities';
import {VatTypeService, VatCodeGroupService} from '../../../../services/services';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';

@Component({
    selector: 'vattype-list',
    templateUrl: 'app/components/settings/vatsettings/vattypelist/vatTypeList.html',
    providers: [VatTypeService, VatCodeGroupService],
    directives: [UniTable]
})
export class VatTypeList {
    @Output() public uniVatTypeChange: EventEmitter<VatType> = new EventEmitter<VatType>();
    @ViewChild(UniTable) private table: UniTable;
    private vatTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(private vatTypeService: VatTypeService, private vatCodeGroupService: VatCodeGroupService) {
    }
    
    public ngOnInit() {
        this.setupTable();
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
            
            params.set('expand', 'VatCodeGroup,IncomingAccount,OutgoingAccount');
            
            return this.vatTypeService.GetAllByUrlSearchParams(params);
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
