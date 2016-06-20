import {Component, Input, SimpleChange, OnInit, OnChanges, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {VatType, Account, Dimensions, SupplierInvoice} from '../../../../../unientities';
import {VatTypeService, AccountService, JournalEntryService, DepartementService, ProjectService} from '../../../../../services/services';

import {JournalEntryData} from '../../../../../models/models';
import {JournalEntrySimpleForm,JournalEntryMode} from './journalentrysimpleform';

declare var moment;

@Component({
    selector: 'journal-entry-simple',
    templateUrl: 'app/components/accounting/journalentry/components/journalentrysimple/journalentrysimple.html',
    directives: [JournalEntrySimpleForm],
    providers: [DepartementService, ProjectService, VatTypeService, AccountService]
})
export class JournalEntrySimple implements OnInit, OnChanges {
    @Input() public supplierInvoice: SupplierInvoice;
    @Input() public runAsSubComponent : boolean = false;
    @Input() public mode : number = JournalEntryMode.Manual;
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
                    for(var line in data) {
                       data[line].FinancialDate = new Date(data[line].FinancialDate);
                    }
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
                    for(var line in data) {
                       data[line].FinancialDate = new Date(data[line].FinancialDate);
                    }
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

    public postJournalEntryData() {
        this.journalEntryService.postJournalEntryData(this.journalEntryLines)
            .subscribe(
            data => {
                var firstJournalEntry = data[0];
                var lastJournalEntry = data[data.length - 1];

                // Validate if journalEntry number has changed
                // TODO: Should maybe test all numbers?
                var numbers = this.journalEntryService.findJournalNumbersFromLines(this.journalEntryLines);
                if (firstJournalEntry.JournalEntryNo != numbers.firstNumber ||
                    lastJournalEntry.JournalEntryNo != numbers.lastNumber) {
                    alert("Lagring var vellykket. Men merk at tildelt bilagsnummer er " + firstJournalEntry.JournalEntryNo + " - " + lastJournalEntry.JournalEntryNo);
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

    private findFirstJournalNumberFromLines(firstNumer: string = "") {
        var first, last, year;

        if (this.journalEntryLines && this.journalEntryLines.length) {
            this.journalEntryLines.forEach((l: JournalEntryData, i) => {
                var parts = l.JournalEntryNo.split('-');
                var no = parseInt(parts[0]);
                if (!first || no < first) {
                    first = no;
                }
                if (!last || no > last) {
                    last = no;
                }
                if (i == 0) {
                    year = parseInt(parts[1]);
                }
            });
        }
        return {
            first: first,
            last: last,
            year: year,
            nextNumber: `${last + (this.journalEntryLines.length ? 1 : 0)}-${year}`,
            lastNumber: `${last}-${year}`
        };
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
        
        if (updatedLine['FinancialDate'] && typeof updatedLine['FinancialDate'] == 'string') {
            updatedLine.FinancialDate = new Date(updatedLine['FinancialDate'].toString());         
        }
        
        if (this.supplierInvoice) {
            updatedLine.JournalEntryID = this.supplierInvoice.JournalEntryID;
        }
        
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
    
    private getFinancialDateString(line : JournalEntryData) : string {
        return line.FinancialDate != null && line.FinancialDate.toISOString() != '0001-01-01T00:00:00.000Z' ? line.FinancialDate.toLocaleDateString() : "";
    }
}
