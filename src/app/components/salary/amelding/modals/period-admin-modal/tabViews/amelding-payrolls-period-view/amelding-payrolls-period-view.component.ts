import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { PayrollRunInAmeldingPeriod, AmeldingType } from '@uni-entities';
import { AMeldingService, ErrorService } from '@app/services/services';
import { Observable, pipe, of } from 'rxjs';
import { tap, finalize, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'uni-amelding-payrolls-period-view',
  templateUrl: './amelding-payrolls-period-view.component.html',
  styleUrls: ['./amelding-payrolls-period-view.component.sass']
})
export class AmeldingPayrollsPeriodViewComponent implements OnInit {
  @Input() public period: number;
  @Input() public activeYear: number;
  @Output() public changeEvent: EventEmitter<boolean> = new EventEmitter();
  public tableConfig: UniTableConfig;
  public tableData: PayrollRunInAmeldingPeriod[] = [];
  public busy: boolean;

  constructor(
    private ameldingService: AMeldingService,
    private errorService: ErrorService
  ) {
    this.setupTable();
   }

  public ngOnInit() {
    this.getData();
  }

  private getData() {
    this.ameldingService.getPayrollrunsInAmeldingPeriod(this.period)
      .subscribe(payrunsInPeriod => {
        this.tableData = payrunsInPeriod;
      });
  }

  private setupTable() {
    const idCol = new UniTableColumn('PayrollrunID', 'Lønnsavregning', UniTableColumnType.Text)
      .setTemplate(rowmodel => {
        return `${rowmodel.PayrollrunID} - ${rowmodel.PayrollrunDescription}`;
      });
    const typeCol = new UniTableColumn('PayrollrunPaydate', 'Utbetalingsdato', UniTableColumnType.LocalDate);
    const sentCol = new UniTableColumn('AmeldingSentdate', 'Sendt a-melding', UniTableColumnType.LocalDate);
    this.tableConfig = new UniTableConfig('amelding.period.payrolls.data', false, false)
      .setColumns([idCol, typeCol, sentCol])
      .setSearchable(false)
      .setContextMenu(
        [
          {
            label: 'Generer tilleggsmelding',
            action: (row: PayrollRunInAmeldingPeriod) => {
              of(row)
                .pipe(
                  this.switchMapLoadAndClose(() =>
                    this.ameldingService.postAMelding(this.period, AmeldingType.Addition, this.activeYear, row.PayrollrunID))
                )
                .subscribe();
            },
            disabled: (row: PayrollRunInAmeldingPeriod) => !row.CanGenerateAddition
          }
        ]
      );
  }

  private switchMapLoadAndClose(method: () => Observable<any>) {
    return pipe(
        tap(() => this.busy = true),
        finalize(() => this.busy = false),
        switchMap(() => method()),
        catchError((err, obs) => this.errorService.handleRxCatch(err, obs)),
        tap(() => this.changeEvent.next())
    );
}

}
