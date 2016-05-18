import {Component, Input, SimpleChange, ViewChild} from '@angular/core';
import {JournalEntrySimple} from '../components/journalentrysimple/journalentrysimple';
import {JournalEntryProfessional} from '../components/journalentryprofessional/journalentryprofessional';
import {SupplierInvoice} from '../../../../unientities';
import {JournalEntryData} from '../../../../models/models';
import {JournalEntrySimpleCalculationSummary} from '../../../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryService} from '../../../../services/services';

@Component({
    selector: 'journal-entry-manual',
    templateUrl: 'app/components/accounting/journalentry/journalentrymanual/journalentrymanual.html',
    directives: [JournalEntrySimple, JournalEntryProfessional],
    providers: [JournalEntryService]    
})
export class JournalEntryManual {    
    @Input()
    supplierInvoice : SupplierInvoice;
    @Input() runAsSubComponent : boolean = false;
    @Input()
    hideSameOrNew : boolean = false;
    @ViewChild(JournalEntrySimple) private journalEntrySimple: JournalEntrySimple;
    @ViewChild(JournalEntryProfessional) journalEntryProfessional: JournalEntryProfessional;
    @Input() public journalEntryMode: string;
    private itemsSummaryData: JournalEntrySimpleCalculationSummary;
    public validationResult: any;
    
    constructor(private journalEntryService: JournalEntryService) {
  
    }
    
    ngOnInit() {
        this.journalEntryMode = "SIMPLE";
        
        if (this.supplierInvoice) {
            this.hideSameOrNew = true;
        }
        
        this.setupSubscriptions();
    }
    
    getJournalEntryData(): Array<JournalEntryData> {
        if (this.journalEntrySimple) {
            return this.journalEntrySimple.journalEntryLines;
        }   
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        this.setupSubscriptions();
    }
    
    ngAfterViewInit() {
        
    }
    
    setupSubscriptions() {
        setTimeout(() => {
            console.log('setupSubscriptions');
            if (this.journalEntryProfessional)
                this.journalEntryProfessional.dataChanged.debounceTime(2000).subscribe((values) => this.onDataChanged(values));
            
            if (this.journalEntrySimple)
                this.journalEntrySimple.dataChanged.debounceTime(2000).subscribe((values) => this.onDataChanged(values));  
        });
    }
    
    
    
    private onDataChanged(data: JournalEntryData[]) {
        //this.busy = true;
        console.log('ondatachanged data: ', data);        
        if (data.length <= 0) {
            this.itemsSummaryData = null;
            console.log('itemsSummaryData is set to null since no lines exist');
            return;
        }

        setTimeout(() => {
            data.forEach((x) => {
                x.Amount = x.Amount || 0;
            });

            this.validateJournalEntryData(data);
            this.calculateItemSums(data);            
        });
    }
    
    private onDataLoaded(data: JournalEntryData[]) {
        this.calculateItemSums(data);
    }
    
    private calculateItemSums(data: JournalEntryData[]) {
        this.journalEntryService.calculateJournalEntrySummary(data)
                .subscribe((data) => {
                    this.itemsSummaryData = data;
                    //this.busy = false;
                },
                (err) => {
                    console.log('Error when recalculating journal entry summary:', err);
                    
                }
            );
    }
    
    private validateJournalEntryData(data: JournalEntryData[]) {
        this.journalEntryService.validateJournalEntryData(data)
            .subscribe(
            result => {
                this.validationResult = result;
                //console.log('valideringsresultat:', result);
            },
            err => {
                console.log('error int validateJournalEntryData:', err);
            });
    }
    
    private postJournalEntryData(event) {
        if (this.journalEntrySimple)
            this.journalEntrySimple.postJournalEntryData();
        else if (this.journalEntryProfessional)
            this.journalEntryProfessional.postJournalEntryData();
    }
    
    private addDummyJournalEntry(event) {
        if (this.journalEntrySimple)
            this.journalEntrySimple.addDummyJournalEntry();
        else if (this.journalEntryProfessional)
            this.journalEntryProfessional.addDummyJournalEntry();
    }
    
    private removeJournalEntryData(event) {
        if (this.journalEntrySimple)
            this.journalEntrySimple.removeJournalEntryData();
        else if (this.journalEntryProfessional)
            this.journalEntryProfessional.removeJournalEntryData();
    }
    
    useSimpleMode() {
        this.journalEntryMode = 'SIMPLE';
        this.setupSubscriptions();
    }
    
    useProMode() {
        this.journalEntryMode = 'PROFFESIONAL';
        this.setupSubscriptions();
    }
}