import { Component, OnInit, Input } from '@angular/core';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { PayrollRun } from '@uni-entities';
import { PayrollrunService } from '@app/services/services';

@Component({
  selector: 'uni-amelding-payrolls-period-view',
  templateUrl: './amelding-payrolls-period-view.component.html',
  styleUrls: ['./amelding-payrolls-period-view.component.sass']
})
export class AmeldingPayrollsPeriodViewComponent implements OnInit {
  @Input() public period: Number;
  public tableConfig: UniTableConfig;
  public tableData: PayrollRun[] = [];

  constructor(
    private payrollrunService: PayrollrunService
  ) {
    this.setupTable();
   }

  public ngOnInit() {
    this.payrollrunService.getAll(`filter=month(PayDate) eq ${this.period}`)
      .subscribe((payrolls: PayrollRun[]) => {
        this.tableData = payrolls;
      });
  }

  private setupTable() {
    const idCol = new UniTableColumn('ID', 'Lønnsavregning', UniTableColumnType.Number)
      .setTemplate(rowmodel => {
        return `${rowmodel.ID} - ${rowmodel.Description}`;
      });
    const typeCol = new UniTableColumn('PayDate', 'Utbetalingsdato', UniTableColumnType.LocalDate);
    const sentCol = new UniTableColumn('UpdatedAt', 'Sendt a-melding', UniTableColumnType.LocalDate);
    this.tableConfig = new UniTableConfig('amelding.period.payrolls.data', false, false)
      .setColumns([idCol, typeCol, sentCol])
      .setSearchable(false)
      .setContextMenu(
        [
          {
            label: 'Generer tilleggsmelding',
            action: (row) => {
              console.log('generert tilleggsmelding');
            }
          }
        ]
      );
  }

}
