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
    @Input() public supplierInvoice: SupplierInvoice;
    @Input() public runAsSubComponent : boolean = false;
    
    @ViewChild(UniTable) table: UniTable;   
    journalEntryTable: UniTableConfig;
    
    @Output() dataChanged: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() dataLoaded: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    
    private projects: Project[];
    private departments: Departement[];
    private vattypes: VatType[];    
    journalEntryLines: JournalEntryData[] = [];
    
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
   
    private setProjectProperties(rowModel) {
        let project = rowModel['Dimensions.Project'];
        if (project) {
            rowModel.Dimensions.Project = project;
            rowModel.Dimensions.ProjectID = project.ID;
        }
    }
    
    private setDepartmentProperties(rowModel) {
        let dep = rowModel['Dimensions.Departement'];
        if (dep) {
            rowModel.Dimensions.Departement = dep;
            rowModel.Dimensions.DepartementID = dep.ID;
        }
    }
    
    private setupUniTable() {
        
        let financialDateCol = new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.Date).setWidth("7%");        
        
        let debitAccountCol = new UniTableColumn('DebitAccount', 'Debet', UniTableColumnType.Lookup)
            .setDisplayField('DebitAccount.AccountNumber')            
            .setTemplate((rowModel) => {
                if (rowModel.DebitAccount) {
                    let account = rowModel.DebitAccount;
                    return account.AccountNumber + ': ' + account.AccountName;
                }                
                return '';
            })
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
            .setTemplate((rowModel) => {
                if (rowModel.CreditAccount) {
                    let account = rowModel.CreditAccount;
                    return account.AccountNumber + ': ' + account.AccountName;
                }                
                return '';
            })
            .setWidth("15%")
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this.accountService.GetAll(`filter=contains(AccountNumber,'${searchValue}') or contains(AccountName,'${searchValue}')`, ['VatType']);
                }
            });
        
        let creditVatTypeCol = new UniTableColumn('CreditVatType', 'Kredit MVA', UniTableColumnType.Lookup)
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
         
        let amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Number).setWidth("5%");        
        
        let projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setWidth("8%")
            .setTemplate((rowModel) => {
                if (rowModel.Dimensions && rowModel.Dimensions.Project && rowModel.Dimensions.Project.Name) {
                    let project = rowModel.Dimensions.Project;
                    return project.ID + ' - ' + project.Name;
                }                
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.ID + ' - ' + item.Name);
                },
                lookupFunction: (searchValue) => {
                   return Observable.from([this.projects.filter((project) => project.ID == searchValue || project.Name.toLowerCase().indexOf(searchValue) >= 0)]);                          
                }
            });
        
        
        let departmentCol = new UniTableColumn('Dimensions.Departement', 'Avdeling', UniTableColumnType.Lookup)
            .setWidth("8%")
            .setTemplate((rowModel) => {
                
                if (rowModel.Dimensions && rowModel.Dimensions.Departement && rowModel.Dimensions.Departement.Name) {
                    let dep = rowModel.Dimensions.Departement;
                    return dep.ID + ' - ' + dep.Name;
                }                
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.ID + ' - ' + item.Name);
                },
                lookupFunction: (searchValue) => {
                   return Observable.from([this.departments.filter((dep) => dep.ID == searchValue || dep.Name.toLowerCase().indexOf(searchValue) >= 0)]);                          
                }
            });
        
        
        let descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);
                        
        this.journalEntryTable = new UniTableConfig(true, false, 100)
            .setColumns([
                financialDateCol, debitAccountCol, debitVatTypeCol, creditAccountCol, creditVatTypeCol, amountCol,
                projectCol, departmentCol, descriptionCol
            ])
            .setAutoAddNewRow(true)
            .setMultiRowSelect(false)
            .setDefaultRowData({ 
                Dimensions: {}
            })
            .setChangeCallback((event) => {
                var newRow = event.rowModel;
                
                //console.log('data endret, felt: ' + event.field + ', rowModel:', newRow);
                
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
                else if (event.field === 'Dimensions.Departement') {
                    this.setDepartmentProperties(newRow);
                }
                else if (event.field === 'Dimensions.Project') {
                    this.setProjectProperties(newRow);
                }
                
                // Return the updated row to the table
                return newRow;
            });
    }     
    
    public postJournalEntryData() {
        console.log('NOT IMPLEMENTED - SHOULD BE REFACTORED TO USE JOURNAL-ENTRY-MANUAL');
    }
    
    public removeJournalEntryData() {
        if (confirm('Er du sikker på at du vil forkaste alle endringene dine?')) { 
            this.journalEntryLines = new Array<JournalEntryData>();
        }
    }

    public addDummyJournalEntry() {
        var newline = JournalEntryService.getSomeNewDataForMe();
        newline.JournalEntryNo = `${Math.round((this.journalEntryLines.length / 3) + 1)}-2016`;
        this.journalEntryLines.unshift(newline);    
        this.journalEntryLines = this.journalEntryLines.slice(0);    
        this.dataChanged.emit(this.journalEntryLines);
    }
    
    
    private rowChanged(event) { 
        var tableData = this.table.getTableData();     
        
        this.dataChanged.emit(tableData); 
    }
}