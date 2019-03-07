import { Component, OnInit, Input } from '@angular/core';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { PayrollRunInAmeldingPeriod } from '@uni-entities';
import { AMeldingService } from '@app/services/services';

@Component({
  selector: 'uni-amelding-payrolls-period-view',
  templateUrl: './amelding-payrolls-period-view.component.html',
  styleUrls: ['./amelding-payrolls-period-view.component.sass']
})
export class AmeldingPayrollsPeriodViewComponent implements OnInit {
  @Input() public period: Number;
  public tableConfig: UniTableConfig;
  public tableData: PayrollRunInAmeldingPeriod[] = [];

  constructor(
    private ameldingService: AMeldingService
  ) {
    this.setupTable();
   }

  public ngOnInit() {
    this.ameldingService.getPayrollrunsInAmeldingPeriod(this.period.valueOf())
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
              console.log('generert tilleggsmelding');
            },
            disabled: (row: PayrollRunInAmeldingPeriod) => row.CanGenerateAddition
          }
        ]
      );
  }

}
