import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Control} from '@angular/common';
import {Observable} from 'rxjs/Observable';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {UniHttp} from '../../../../../../framework/core/http/http';

import {VatType, Account, Dimensions, Project, Departement, SupplierInvoice} from '../../../../../unientities';
import {VatTypeService, AccountService, JournalEntryService, DepartementService, ProjectService} from '../../../../../services/services';

import {JournalEntrySimpleCalculationSummary} from '../../../../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryData} from '../../../../../models/models';

@Component({
    selector: "journal-entry-professional",
    templateUrl: "app/components/accounting/journalentry/components/journalentryprofessional/journalentryprofessional.html",
    providers: [VatTypeService, AccountService, DepartementService, ProjectService],
    directives: [UniTable]    
})
export class JournalEntryProfessional {    
    
    @ViewChild(UniTable) table: UniTable;   
    journalEntryTable: UniTableConfig;
    
    @Output() dataChanged: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() dataLoaded: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    
    private projects: Project[];
    private departments: Departement[];
    private vattypes: VatType[];    
    items: JournalEntryData[] = [];
    
    constructor(private uniHttpService: UniHttp, 
            private vatTypeService: VatTypeService, 
            private accountService: AccountService, 
            private journalEntryService: JournalEntryService,
            private departementService: DepartementService,
            private projectService: ProjectService) {
                 
    }
    
    ngOnInit() {
        this.setupJournalEntryTable();
    }
    
    ngOnChanges() {
        //this.setupJournalEntryTable();        
    }
    
    setupJournalEntryTable() {                   
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.vatTypeService.GetAll(null)
        ).subscribe(
            (data) => {                    
                this.departments = data[0];
                this.projects = data[1];
                this.vattypes = data[2];                
                this.setupUniTable();
                
                //this.ItemsLoaded.emit(this.items);
                this.dataLoaded.emit([]);
            },
            (err) => console.log('Error retrieving data: ', err)
        );            
    }   
         
    
    private setDebitAccountProperties(rowModel) {
        let account = rowModel.DebitAccount;
        if (account != null) {
            rowModel.DebitAccountID = account.ID; 
            rowModel.DebitVatType = account.VatType;
            rowModel.DebitVatTypeID = account.VatTypeID;
        } else {
            rowModel.DebitAccountID = null;
        }
    }
    
    private setCreditAccountProperties(rowModel) {
        let account = rowModel.CreditAccount;
        if (account != null) {
            rowModel.CreditAccountID = account.ID; 
            rowModel.CreditVatType = account.VatType;
            rowModel.CreditVatTypeID = account.VatTypeID;
        } else {
            rowModel.CreditAccountID = null;
        }       
    }
    
    private setDebitVatTypeProperties(rowModel) {
        let vattype = rowModel.DebitVatType;
        rowModel.DebitVatTypeID = vattype != null ? vattype.ID : null;
    }
    
    
    private setCreditVatTypeProperties(rowModel) {
        let vattype = rowModel.CreditVatType;
        rowModel.CreditVatTypeID = vattype != null ? vattype.ID : null;
    }
    
    private setupUniTable() {
        
        let financialDateCol = new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.Date);        
        
        let debitAccountCol = new UniTableColumn('DebitAccount', 'Debet', UniTableColumnType.Lookup)
            .setDisplayField('DebitAccount.AccountNumber')
            .setWidth("15%")
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this.accountService.GetAll(`filter=contains(AccountNumber,'${searchValue}') or contains(AccountName,'${searchValue}')`, ['VatType']);
                }
            });
        
        let debitVatTypeCol = new UniTableColumn('DebitVatType', 'Debet MVA', UniTableColumnType.Lookup)
            .setDisplayField('DebitVatType.VatCode')
            .setWidth("8%")
            .setTemplate((rowModel) => {
                if (rowModel.DebitVatType) {
                    let vatType = rowModel.DebitVatType;
                    return vatType.VatCode + ': ' + vatType.VatPercent + '%';
                }                
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    //return 'test';
                    return (item.VatCode + ': ' + item.Name + ' - ' + item.VatPercent + '%');
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.vattypes.filter((vattype) => vattype.VatCode === searchValue || vattype.VatPercent == searchValue)]);                                  
                }
            });
        
        let creditAccountCol = new UniTableColumn('CreditAccount', 'Debet', UniTableColumnType.Lookup)
            .setDisplayField('CreditAccount.AccountNumber')
            .setWidth("15%")
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this.accountService.GetAll(`filter=contains(AccountNumber,'${searchValue}') or contains(AccountName,'${searchValue}')`, ['VatType']);
                }
            });
        
        let creditVatTypeCol = new UniTableColumn('CreditVatType', 'Debet MVA', UniTableColumnType.Lookup)
            .setWidth("8%")
            .setTemplate((rowModel) => {
                if (rowModel.CreditVatType) {
                    let vatType = rowModel.CreditVatType;
                    return vatType.VatCode + ': ' + vatType.VatPercent + '%';
                }                
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.VatCode + ': ' + item.Name + ' - ' + item.VatPercent + '%');
                },
                lookupFunction: (searchValue) => {
                   return Observable.from([this.vattypes.filter((vattype) => vattype.VatCode === searchValue || vattype.VatPercent == searchValue)]);                          
                }
            });
         
        //let itemTextCol = new UniTableColumn('ItemText', 'Tekst');
        //let unitCol = new UniTableColumn('Unit', 'Enhet');
        let amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Number);        
        
        let projectCol = new UniTableColumn('Description', 'Prosjekt', UniTableColumnType.Text);
        
        
        let departmentCol = new UniTableColumn('Description', 'Avdeling', UniTableColumnType.Text);
        
        let descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);
        
        
        /*let exVatCol = new UniTableColumn('PriceExVat', 'Pris eks mva', UniTableColumnType.Number);
        let discountPercentCol = new UniTableColumn('DiscountPercent', 'Rabatt %', UniTableColumnType.Number);
        let discountCol = new UniTableColumn('Discount', 'Rabatt', UniTableColumnType.Number, false);
                
        let vatTypeCol = new UniTableColumn('VatType', 'MVA %', UniTableColumnType.Lookup)
            .setTemplate((rowModel) => {
                if (rowModel['VatType']) {
                    let vatType = rowModel['VatType'];
                    return vatType['VatCode'] + ': ' + vatType['VatPercent'] + '%';
                }
                
                return '';
            })
            .setDisplayField('VatType.VatPercent')
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.VatCode + ': ' + item.Name + ' - ' + item.VatPercent + '%');
                },
                lookupFunction: (searchValue) => {
                   return this.vatTypeService.GetAll(`filter=contains(VatCode,'${searchValue}') or contains(VatPercent,'${searchValue}')`);                        
                }
            });
        
        let sumVatCol = new UniTableColumn('SumVat', 'Mva', UniTableColumnType.Number, false);
        let sumTotalIncVatCol = new UniTableColumn('SumTotalIncVat', 'Sum ink. mva', UniTableColumnType.Number, false);        
        */
                
        this.journalEntryTable = new UniTableConfig(true, false, 100)
            .setColumns([
                financialDateCol, debitAccountCol, debitVatTypeCol, creditAccountCol, creditVatTypeCol, amountCol,
                projectCol, departmentCol, descriptionCol
            ])
            .setAutoAddNewRow(true)
            .setMultiRowSelect(false)
            .setDefaultRowData({ 
            })
            .setChangeCallback((event) => {
                var newRow = event.rowModel;
                
                console.log('data endret, felt: ' + event.field + ', rowModel:', newRow);
                
                if (event.field === 'DebitAccount') {
                    this.setDebitAccountProperties(newRow);
                }
                else if (event.field === 'CreditAccount') {
                    this.setCreditAccountProperties(newRow);
                }
                else if (event.field === 'DebitVatType') {
                    this.setDebitVatTypeProperties(newRow);
                }                
                else if (event.field === 'CreditVatType') {
                    this.setCreditVatTypeProperties(newRow);
                }
                
                // Return the updated row to the table
                return newRow;
            }); 
            
            console.log('this.journalEntryTable', this.journalEntryTable);
    }     
    
    private rowChanged(event) {  
        var tableData = this.table.getTableData();     
        this.dataChanged.emit(tableData); 
    }
}