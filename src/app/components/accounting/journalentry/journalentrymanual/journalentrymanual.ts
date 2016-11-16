import {Component, Input, SimpleChange, ViewChild, OnInit, OnChanges} from '@angular/core';
import {JournalEntrySimple} from '../components/journalentrysimple/journalentrysimple';
import {JournalEntryProfessional} from '../components/journalentryprofessional/journalentryprofessional';
import {SupplierInvoice} from '../../../../unientities';
import {JournalEntryData} from '../../../../models/models';
import {JournalEntrySimpleCalculationSummary} from '../../../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryService} from '../../../../services/services';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ISummaryConfig} from '../../../common/summary/summary';
import {NumberFormat} from '../../../../services/common/NumberFormatService';

export enum JournalEntryMode {
    Manual,
    Supplier,
    Payment,
    JournalEntryView
}

@Component({
    selector: 'journal-entry-manual',
    host: { '[class.runassubcomponent]': 'runAsSubComponent' },
    templateUrl: 'app/components/accounting/journalentry/journalentrymanual/journalentrymanual.html'
})
export class JournalEntryManual implements OnChanges, OnInit {
    @Input() public supplierInvoice: SupplierInvoice;
    @Input() public journalEntryID: number = 0;
    @Input() public runAsSubComponent: boolean = false;
    @Input() public mode: number;
    @Input() public disabled: boolean = false;

    @ViewChild(JournalEntrySimple) private journalEntrySimple: JournalEntrySimple;
    @ViewChild(JournalEntryProfessional) private journalEntryProfessional: JournalEntryProfessional;

    private journalEntryMode: string;

    private itemsSummaryData: JournalEntrySimpleCalculationSummary = new JournalEntrySimpleCalculationSummary();

    public validationResult: any;
    public summary: ISummaryConfig[] = [];

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre og bokfør',
            action: (completeEvent) => this.postJournalEntryData(completeEvent),
            main: true,
            disabled: false
        }
    ];

    constructor(private journalEntryService: JournalEntryService,
                private numberFormat: NumberFormat) {
    }

    public ngOnInit() {
        this.journalEntryMode = this.journalEntryService.getJournalEntryMode();

        if (this.supplierInvoice) {
            this.mode = JournalEntryMode.Supplier;

            this.journalEntryService.getJournalEntryDataBySupplierInvoiceID(this.supplierInvoice.ID)
                .subscribe(data => {
                    this.setJournalEntryData(data);
                });
        } else if (this.journalEntryID > 0) {
            this.mode = JournalEntryMode.JournalEntryView;

            this.journalEntryService.getJournalEntryDataByJournalEntryID(this.journalEntryID)
                .subscribe((data: Array<JournalEntryData>) => {
                    this.setJournalEntryData(data);
                });
        } else {
            let data = this.journalEntryService.getSessionData(this.mode);

            if (data && data.length > 0) {
                // if we have any unsaved data in our sessionStorage, show this data. This needs to happen after a setTimeout
                // to let Angular create the child components first
                setTimeout(() => {
                    this.setJournalEntryData(data);
                });
            }
        }

        this.setSums();
        this.setupSubscriptions();
    }

    public setJournalEntryMode(newMode: string) {
        let lines: Array<JournalEntryData>;

        // get existing data from the view that is visible now
        if (newMode === 'SIMPLE') {
            if (this.journalEntryProfessional) {
                lines = this.journalEntryProfessional.getTableData();
            }
        } else {
            if (this.journalEntrySimple) {
                lines = this.journalEntrySimple.journalEntryLines;
            }
        }

        // update localstorage with preference for what mode to use (simple/professional)
        this.journalEntryService.setJournalEntryMode(newMode);
        this.journalEntryMode = this.journalEntryService.getJournalEntryMode();

        // fix data to avoid problem with different formats/structures
        let data = JSON.parse(JSON.stringify(lines));
        data.forEach(line => {
            line.FinancialDate = new Date(line.FinancialDate);
        });

        // let angular setup the viewchild, it does not exist until a change cycle has been runAsSubComponent
        setTimeout(() => {
            if (newMode === 'SIMPLE') {
                if (this.journalEntrySimple) {
                    this.journalEntrySimple.journalEntryLines = data;
                }
            } else {
                if (this.journalEntryProfessional) {
                    this.journalEntryProfessional.journalEntryLines = data;
                }
            }
        });
    }

    public addJournalEntryData(data: JournalEntryData) {
        data.SameOrNew = '1';

        if (this.journalEntryProfessional) {
            this.journalEntryProfessional.addJournalEntryLine(data);
        } else if (this.journalEntrySimple) {

            this.journalEntrySimple.journalEntryLines.push(data);
            this.onDataChanged(this.journalEntrySimple.journalEntryLines);
        }
    }

    public getJournalEntryData(): Array<JournalEntryData> {
        if (this.journalEntrySimple) {
            return this.journalEntrySimple.journalEntryLines;
        } else if (this.journalEntryProfessional) {
            return this.journalEntryProfessional.getTableData();
        }
    }

    public setJournalEntryData(lines: Array<JournalEntryData>) {
        if (this.journalEntrySimple) {
            this.journalEntrySimple.journalEntryLines = lines;
        } else if (this.journalEntryProfessional) {
            this.journalEntryProfessional.journalEntryLines = lines;
        }
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        this.setupSubscriptions();
    }

    private setupSubscriptions() {
        setTimeout(() => {
            if (this.journalEntryProfessional) {
                this.journalEntryProfessional.dataChanged.debounceTime(300).subscribe((values) => this.onDataChanged(values));
            }

            if (this.journalEntrySimple) {
                this.journalEntrySimple.dataChanged.debounceTime(300).subscribe((values) => this.onDataChanged(values));
            }
        });
    }

    private onDataChanged(data: JournalEntryData[]) {
        if (data.length <= 0) {
            this.itemsSummaryData = null;
            this.journalEntryService.setSessionData(this.mode, null);
            return;
        }

        setTimeout(() => {
            data.forEach((x) => {
                x.Amount = x.Amount || 0;
            });

            // save journalentries to sessionStorage - this is done in case the user switches tabs while entering
            this.journalEntryService.setSessionData(this.mode, data);

            this.validateJournalEntryData(data);
            this.calculateItemSums(data);
        });
    }

    private onDataLoaded(data: JournalEntryData[]) {
        this.calculateItemSums(data);
    }

    private calculateItemSums(data: JournalEntryData[]) {
        this.itemsSummaryData = this.journalEntryService.calculateJournalEntrySummaryLocal(data);
        this.setSums();

        /*
        KE 08.11.2016: Switch to running the summaries locally.
        this.journalEntryService.calculateJournalEntrySummary(data)
            .subscribe((sumdata) => {
                this.itemsSummaryData = sumdata;
            },
            (err) => {
                console.log('Error when recalculating journal entry summary:', err);
            }
        );
        */
    }

    private validateJournalEntryData(data: JournalEntryData[]) {
        this.validationResult = this.journalEntryService.validateJournalEntryDataLocal(data);

        /*
        KE 08.11.2016: Switch to running the validations locally. The serverside validation is executed when posting anyway
        this.journalEntryService.validateJournalEntryData(data)
            .subscribe(
            result => {
                this.validationResult = result;
            },
            err => {
                console.log('error int validateJournalEntryData:', err);
            });
        */
    }

    private postJournalEntryData(completeCallback) {
        if (this.journalEntrySimple) {
            if (this.journalEntrySimple.journalEntryLines.length === 0) {
                alert('Du har ikke lagt til noen bilag enda, trykk Legg til når du har registrert opplysningene dine, og trykk Lagre og bokfør igjen');
                completeCallback('Lagring avbrutt');
            } else if (this.journalEntrySimple.checkIfFormsHaveChanges()) {
                alert('Du har gjort endringer uten å trykke Legg til / Oppdater - vennligst fullfør endringene før du trykker Lagre og bokfør igjen');
                completeCallback('Lagring avbrutt');
            } else {
                this.journalEntrySimple.postJournalEntryData(completeCallback);
            }
        } else if (this.journalEntryProfessional) {
            this.journalEntryProfessional.postJournalEntryData(completeCallback);
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

    private setSums() {
        this.summary = [{
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumDebet || 0) : null,
                title: 'Sum debet',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumCredit || 0) : null,
                title: 'Sum kreditt',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.Differance || 0) : null,
                title: 'Differanse',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.IncomingVat || 0) : null,
                title: 'Inng.mva',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.OutgoingVat || 0) : null,
                title: 'Utg.mva',
            }];
    }
}