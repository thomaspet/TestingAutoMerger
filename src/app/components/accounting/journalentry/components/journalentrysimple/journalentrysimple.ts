import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter, QueryList} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, VatType, VatCodeGroup, Account, Dimensions, SupplierInvoice} from "../../../../../unientities";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService, JournalEntryLineService, DepartementService, ProjectService} from "../../../../../services/services";

import {JournalEntrySimpleCalculationSummary} from '../../../../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryData} from "../../../../../models/models";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../../framework/forms";

import {JournalEntrySimpleForm} from './journalentrysimpleform';

@Component({
    selector: "journal-entry-simple",
    templateUrl: "app/components/accounting/journalentry/components/journalentrysimple/journalentrysimple.html",
    directives: [JournalEntrySimpleForm],
    providers: [JournalEntryService, DepartementService, ProjectService, VatTypeService, AccountService]    
})
export class JournalEntrySimple {
    @Input() supplierInvoice: SupplierInvoice;
    public selectedJournalEntryLine : JournalEntryData;
    
    public journalEntryLines: Array<JournalEntryData>;
    public validationResult: any;
    public DropdownData: any;

    itemsSummaryData: JournalEntrySimpleCalculationSummary;
    recalcTimeout: any;
    private busy: boolean;

       
    constructor(private journalEntryService : JournalEntryService, 
                private departementService: DepartementService,
                private projectService: ProjectService, 
                private vattypeService: VatTypeService,
                private accountService: AccountService) {
        this.journalEntryLines = new Array<JournalEntryData>();        
    }

    log(err) {
        alert(err._body);
    }
    
    ngOnInit() {
        if (this.supplierInvoice) {
            this.journalEntryService.getJournalEntryDataBySupplierInvoiceID(this.supplierInvoice.ID)
                .subscribe(data => 
                {                
                    this.journalEntryLines = data;
                }); 
        } else {                           
            this.journalEntryLines = new Array<JournalEntryData>(); ;               
        }
        
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.vattypeService.GetAll(null),
            this.accountService.GetAll(null)
        ).subscribe(response => {
            this.DropdownData = response;                               
        });
    }  
    
    ngOnChanges(changes: { [propName: string]: SimpleChange }) {

        if (this.supplierInvoice) {
            this.journalEntryService.getJournalEntryDataBySupplierInvoiceID(this.supplierInvoice.ID)
                .subscribe(data => {
                    this.journalEntryLines = data;
                });
        } else {
            this.journalEntryLines = new Array<JournalEntryData>();;
        }
    }     
    
    getDepartmentName(line: JournalEntryData): string {
        if (this.DropdownData && line && line.Dimensions) {
            
            var dep = this.DropdownData[0].find((d) => d.ID == line.Dimensions.DepartementID);
            if (dep != null)
                return line.Dimensions.DepartementID + ' - ' + dep.Name;            
        }
        
        return (line && line.Dimensions && line.Dimensions.DepartementID) ? line.Dimensions.DepartementID.toString() : "";        
    }
    
    getAccount(id: number): Account { 
        if (this.DropdownData) {
            var dep = this.DropdownData[3].find((d) => d.ID == id);
            if (dep != null)
                return dep;            
        }
        
        return null;
    }
    
    getVatType(id: number): VatType { 
        if (this.DropdownData) {
            var dep = this.DropdownData[2].find((d) => d.ID == id);
            if (dep != null)
                return dep;            
        }
        
        return null;
    }
    
    getProjectName(line: JournalEntryData): string {
        if (this.DropdownData && line && line.Dimensions) {
            var project = this.DropdownData[1].find((d) => d.ID == line.Dimensions.ProjectID);
            if (project != null)
                return line.Dimensions.ProjectID + ' - ' + project.Name;
        }
        
        return (line && line.Dimensions && line.Dimensions.ProjectID) ? line.Dimensions.ProjectID.toString() : ""; 
    }
    
    postJournalEntryData() {
        this.journalEntryService.postJournalEntryData(this.journalEntryLines)
            .subscribe(
                data => {
                    data.forEach((row) => row.FinancialDate = new Date(row.FinancialDate));
                    
                    console.log(data);
                    this.journalEntryLines = data
                },
                err => console.log('error in postJournalEntryData: ', err)
            );
    }
    
    saveDraftJournalEntryData() {        
        alert('Ikke implementert');        
    }
    
    validateJournalEntryData() {
        this.journalEntryService.validateJournalEntryData(this.journalEntryLines)
            .subscribe(
                data => {
                    this.validationResult = data;
                    console.log('valideringsresultat:', data);
                },
                err => console.log('error int validateJournalEntryData:', err)
            );
    }
    
    removeJournalEntryData() {        
        if (confirm('Er du sikker på at du vil forkaste alle endringene dine?')) {
            this.journalEntryLines = new Array<JournalEntryData>(); 
        }        
    }
    
    addDummyJournalEntry() {
        var newline = JournalEntryService.getSomeNewDataForMe();
        newline.JournalEntryNo = Math.round((this.journalEntryLines.length/3) + 1);         
        this.journalEntryLines.unshift(newline);
        
        this.validateJournalEntryData();
    }
        
    setSelectedJournalEntryLine(selectedLine: JournalEntryData) {        
        this.selectedJournalEntryLine = selectedLine;
    }
    
    abortEdit() {
        this.selectedJournalEntryLine = null;        
    }
    
    parseJournalEntryData(updatedLine: JournalEntryData) : JournalEntryData {
        var dimensions = new Dimensions();
        dimensions.DepartementID = updatedLine['Dimensions.DepartementID'];
        dimensions.ProjectID = updatedLine['Dimensions.ProjectID'];
        updatedLine.Dimensions = dimensions;
        
        updatedLine.DebitAccount = this.getAccount(updatedLine['DebitAccountID']);
        updatedLine.CreditAccount = this.getAccount(updatedLine['CreditAccountID']);
        updatedLine.DebitVatType = this.getVatType(updatedLine['VatTypeID']);
        
        updatedLine.FinancialDate = new Date(updatedLine['FinancialDate'].toString())
                
        return updatedLine;          
    }
    
    newLineCreated(journalEntryLine : any) {
        journalEntryLine = this.parseJournalEntryData(journalEntryLine);
        
        this.journalEntryLines.unshift(journalEntryLine);
        
        this.validateJournalEntryData();
        this.recalcItemSums();
    }

    editViewUpdated(journalEntryLine : JournalEntryData) { 
        journalEntryLine = this.parseJournalEntryData(journalEntryLine);          
        
        var currentRow = this.journalEntryLines.indexOf(this.selectedJournalEntryLine);
        this.journalEntryLines[currentRow] = journalEntryLine;                   
        this.selectedJournalEntryLine = null;
        
        this.validateJournalEntryData();        
    }

    recalcItemSums() {
        this.busy = true;

        // do recalc after 2 second to avoid to much requests
        if (this.recalcTimeout) {
            clearTimeout(this.recalcTimeout);
        }

        this.recalcTimeout = setTimeout(() => {

            this.journalEntryLines.forEach((x) => {
                x.Amount = x.Amount ? x.Amount : 0;
                x.DebitAccountID = x.DebitAccountID ? x.DebitAccountID : 0;
                x.DebitVatTypeID = x.DebitVatTypeID ? x.DebitVatTypeID : 0;
                x.CreditAccountID = x.CreditAccountID ? x.CreditAccountID : 0;
                x.CreditVatTypeID = x.CreditVatTypeID ? x.CreditVatTypeID : 0;
                //TODO ...?
            });


            //if (this.itemsSummaryData == null)
            //    this.itemsSummaryData = new JournalEntrySimpleCalculationSummary();

            //this.itemsSummaryData.SumDebet = 1 * this.journalEntryLines.length;
            //this.itemsSummaryData.SumCredit = 1201;
            //this.itemsSummaryData.Diff = 1202;
            //this.itemsSummaryData.IncomingVat = 1203;
            //this.itemsSummaryData.OutgoingVat = 1204;

            this.journalEntryService.calculateJournalEntrySummary(this.journalEntryLines)
                .subscribe((data) => {
                    this.itemsSummaryData = data;
                    this.busy = false;
                },
                (err) => {
                    console.log('Error when recalculating journal entry summary:', err)
                    this.log(err);
                }
                );
        }, 2000);
    }
}

