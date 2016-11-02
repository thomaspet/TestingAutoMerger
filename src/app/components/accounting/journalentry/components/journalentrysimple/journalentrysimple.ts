import {Component, Input, SimpleChange, ViewChildren, QueryList, OnInit, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';


import {VatType, Account, SupplierInvoice, Department, Project} from '../../../../../unientities';
import {VatTypeService, AccountService, JournalEntryService, DepartmentService, ProjectService} from '../../../../../services/services';

import {JournalEntryData} from '../../../../../models/models';
import {JournalEntryMode} from '../../journalentrymanual/journalentrymanual';

import {ToastService, ToastType} from '../../../../../../framework/uniToast/toastService';
import {JournalEntrySimpleForm} from './journalentrysimpleform';

@Component({
    selector: 'journal-entry-simple',
    templateUrl: 'app/components/accounting/journalentry/components/journalentrysimple/journalentrysimple.html'
})
export class JournalEntrySimple implements OnInit {
    @Input() public supplierInvoice: SupplierInvoice;
    @Input() public journalEntryID: number = 0;
    @Input() public runAsSubComponent: boolean = false;
    @Input() public mode: number = JournalEntryMode.Manual;
    @Input() public disabled: boolean = false;
    @Output() dataChanged: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() dataLoaded: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();

    @ViewChildren(JournalEntrySimpleForm) journalEntryForms: QueryList<JournalEntrySimpleForm>;

    public selectedJournalEntryLine: JournalEntryData;
    public journalEntryLines: Array<JournalEntryData>;
    public dropdownData: any;

    constructor(private journalEntryService: JournalEntryService,
        private departmentService: DepartmentService,
        private projectService: ProjectService,
        private vattypeService: VatTypeService,
        private accountService: AccountService,
        private router: Router,
        private toastService: ToastService) {
        this.journalEntryLines = new Array<JournalEntryData>();
    }

    public ngOnInit() {
        Observable.forkJoin(
            this.departmentService.GetAll(null),
            this.projectService.GetAll(null),
            this.vattypeService.GetAll(null),
            this.accountService.GetAll('filter=Visible eq true&orderby=AccountNumber', ['VatType'])
        ).subscribe(response => {
            this.dropdownData = response;
        });
    }

    public checkIfFormsHaveChanges() {
        let haveDirtyData: boolean = false;

        if (this.journalEntryForms) {
            this.journalEntryForms.forEach((form) => {
                if (form && form.isDirty){
                    haveDirtyData = true;
                }
            });
        }

        return haveDirtyData;
    }

    private getAccount(id: number): Account {
        if (this.dropdownData) {
            var dep = this.dropdownData[3].find((d) => d.ID === id);
            if (dep !== null) {
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

    private getDebitAccountText(line: JournalEntryData): string {
        return (line.DebitAccount ? line.DebitAccount.AccountNumber + ' - ' + line.DebitAccount.AccountName : '')
            + (line.DebitVatType ? ' - mva: ' + line.DebitVatType.VatCode + ': ' + line.DebitVatType.VatPercent + '%' : '');
    }

    private getCreditAccountText(line: JournalEntryData): string {
        return (line.CreditAccount ? line.CreditAccount.AccountNumber + ' - ' + line.CreditAccount.AccountName : '')
            + (line.CreditVatType ? ' - mva: ' + line.CreditVatType.VatCode + ': ' + line.CreditVatType.VatPercent + '%' : '');
    }

    private getDepartment(id: number): Department {
        if (!id || !this.dropdownData) { return null; }

        var dep = this.dropdownData[0].find((d) => d ? d.ID === id : false);
        return dep;
    }

    private getProject(id: number): Project {
        if (!id || !this.dropdownData) { return null; }

        var project = this.dropdownData[1].find((d) => d ? d.ID === id : false);
        return project;
    }

    private getDepartmentName(line: JournalEntryData): string {
        return line.Dimensions && line.Dimensions.Department ? line.Dimensions.Department.DepartmentNumber + ': ' + line.Dimensions.Department.Name : '';
    }

    private getProjectName(line: JournalEntryData): string {
        return line.Dimensions && line.Dimensions.Project ? line.Dimensions.Project.ProjectNumber + ': ' + line.Dimensions.Project.Name : '';
    }

    public postJournalEntryData(completeCallback) {
        this.journalEntryService.postJournalEntryData(this.journalEntryLines)
            .subscribe(
            data => {
                var firstJournalEntry = data[0];
                var lastJournalEntry = data[data.length - 1];

                // Validate if journalEntry number has changed
                // TODO: Should maybe test all numbers?
                var numbers = this.journalEntryService.findJournalNumbersFromLines(this.journalEntryLines);
                if (firstJournalEntry.JournalEntryNo !== numbers.firstNumber ||
                    lastJournalEntry.JournalEntryNo !== numbers.lastNumber) {
                    this.toastService.addToast('Lagring var vellykket, men merk at tildelt bilagsnummer er ' + firstJournalEntry.JournalEntryNo + ' - ' + lastJournalEntry.JournalEntryNo, ToastType.warn);

                } else {
                    this.toastService.addToast('Lagring var vellykket!', ToastType.good, 10);
                }

                completeCallback('Lagret og bokført');

                // Empty list
                this.journalEntryLines = new Array<JournalEntryData>();

                this.dataChanged.emit(this.journalEntryLines);
            },
            err => {
                completeCallback('Lagring feilet');
                this.toastService.addToast('Feil ved lagring!', ToastType.bad, null, JSON.stringify(err._body));
                console.log('error in postJournalEntryData: ', err);
            });
    }

    private findFirstJournalNumberFromLines(firstNumer: string = '') {
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

    private setSelectedJournalEntryLine(selectedLine: JournalEntryData) {
        if (!this.disabled) {
            this.selectedJournalEntryLine = selectedLine;
        }
    }

    private abortEdit() {
        this.selectedJournalEntryLine = null;
    }

    private deleteLine() {
        var currentRow = this.journalEntryLines.indexOf(this.selectedJournalEntryLine);
        this.journalEntryLines.splice(currentRow, 1);
        this.selectedJournalEntryLine = null;
        this.dataChanged.emit(this.journalEntryLines);
    }

    private parseJournalEntryData(updatedLine: JournalEntryData): JournalEntryData {
        updatedLine.DebitAccount = this.getAccount(updatedLine['DebitAccountID']);
        updatedLine.CreditAccount = this.getAccount(updatedLine['CreditAccountID']);
        updatedLine.DebitVatType = this.getVatType(updatedLine['DebitVatTypeID']);
        updatedLine.CreditVatType = this.getVatType(updatedLine['CreditVatTypeID']);
        updatedLine.DebitAccountNumber = null;
        updatedLine.CreditAccountNumber = null;

        updatedLine.Amount = Number(updatedLine.Amount.toString().replace(',', '.'));

        if (updatedLine.Dimensions) {
            updatedLine.Dimensions.Project = this.getProject(updatedLine.Dimensions.ProjectID);
            updatedLine.Dimensions.Department = this.getDepartment(updatedLine.Dimensions.DepartmentID);
        }

        if (updatedLine['FinancialDate'] && typeof updatedLine['FinancialDate'] == 'string') {
            updatedLine.FinancialDate = new Date(updatedLine['FinancialDate'].toString());
        }

        if (this.supplierInvoice) {
            updatedLine.JournalEntryID = this.supplierInvoice.JournalEntryID;
        }
        else if (this.journalEntryID > 0) {
            updatedLine.JournalEntryID = this.journalEntryID;
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

    private getFinancialDateString(line: JournalEntryData): string {
        try {
            return line.FinancialDate.toISOString() !== '0001-01-01T00:00:00.000Z' ? line.FinancialDate.toLocaleDateString() : '';
        } catch (e) {

        }

        return '';
    }
}
