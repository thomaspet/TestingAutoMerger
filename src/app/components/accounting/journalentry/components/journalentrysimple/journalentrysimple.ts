import {Component, Input, SimpleChange, OnInit, OnChanges, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkjoin';

import {VatType, Account, Dimensions, SupplierInvoice} from '../../../../../unientities';
import {VatTypeService, AccountService, JournalEntryService, DepartementService, ProjectService} from '../../../../../services/services';

import {JournalEntryData} from '../../../../../models/models';
import {JournalEntrySimpleForm} from './journalentrysimpleform';

declare var moment;

@Component({
    selector: 'journal-entry-simple',
    templateUrl: 'app/components/accounting/journalentry/components/journalentrysimple/journalentrysimple.html',
    directives: [JournalEntrySimpleForm],
    providers: [DepartementService, ProjectService, VatTypeService, AccountService]
})
export class JournalEntrySimple implements OnInit, OnChanges {
    @Input() private supplierInvoice: SupplierInvoice;
    @Output() dataChanged: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() dataLoaded: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    
    public selectedJournalEntryLine: JournalEntryData;
    public journalEntryLines: Array<JournalEntryData>;
    public dropdownData: any;

    constructor(private journalEntryService: JournalEntryService,
        private departementService: DepartementService,
        private projectService: ProjectService,
        private vattypeService: VatTypeService,
        private accountService: AccountService,
        private router: Router) {
        this.journalEntryLines = new Array<JournalEntryData>();
    }

    private log(err) {
        alert(err._body);
    }

    public ngOnInit() {
        if (this.supplierInvoice) {
            this.journalEntryService.getJournalEntryDataBySupplierInvoiceID(this.supplierInvoice.ID)
                .subscribe(data => {
                    this.journalEntryLines = data;
                    this.dataLoaded.emit(data);                    
                });
        } else {
            this.journalEntryLines = new Array<JournalEntryData>();
            this.dataLoaded.emit(this.journalEntryLines);
        }

        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.vattypeService.GetAll(null),
            this.accountService.GetAll(null)
        ).subscribe(response => {
            this.dropdownData = response;
        });
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (this.supplierInvoice) {
            this.journalEntryService.getJournalEntryDataBySupplierInvoiceID(this.supplierInvoice.ID)
                .subscribe(data => {
                    this.journalEntryLines = data;
                });
        } else {
            this.journalEntryLines = new Array<JournalEntryData>();
        }
    }

    private getDepartmentName(line: JournalEntryData): string {
        if (this.dropdownData && line && line.Dimensions) {

            var dep = this.dropdownData[0].find((d) => d.ID == line.Dimensions.DepartementID);
            if (dep != null) {
                return line.Dimensions.DepartementID + ' - ' + dep.Name;
            }
        }

        return (line && line.Dimensions && line.Dimensions.DepartementID) ? line.Dimensions.DepartementID.toString() : '';
    }

    private getAccount(id: number): Account {
        if (this.dropdownData) {
            var dep = this.dropdownData[3].find((d) => d.ID == id);
            if (dep != null) {
                return dep;
            }
        }

        return null;
    }

    private getVatType(id: number): VatType {
        if (this.dropdownData) {
            var dep = this.dropdownData[2].find((d) => d.ID == id);
            if (dep != null) {
                return dep;
            }
        }

        return null;
    }

    private getProjectName(line: JournalEntryData): string {
        if (this.dropdownData && line && line.Dimensions) {
            var project = this.dropdownData[1].find((d) => d.ID == line.Dimensions.ProjectID);
            if (project != null) {
                return line.Dimensions.ProjectID + ' - ' + project.Name;
            }
        }

        return (line && line.Dimensions && line.Dimensions.ProjectID) ? line.Dimensions.ProjectID.toString() : '';
    }

    private postJournalEntryData() {
        this.journalEntryService.postJournalEntryData(this.journalEntryLines)
            .subscribe(
            data => {
                var firstJournalEntry = data[0];
                console.log(data);

                // Validate if journalEntry number has changed
                if (firstJournalEntry.JournalEntryNo != this.journalEntryLines[0].JournalEntryNo) {
                    alert("Lagring var vellykket. Men merk at tildelt bilagsnummer startet på " +firstJournalEntry.JournalEntryNo + "  istedet for: " + this.journalEntryLines[0].JournalEntryNo);
                } else {
                    alert('Lagring var vellykket');
                }

                //Empty list
                this.journalEntryLines = new Array<JournalEntryData>();
                
                this.dataChanged.emit(this.journalEntryLines);
            },
            err => {
                console.log('error in postJournalEntryData: ', err);
                this.log(err);
            });
    }

    private removeJournalEntryData() {
        if (confirm('Er du sikker på at du vil forkaste alle endringene dine?')) {
            this.journalEntryLines = new Array<JournalEntryData>();
        }
    }

    private addDummyJournalEntry() {
        var newline = JournalEntryService.getSomeNewDataForMe();
        newline.JournalEntryNo = `${Math.round((this.journalEntryLines.length / 3) + 1)}-2016`;
        this.journalEntryLines.unshift(newline);

        
        this.dataChanged.emit(this.journalEntryLines);
    }

    private setSelectedJournalEntryLine(selectedLine: JournalEntryData) {
        this.selectedJournalEntryLine = selectedLine;
    }

    private abortEdit() {
        this.selectedJournalEntryLine = null;
    }

    private parseJournalEntryData(updatedLine: JournalEntryData): JournalEntryData {
        var dimensions = new Dimensions();
        dimensions.DepartementID = updatedLine['Dimensions.DepartementID'];
        dimensions.ProjectID = updatedLine['Dimensions.ProjectID'];
        updatedLine.Dimensions = dimensions;

        updatedLine.DebitAccount = this.getAccount(updatedLine['DebitAccountID']);
        updatedLine.CreditAccount = this.getAccount(updatedLine['CreditAccountID']);
        updatedLine.DebitVatType = this.getVatType(updatedLine['VatTypeID']);

        updatedLine.FinancialDate = new Date(updatedLine['FinancialDate'].toString());

        return updatedLine;
    }

    private newLineCreated(journalEntryLine: any) {
        journalEntryLine = this.parseJournalEntryData(journalEntryLine);

        this.journalEntryLines.unshift(journalEntryLine);

        this.dataChanged.emit(this.journalEntryLines);
    }

    private editViewUpdated(journalEntryLine: JournalEntryData) {
        journalEntryLine = this.parseJournalEntryData(journalEntryLine);

        var currentRow = this.journalEntryLines.indexOf(this.selectedJournalEntryLine);
        this.journalEntryLines[currentRow] = journalEntryLine;
        this.selectedJournalEntryLine = null;
        
        this.dataChanged.emit(this.journalEntryLines);
    }    
}

