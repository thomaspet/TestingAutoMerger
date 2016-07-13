import {Component, Input, SimpleChange, ViewChild, OnInit, OnChanges} from '@angular/core';
import {JournalEntrySimple} from '../components/journalentrysimple/journalentrysimple';
import {JournalEntryProfessional} from '../components/journalentryprofessional/journalentryprofessional';
import {SupplierInvoice} from '../../../../unientities';
import {JournalEntryData} from '../../../../models/models';
import {JournalEntrySimpleCalculationSummary} from '../../../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryService} from '../../../../services/services';
import {JournalEntryMode} from '../components/journalentrysimple/journalentrysimpleform';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';

@Component({
    selector: 'journal-entry-manual',
    host: {'[class.runassubcomponent]': 'runAsSubComponent'},
    templateUrl: 'app/components/accounting/journalentry/journalentrymanual/journalentrymanual.html',
    directives: [JournalEntrySimple, JournalEntryProfessional, UniSave],
    providers: [JournalEntryService]    
})
export class JournalEntryManual implements OnChanges, OnInit {    
    @Input() public supplierInvoice: SupplierInvoice;
    @Input() public runAsSubComponent: boolean = false;
    @Input() public mode: number = JournalEntryMode.Manual;
    @Input() public journalEntryMode: string;
    @Input() public disabled: boolean = false;
    @ViewChild(JournalEntrySimple) private journalEntrySimple: JournalEntrySimple;
    @ViewChild(JournalEntryProfessional) private journalEntryProfessional: JournalEntryProfessional;
    
    private itemsSummaryData: JournalEntrySimpleCalculationSummary;
    public validationResult: any;
    
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre og bokfør',
            action: (completeEvent) => this.postJournalEntryData(completeEvent),
            main: true,
            disabled: false
        }
    ];
    
    constructor(private journalEntryService: JournalEntryService) {
    }
    
    public ngOnInit() {
        this.journalEntryMode = 'SIMPLE';
        
        if (this.supplierInvoice) {
            this.mode = JournalEntryMode.Supplier;
        }
        
        this.setupSubscriptions();
    }
    
    public getJournalEntryData(): Array<JournalEntryData> {
        if (this.journalEntrySimple) {
            return this.journalEntrySimple.journalEntryLines;
        }   
    }

    public setJournalEntryData(lines: Array<JournalEntryData>) {
        if (this.journalEntrySimple) {
            this.journalEntrySimple.journalEntryLines = lines;
        }
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        this.setupSubscriptions();
    }
    
    private setupSubscriptions() {
        setTimeout(() => {
            if (this.journalEntryProfessional) {
                this.journalEntryProfessional.dataChanged.debounceTime(2000).subscribe((values) => this.onDataChanged(values));
            }
            
            if (this.journalEntrySimple) {
                this.journalEntrySimple.dataChanged.debounceTime(2000).subscribe((values) => this.onDataChanged(values));
            }  
        });
    }
    
    private onDataChanged(data: JournalEntryData[]) {
        if (data.length <= 0) {
            this.itemsSummaryData = null;
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
            },
            err => {
                console.log('error int validateJournalEntryData:', err);
            });
    }
    
    private postJournalEntryData(completeCallback) {
        if (this.journalEntrySimple) {
            this.journalEntrySimple.postJournalEntryData(completeCallback);
        } else if (this.journalEntryProfessional) {
            this.journalEntryProfessional.postJournalEntryData(completeCallback);
        }
    }
    
    private addDummyJournalEntry(event) {
        if (this.journalEntrySimple) {
            this.journalEntrySimple.addDummyJournalEntry();
        } else if (this.journalEntryProfessional) {
            this.journalEntryProfessional.addDummyJournalEntry();
        }
    }
    
    private removeJournalEntryData(event) {
        if (this.journalEntrySimple) {
            this.journalEntrySimple.removeJournalEntryData();
        } else if (this.journalEntryProfessional) {
            this.journalEntryProfessional.removeJournalEntryData();
        }
    }
    
    private useSimpleMode() {
        this.journalEntryMode = 'SIMPLE';
        this.setupSubscriptions();
    }
    
    private useProMode() {
        this.journalEntryMode = 'PROFFESIONAL';
        this.setupSubscriptions();
    }
}