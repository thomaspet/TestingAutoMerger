import {Component, ViewChildren, ViewChild, Input, ComponentRef} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {UniFormBuilder, UniFieldBuilder, UniForm} from '../../../../../framework/forms';
import {UniAutocomplete, UniAutocompleteConfig} from '../../../../../framework/controls/autocomplete/autocomplete';
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {Router} from '@angular/router-deprecated';
import {UniHttp} from '../../../../../framework/core/http/http';
import {AccountService, JournalEntryService} from '../../../../services/services';
import {Customer, BusinessRelation, Account, ComponentLayout} from '../../../../unientities';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {Observable} from 'rxjs/Observable';

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
        
    private config: UniFormBuilder;
    private formInstance: UniForm;
    private periodeTable: UniTableConfig;
    private account: any;
    private periods$: Observable<any>;
    private isIncomingBalance: boolean;

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
        this.account = account;
        
        if (account) {
            this.periods$ = this.journalEntryService.getJournalEntryPeriodData(account.ID);
            this.periods$.subscribe((data) => {
               this.isIncomingBalance = data.find(period => period.PeriodNo == 0) != null; 
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
        let periodeCol = new UniTableColumn('PeriodName', 'Periode'); //.setWidth('60%');
        let lastYearCol = new UniTableColumn('PeriodSumYear1', `Regnskapsår ${year - 1}`)
            .setTemplate((period) => {
                return `<a href="/#/accounting/transquery/detailsByAccountId/${this.account.ID}/year/${year - 1}/period/${period.PeriodNo}/isIncomingBalance/${this.isIncomingBalance}">${period.PeriodSumYear1}</a>`;
            });
        let thisYearCol = new UniTableColumn('PeriodSumYear2', `Regnskapsår ${year}`)            
            .setTemplate((period) => {
                return `<a href="/#/accounting/transquery/detailsByAccountId/${this.account.ID}/year/${year}/period/${period.PeriodNo}/isIncomingBalance/${this.isIncomingBalance}">${period.PeriodSumYear2}</a>`;
            });
        
        // Setup table
        this.periodeTable = new UniTableConfig(false, false)
            .setColumns([periodeCol, lastYearCol, thisYearCol])
            .setColumnMenuVisible(false);
    }
}