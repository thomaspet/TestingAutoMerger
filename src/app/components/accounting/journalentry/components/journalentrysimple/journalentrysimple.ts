import {Component, Input, Output, ViewChild, SimpleChange, EventEmitter, QueryList} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {FieldType, VatType, VatCodeGroup, Account, Dimensions} from "../../../../../unientities";
import {VatTypeService, VatCodeGroupService, AccountService, JournalEntryService, JournalEntryLineService, DepartementService, ProjectService} from "../../../../../services/services";

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
    public selectedJournalEntryLine : JournalEntryData;
    
    public journalEntryLines: Array<JournalEntryData>;
    public validationResult: any;
    public DropdownData: any;
        
    constructor(private journalEntryService : JournalEntryService, 
                private departementService: DepartementService,
                private projectService: ProjectService, 
                private vattypeService: VatTypeService,
                private accountService: AccountService) {
        this.journalEntryLines = new Array<JournalEntryData>();        
    }
    
    ngOnInit() {
        this.journalEntryService.getAggregatedData()
            .subscribe(data => 
            {                
                this.journalEntryLines = data;
            }); 
            
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.vattypeService.GetAll(null),
            this.accountService.GetAll(null)
        ).subscribe(response => {
            this.DropdownData = response;                               
        });
    }       
    
    getDepartmentName(id: number): string {
        if (this.DropdownData) {
            var dep = this.DropdownData[0].find((d) => d.ID == id);
            if (dep != null)
                return id + ' - ' + dep.Name;            
        }
        
        return id.toString();
    }
    
    getProjectName(id: number): string {
        if (this.DropdownData) {
            var project = this.DropdownData[1].find((d) => d.ID == id);
            if (project != null)
                return id + ' - ' + project.Name;
        }
        
        return id.toString(); 
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
    
    addDummyJournalEntry() {
        var newline = JournalEntryService.getSomeNewDataForMe();
        newline.JournalEntryNo = Math.round((this.journalEntryLines.length/3) + 1);         
        this.journalEntryLines.unshift(newline);
    }
    
    newLineCreated(journalEntryLine : any) {
        this.journalEntryLines.unshift(journalEntryLine);
    }
    
    setSelectedJournalEntryLine(selectedLine: JournalEntryData) {        
        this.selectedJournalEntryLine = selectedLine;
    }
    
    abortEdit() {
        this.selectedJournalEntryLine = null;        
    }
    
    editViewUpdated(updatedLine : JournalEntryData) {        
        
    }
}

