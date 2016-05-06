import {Component, ViewChildren, ViewChild, Input, ComponentRef} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {UniFormBuilder, UniFieldBuilder, UniForm} from '../../../../../framework/forms';
import {UniAutocomplete, UniAutocompleteConfig} from '../../../../../framework/controls/autocomplete/autocomplete';
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {AccountService} from "../../../../services/services";
import {Customer, BusinessRelation, Account, ComponentLayout} from "../../../../unientities";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

declare var jQuery;

@Component({
    selector: 'customer-list',
    templateUrl: 'app/components/accounting/transquery/list/transqueryList.html',
    directives: [UniTable, UniComponentLoader],
    providers: [AccountService]
})
export class TransqueryList {
    @ViewChild(UniComponentLoader)
    UniCmpLoader: UniComponentLoader;
    
    config: UniFormBuilder;
    
    periodeTable: UniTableBuilder;
    periodes: any;
    account: any;
    formInstance: UniForm;
 
    constructor(private router: Router, private accountService: AccountService) {
        this.setupPeriodeTable();               
    }
    
    ngAfterViewInit() {
        var view: ComponentLayout = {
            Name: "TransqueryList",
            BaseEntity: "Account",
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: "Account",
                    Property: "Account",
                    Placement: 4,
                    Hidden: false,
                    FieldType: 0,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Konto",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                }
            ]
        };
        
        this.config = new UniFormLayoutBuilder().build(view, this);
        //this.config.hideSubmitButton();  
        this.extendFormConfig();
        this.loadForm();  
    }
    
    extendFormConfig() {
        var account: UniFieldBuilder = this.config.find('Account');  
        account.setKendoOptions(UniAutocompleteConfig.build({
            valueKey: 'AccountNumber',
            template: (obj:Account) => `${obj.AccountNumber} - ${obj.AccountName}`,
            minLength: 1,
            debounceTime: 300,
            search: (query:string) => this.accountService.GetAll(`filter=startswith(AccountNumber,'${query}') or contains(AccountName,'${query}')`)
        })); 
        account.onSelect = (account) => {
            console.log("== ACCOUNT SELECTED ==");
            console.log(account);
            this.loadTableData(account);  
        };
    }
    
    loadTableData(account: Account) {
        // TODO check account type
        // IB for some not all
        // UB or Total
        
        this.periodes = [
            {ID: 1, Periode: 'IB', LastYear: 10000, ThisYear: 20000},
            {ID: 2, Periode: 'Januar', LastYear: 1, ThisYear: 2},
            {ID: 3, Periode: 'Februar', LastYear: 1, ThisYear: 2},
            {ID: 4, Periode: 'Mars', LastYear: 1, ThisYear: 2},
            {ID: 5, Periode: 'April', LastYear: 1, ThisYear: 2},
            {ID: 6, Periode: 'Mai', LastYear: 1, ThisYear: 2},
            {ID: 7, Periode: 'Juni', LastYear: 1, ThisYear: 2},
            {ID: 8, Periode: 'Juli', LastYear: 1, ThisYear: 2},
            {ID: 9, Periode: 'August', LastYear: 1, ThisYear: 2},
            {ID: 10, Periode: 'September', LastYear: 1, ThisYear: 2},
            {ID: 11, Periode: 'Oktober', LastYear: 1, ThisYear: 2},
            {ID: 12, Periode: 'November', LastYear: 1, ThisYear: 2},
            {ID: 13, Periode: 'Desember', LastYear: 1, ThisYear: 2},
            {ID: 14, Periode: 'UB', LastYear: 1, ThisYear: 2},
        ];
    }
    
    loadForm() {
        var self = this;
        return this.UniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
            cmp.instance.config = self.config;
            cmp.instance.ready.subscribe((instance:UniForm) => {
                self.formInstance = cmp.instance
            });
        });
    }
      
    setupPeriodeTable() {
        // Define columns to use in the table
        var periodeCol = new UniTableColumn('Periode', 'Periode', 'string').setWidth('60%');
        var lastYearCol = new UniTableColumn('LastYear', 'Regnskapsår 2015', 'string');
        var thisYearCol = new UniTableColumn('ThisYear', 'Regnskapsår 2016', 'string');
                
        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            this.router.navigateByUrl('/sales/transquery/details/' + selectedItem.ID);
        }
        
        this.loadTableData(null);

        // Setup table
        this.periodeTable = new UniTableBuilder(this.periodes, false)
            .setSelectCallback(selectCallback)
            .setFilterable(false)
            .setColumnMenuVisible(false)
            .setSearchable(false)
            .setPageSize(14)
            .setPageable(false)
            .addColumns(periodeCol, lastYearCol, thisYearCol);            
    }
}