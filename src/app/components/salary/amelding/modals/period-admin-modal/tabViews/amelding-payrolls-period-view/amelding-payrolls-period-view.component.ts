import { Component, OnInit, Input } from '@angular/core';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { PayrollRunInAmeldingPeriod, AmeldingType } from '@uni-entities';
import { AMeldingService } from '@app/services/services';

@Component({
  selector: 'uni-amelding-payrolls-period-view',
  templateUrl: './amelding-payrolls-period-view.component.html',
  styleUrls: ['./amelding-payrolls-period-view.component.sass']
})
export class AmeldingPayrollsPeriodViewComponent implements OnInit {
  @Input() public period: number;
  @Input() public activeYear: number;
  public tableConfig: UniTableConfig;
  public tableData: PayrollRunInAmeldingPeriod[] = [];
  public busy: boolean;

  constructor(
    private ameldingService: AMeldingService
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
    const idCol = new UniTableColumn('PayrollrunID', 'Lønnsavregning', UniTableColumnType.Number)
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
            action: (row) => {
              this.busy = true;
              this.ameldingService.postAMelding(this.period, AmeldingType.Addition, this.activeYear, row.PayrollrunID)
                .finally(() => this.busy = false)
                .subscribe((response) => {
                  this.getData();
                });
            },
            disabled: (row: PayrollRunInAmeldingPeriod) => !row.CanGenerateAddition
          }
        ]
      );
  }

}
