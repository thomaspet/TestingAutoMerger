import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { CompanySalary, AmeldingData, AmeldingType, InternalAmeldingStatus } from '@uni-entities';
import { AMeldingService, ErrorService } from '@app/services/services';
import { of, pipe, Observable} from 'rxjs';
import {tap, finalize, switchMap, catchError} from 'rxjs/operators';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'uni-amelding-period-split-view',
    templateUrl: './amelding-period-split-view.component.html',
    styleUrls: ['./amelding-period-split-view.component.sass']
})
export class AmeldingPeriodSplitViewComponent implements OnInit, AfterViewInit {
    @Input() public companySalary: CompanySalary;
    @Input() public ameldingerInPeriod: AmeldingData[];
    @Output() public changeEvent: EventEmitter<boolean> = new EventEmitter();
    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;
    public tableConfig: UniTableConfig;
    public selectedAmelding: AmeldingData;
    public loading: boolean;
    public showFeedback: boolean = false;

    private statusType(): Array<any> {
        return [
            {id: AmeldingType.Standard, name: 'Standard'},
            {id: AmeldingType.Employments, name: 'Arbeidsforhold'},
            {id: AmeldingType.Nullstilling, name: 'Nullstill'},
            {id: AmeldingType.Addition, name: 'Tillegg'},
        ];
    }

    constructor(
        private ameldingService: AMeldingService,
        private errorService: ErrorService,
    ) { }


    public ngOnInit() {
        this.setupTable();
        this.selectDefaultAmelding();
    }

    public ngAfterViewInit() {
        this.table.focusRow(this.ameldingerInPeriod.length - 1);
    }

    public onRowSelected(row) {
        this.showFeedback = row['_showFeedback'];
        this.loading = true;
        const selectedindex = this.ameldingerInPeriod.findIndex(a => a.ID === row.ID);
        this.table.focusRow(selectedindex);
        this.setSelectedAmelding(this.ameldingerInPeriod[selectedindex]);
    }

    private setupTable() {
        const idCol = new UniTableColumn('ID', 'A-melding ID', UniTableColumnType.Text);
        const statusCol = new UniTableColumn('altinnStatus', 'Altinn status', UniTableColumnType.Text);
        const typeCol = new UniTableColumn('type', 'Type', UniTableColumnType.Text)
            .setTemplate(rowModel => {
                return this.statusType().find(p => p.id === rowModel.type).name;
            });
        const sentCol = new UniTableColumn('sent', 'Dato sendt', UniTableColumnType.LocalDate);
        const receiptCol = new UniTableColumn('', 'Tilbakemelding', UniTableColumnType.Link)
            .setTemplate(() => 'Vis/skjul')
            .setLinkClick(row => {
                row['_showFeedback'] = !row['_showFeedback'];
                this.onRowSelected(row);
            });

        this.tableConfig = new UniTableConfig('amelding.period.ameldinger.data', false, false)
            .setColumns([idCol, statusCol, typeCol, sentCol, receiptCol])
            .setSearchable(false)
            .setContextMenu(
            [
                {
                    label: 'Nullstill melding',
                    action: (row: AmeldingData) =>
                        of(row)
                            .pipe(
                                this.switchMapLoadAndClose(() =>
                                    this.ameldingService
                                        .postAMelding(row.period, AmeldingType.Nullstilling, row.year, null, row.ID)),
                            )
                            .subscribe(),
                    disabled: (row: AmeldingData) => row.type === AmeldingType.Nullstilling
                        || row.altinnStatus === 'erstattet'
                        || row.altinnStatus === 'avvist'
                },
                {
                    label: 'Erstatt melding',
                    action: (row: AmeldingData) =>
                        of(row)
                            .pipe(
                                this.switchMapLoadAndClose(() => this.ameldingService.postAMelding(row.period, row.type, row.year)),
                            )
                            .subscribe(),
                    disabled: (row: AmeldingData) => row.altinnStatus === 'erstattet'
                        || row.type === AmeldingType.Addition
                        || row.altinnStatus === 'avvist'
                },
                {
                    label: 'Send a-melding på nytt',
                    action: (row: AmeldingData) =>
                        of(row)
                            .pipe(
                                this.switchMapLoadAndClose(() => this.ameldingService.sendAMelding(row.ID))
                            )
                            .subscribe(),
                    disabled: (row: AmeldingData) => (row.receiptID && !!row.feedbackFileID)
                        || row.altinnStatus === 'erstattet'
                }
            ]);
    }

    private switchMapLoadAndClose(method: () => Observable<any>) {
        return pipe(
            tap(() => this.loading = true),
            finalize(() => this.loading = false),
            switchMap(() => method()),
            catchError((err, obs) => this.errorService.handleRxCatch(err, obs)),
            tap(() => this.changeEvent.next())
        );
    }

    private selectDefaultAmelding() {
        if (!this.ameldingerInPeriod.length) {
            return;
        }
        this.setSelectedAmelding(this.ameldingerInPeriod[this.ameldingerInPeriod.length - 1]);
    }

    private setSelectedAmelding(amelding: AmeldingData) {
        if (!amelding) {
            return;
        }

        // ensure we send feedback with ameldingen
        if (!amelding.hasOwnProperty('feedBack')) {
            this.ameldingService
                .getAMeldingWithFeedback(amelding.ID)
                .finally(() => this.loading = false)
                .subscribe((response: AmeldingData) => {
                    this.selectedAmelding = response;
                });
        }
    }
}
