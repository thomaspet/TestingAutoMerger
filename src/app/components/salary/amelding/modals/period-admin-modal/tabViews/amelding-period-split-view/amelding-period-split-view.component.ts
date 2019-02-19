import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { CompanySalary, AmeldingData, AmeldingType } from '@uni-entities';
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
    @ViewChild(AgGridWrapper) private table: AgGridWrapper;
    public tableConfig: UniTableConfig;
    public selectedAmelding: AmeldingData;
    public loading: boolean;

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
    }

    public ngAfterViewInit() {
        this.selectDefaultAmelding(this.ameldingerInPeriod);
    }

    public onRowSelected(row) {
        this.loading = true;
        const selectedindex = this.ameldingerInPeriod.findIndex(a => a.ID === row.ID);
        this.table.focusRow(selectedindex);
        this.setSelectedAmelding(this.ameldingerInPeriod[selectedindex]);
    }

  private setupTable() {
    const idCol = new UniTableColumn('ID', 'A-melding ID', UniTableColumnType.Number);
    const statusCol = new UniTableColumn('altinnstatus', 'Altinn status', UniTableColumnType.Text);
    const typeCol = new UniTableColumn('type', 'Type', UniTableColumnType.Text)
    .setTemplate(rowModel => {
      return this.statusType().find(p => p.id === rowModel.type).name;
    });
    const sentCol = new UniTableColumn('sent', 'Dato sendt', UniTableColumnType.LocalDate);
    const receiptCol = new UniTableColumn('', '', UniTableColumnType.Link);

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
                                        .postAMelding(row.period, AmeldingType.Nullstilling, row.year)),
                            )
                            .subscribe(),
                    disabled: (row: AmeldingData) => this.ameldingerInPeriod.some(a => a.replacesID === row.ID)
                },
                {
                    label: 'Erstatt melding',
                    action: (row: AmeldingData) =>
                        of(row)
                            .pipe(
                                this.switchMapLoadAndClose(() => this.ameldingService.postAMelding(row.period, row.type, row.year)),
                            )
                            .subscribe(),
                    disabled: (row: AmeldingData) => this.ameldingerInPeriod.some(a => a.replacesID === row.ID)
                },
                {
                    label: 'Send a-melding på nytt',
                    action: (row: AmeldingData) => console.log('resend a-melding')
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

    private selectDefaultAmelding(ameldingerInPeriod: AmeldingData[]) {
        if (!ameldingerInPeriod.length) {
            return;
        }
        this.table.focusRow(0);
        this.setSelectedAmelding(ameldingerInPeriod[0]);
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
