import { Component, OnInit, Input } from '@angular/core';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { CompanySalary, AmeldingData } from '@uni-entities';
import { AMeldingService } from '@app/services/services';

@Component({
  selector: 'uni-amelding-period-split-view',
  templateUrl: './amelding-period-split-view.component.html',
  styleUrls: ['./amelding-period-split-view.component.sass']
})
export class AmeldingPeriodSplitViewComponent implements OnInit {
  @Input() public ameldingerInPeriod: AmeldingData[];
  @Input() public companySalary: CompanySalary;
  public tableConfig: UniTableConfig;
  public selectedAmelding: AmeldingData;
  public loading: boolean;

  constructor(
    private ameldingService: AMeldingService
  ) {
    this.setupTable();
   }

  public ngOnInit() {
    this.selectAmelding();
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
            action: (row) => {
              console.log('Nullstiller melding');
            }
          },
          {
            label: 'Erstatt melding',
            action: (row) => {
              console.log('Erstatt melding');
            }
          },
          {
            label: 'Send a-melding på nytt',
            action: (row) => {
              console.log('Send a-melding på nytt');
            }
          }
        ]
      );
  }

  private selectAmelding() {
    if (!this.ameldingerInPeriod.length) {
      return;
    }
    this.setSelectedAmelding(this.ameldingerInPeriod[0]);
  }

  private setSelectedAmelding(amelding: AmeldingData) {
    if (!amelding) {
      return;
    }

    // ensure we send feedback with ameldingen
    if (!amelding.hasOwnProperty('feedBack')) {
      this.ameldingService.getAMeldingWithFeedback(amelding.ID)
        .finally(() => this.loading = false)
        .subscribe((response: AmeldingData) => {
          this.selectedAmelding = response;
        });
    }
  }

}
