import {Component, Input, SimpleChange, OnInit, OnChanges} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkjoin';

import {VatType, Account, Dimensions, SupplierInvoice} from '../../../../../unientities';
import {VatTypeService, AccountService, JournalEntryService, DepartementService, ProjectService} from '../../../../../services/services';

import {JournalEntrySimpleCalculationSummary} from '../../../../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryData} from '../../../../../models/models';
import {JournalEntrySimpleForm} from './journalentrysimpleform';

@Component({
    selector: 'journal-entry-simple',
    templateUrl: 'app/components/accounting/journalentry/components/journalentrysimple/journalentrysimple.html',
    directives: [JournalEntrySimpleForm],
    providers: [JournalEntryService, DepartementService, ProjectService, VatTypeService, AccountService]
})
export class JournalEntrySimple implements OnInit, OnChanges {
    @Input() public supplierInvoice: SupplierInvoice;
    public selectedJournalEntryLine: JournalEntryData;

    public journalEntryLines: Array<JournalEntryData>;
    public validationResult: any;
    public dropdownData: any;

    private itemsSummaryData: JournalEntrySimpleCalculationSummary;
    private recalcTimeout: any;
    private busy: boolean;


    constructor(private journalEntryService: JournalEntryService,
                private departementService: DepartementService,
                private projectService: ProjectService,
                private vattypeService: VatTypeService,
                private accountService: AccountService) {
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
                });
        } else {
            this.journalEntryLines = new Array<JournalEntryData>();
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
                data.forEach((row) => row.FinancialDate = new Date(row.FinancialDate));

                console.log(data);
                this.journalEntryLines = data;
            },
            err => console.log('error in postJournalEntryData: ', err)
            );
    }

    private saveDraftJournalEntryData() {
        alert('Ikke implementert');
    }

    private validateJournalEntryData() {
        this.journalEntryService.validateJournalEntryData(this.journalEntryLines)
            .subscribe(
            data => {
                this.validationResult = data;
                console.log('valideringsresultat:', data);
            },
            err => console.log('error int validateJournalEntryData:', err)
            );
    }

    private removeJournalEntryData() {
        if (confirm('Er du sikker på at du vil forkaste alle endringene dine?')) {
            this.journalEntryLines = new Array<JournalEntryData>();
        }
    }

    private addDummyJournalEntry() {
        var newline = JournalEntryService.getSomeNewDataForMe();
        newline.JournalEntryNo = Math.round((this.journalEntryLines.length / 3) + 1);
        this.journalEntryLines.unshift(newline);

        this.validateJournalEntryData();
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

        this.validateJournalEntryData();
        this.recalcItemSums();
    }

    private editViewUpdated(journalEntryLine: JournalEntryData) {
        journalEntryLine = this.parseJournalEntryData(journalEntryLine);

        var currentRow = this.journalEntryLines.indexOf(this.selectedJournalEntryLine);
        this.journalEntryLines[currentRow] = journalEntryLine;
        this.selectedJournalEntryLine = null;

        this.validateJournalEntryData();
        this.recalcItemSums();
    }

    private recalcItemSums() {
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
                // TODO ...?
            });

            this.journalEntryService.calculateJournalEntrySummary(this.journalEntryLines)
                .subscribe((data) => {
                    this.itemsSummaryData = data;
                    this.busy = false;
                },
                (err) => {
                    console.log('Error when recalculating journal entry summary:', err);
                    this.log(err);
                }
                );
        }, 2000);
    }
}

