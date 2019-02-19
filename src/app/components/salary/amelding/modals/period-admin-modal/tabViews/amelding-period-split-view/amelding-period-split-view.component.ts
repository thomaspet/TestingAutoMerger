import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { CompanySalary, AmeldingData, AmeldingType } from '@uni-entities';
import { AMeldingService, ErrorService } from '@app/services/services';
import {BehaviorSubject, of, pipe, Observable} from 'rxjs';
import {take, tap, map, finalize, switchMap, catchError} from 'rxjs/operators';

@Component({
    selector: 'uni-amelding-period-split-view',
    templateUrl: './amelding-period-split-view.component.html',
    styleUrls: ['./amelding-period-split-view.component.sass']
})
export class AmeldingPeriodSplitViewComponent implements OnInit {
    @Input() public companySalary: CompanySalary;
    @Input() public ameldingerInPeriod: AmeldingData[];
    @Output() public changeEvent: EventEmitter<boolean> = new EventEmitter();
    public tableConfig: UniTableConfig;
    public selectedAmelding: AmeldingData;
    public loading: boolean;

    constructor(
        private ameldingService: AMeldingService,
        private errorService: ErrorService,
    ) { }

    public ngOnInit() {
        this.setupTable();
        this.selectDefaultAmelding(this.ameldingerInPeriod);
    }

    public onRowSelected(row) {
        this.loading = true;
        this.setSelectedAmelding(this.ameldingerInPeriod.find(a => a.ID === row.ID));
    }

    private setupTable() {
        const idCol = new UniTableColumn('ID', 'A-melding ID', UniTableColumnType.Number);
        const statusCol = new UniTableColumn('altinnstatus', 'Altinn status', UniTableColumnType.Text);
        const typeCol = new UniTableColumn('type', 'Type', UniTableColumnType.Number);
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
