import {Component, ViewChildren, ViewChild, Input, ComponentRef} from '@angular/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {UniFormBuilder, UniFieldBuilder, UniForm} from '../../../../../framework/forms';
import {UniAutocomplete, UniAutocompleteConfig} from '../../../../../framework/controls/autocomplete/autocomplete';
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {Router} from '@angular/router-deprecated';
import {UniHttp} from '../../../../../framework/core/http/http';
import {AccountService, JournalEntryService} from '../../../../services/services';
import {Customer, BusinessRelation, Account, ComponentLayout} from '../../../../unientities';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';

declare var jQuery;
declare var moment;

@Component({
    selector: 'customer-list',
    templateUrl: 'app/components/accounting/transquery/list/transqueryList.html',
    directives: [UniTable, UniComponentLoader],
    providers: [AccountService, JournalEntryService]
})
export class TransqueryList {
    @ViewChild(UniComponentLoader)
    uniCmpLoader: UniComponentLoader;
    
    @ViewChild(UniTable)
    table: UniTable;
    
    config: UniFormBuilder;
    
    periodeTable: UniTableBuilder;
    periodes = [];
    account: any;
    formInstance: UniForm;
 
    constructor(private router: Router, 
                private accountService: AccountService, 
                private journalEntryService: JournalEntryService) {
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
            this.loadTableData(account);  
        };
    }
    
    loadTableData(account: Account) {
        var self = this;
        if (account) {
            this.journalEntryService.getJournalEntryPeriodData(account.ID).subscribe((data) => {
                this.table.refresh(data);
            });            
        }
    }
    
    loadForm() {
        var self = this;
        return this.uniCmpLoader.load(UniForm).then((cmp: ComponentRef<any>) => {
            cmp.instance.config = self.config;
            cmp.instance.ready.subscribe((instance:UniForm) => {
                self.formInstance = cmp.instance
            });
        });
    }
      
    setupPeriodeTable() {
        var year: number = moment().year();
 
        // Define columns to use in the table
        var periodeCol = new UniTableColumn('PeriodName', 'Periode', 'string').setWidth('60%');
        var lastYearCol = new UniTableColumn('PeriodSumYear1', `Regnskapsår ${year - 1}`, 'string');
        var thisYearCol = new UniTableColumn('PeriodSumYear2', `Regnskapsår ${year}`, 'string');
        
        lastYearCol.setTemplate(`<a href="/\\#/accounting/transquery/details/${year - 1}/#= PeriodNo#">#= PeriodSumYear1#</a>`);
        thisYearCol.setTemplate(`<a href="/\\#/accounting/transquery/details/${year}/#= PeriodNo#">#= PeriodSumYear2#</a>`);
                          
        // Setup table
        this.periodeTable = new UniTableBuilder(this.periodes, false)
            .setFilterable(false)
            .setColumnMenuVisible(false)
            .setSearchable(false)
            .setPageSize(14)
            .setPageable(false)
            .addColumns(periodeCol, lastYearCol, thisYearCol);            
    }
}