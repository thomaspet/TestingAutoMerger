import {Component, Input, SimpleChange, ViewChild} from "@angular/core";
import {JournalEntrySimple} from '../components/journalentrysimple/journalentrysimple';
import {JournalEntryProfessional} from '../components/journalentryprofessional/journalentryprofessional';
import {SupplierInvoice} from "../../../../unientities";
import {JournalEntryData} from '../../../../models/models';
import {JournalEntrySimpleCalculationSummary} from '../../../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryService} from '../../../../services/services';

@Component({
    selector: "journal-entry-manual",
    templateUrl: "app/components/accounting/journalentry/journalentrymanual/journalentrymanual.html",
    directives: [JournalEntrySimple, JournalEntryProfessional],
    providers: [JournalEntryService]    
})
export class JournalEntryManual {    
    @Input()
    SupplierInvoice : SupplierInvoice;

    @Input()
    showHeader = true;
    
    @ViewChild(JournalEntrySimple) journalEntrySimple: JournalEntrySimple;
    @ViewChild(JournalEntryProfessional) journalEntryProfessional: JournalEntryProfessional;
    
    public journalEntryMode: string;
    private itemsSummaryData: JournalEntrySimpleCalculationSummary;
    public validationResult: any;
    
    constructor(private journalEntryService: JournalEntryService) {
    }
    
    ngOnInit() {
        //this.journalEntryMode = "SIMPLE";
        this.journalEntryMode = 'PROFFESIONAL';
        
        if (this.SupplierInvoice !== null) {
            
        }
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        
    }
    
    ngAfterViewInit() {
        if (this.journalEntrySimple) {
            this.journalEntrySimple.dataChanged.debounceTime(2000).subscribe((values) => this.onDataChanged(values));
        }
        if (this.journalEntryProfessional) {
            this.journalEntryProfessional.dataChanged.debounceTime(2000).subscribe((values) => this.onDataChanged(values))
        }
    }
    
    private onDataChanged(data: JournalEntryData[]) {
        //this.busy = true;
                
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
    
    useSimpleMode() {
        this.journalEntryMode = 'SIMPLE';
    }
    
    useProMode() {
        this.journalEntryMode = 'PROFFESIONAL';
        
    }
}