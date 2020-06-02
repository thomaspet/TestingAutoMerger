import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { WageType, OtpExportWagetype } from '@uni-entities';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { IUniTableConfig, UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { WageTypeService, ErrorService } from '@app/services/services';
import { OtpExportWagetypesService } from '@app/components/salary/otpexport/shared/service/otpExportWagetypesService';
import { Observable, BehaviorSubject } from 'rxjs';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';

@Component({
  selector: 'uni-otp-period-wagetype-modal',
  templateUrl: './otp-period-wagetype-modal.component.html',
  styleUrls: ['./otp-period-wagetype-modal.component.sass']
})
export class OtpPeriodWagetypeModalComponent implements OnInit {
  @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;
  public wagetypes: WageType[] = [];
  public selectedWagetypes: OtpExportWagetype[] = [];
  public tableConfig: IUniTableConfig;

  public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public formOtpExportWagetypesConfig$: BehaviorSubject<any> = new BehaviorSubject({});
  public otpexportWagetypesModel: BehaviorSubject<any> = new BehaviorSubject({});

  constructor(
    private wagetypeService: WageTypeService,
    private otpexportwagetypesService: OtpExportWagetypesService,
    private errorService: ErrorService
  ) {
    this.setupFormConfig();
    this.setupTableConfig();
   }

  public ngOnInit() {
    this.getData();
  }

  public closeModal(runsave: boolean = true) {
    if (runsave) {
      this.selectedWagetypes.forEach(otpwt => {
        if (otpwt.ID > 0) {
          this.otpexportwagetypesService
            .Put(otpwt.ID, otpwt)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe(response => {});
        } else {
          this.otpexportwagetypesService
            .Post(otpwt)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe(response => {});
        }
      });
    }
    this.onClose.next(
      {
        runupdate: runsave
      }
    );
  }

  private getData() {
    Observable.forkJoin(
      this.wagetypeService.getOrderByWageTypeNumber(),
      this.otpexportwagetypesService.GetAll('orderby=WageTypeNumber')
    )
    .subscribe((response: [WageType[], OtpExportWagetype[]]) => {
      this.wagetypes = response[0];
      this.selectedWagetypes = response[1];
      this.selectedWagetypes.forEach(otpwt => {
        otpwt['_WageTypeName'] = this.getName(otpwt.WageTypeNumber);
      });
    });
  }

  private getName(wtNumber: number): string {
    return !!this.wagetypes.find(w => w.WageTypeNumber === wtNumber)
      ? this.wagetypes.find(w => w.WageTypeNumber === wtNumber).WageTypeName
      : '';
  }

  private findWagetypes(query: string): Observable<WageType[]> {
    return Observable
      .of(this.wagetypes.filter(w => w.WageTypeNumber.toString().toLowerCase().startsWith(query)
      || w.WageTypeName.toLowerCase().includes(query)));
  }

  private AddWagetype(wt: WageType) {
    if (this.selectedWagetypes.findIndex(f => f.ID === wt.ID) === -1) {
      const otpwagetype = new OtpExportWagetype();
      otpwagetype.WageTypeNumber = wt.WageTypeNumber;
      otpwagetype['_WageTypeName'] = this.getName(otpwagetype.WageTypeNumber);
      this.selectedWagetypes = [...this.selectedWagetypes, otpwagetype];
    }
  }

  private setupFormConfig() {
    const searchfield = new UniFieldLayout();
    searchfield.FieldType = FieldType.AUTOCOMPLETE;
    searchfield.Label = 'Legg til';
    searchfield.EntityType = 'otpexportWagetypesModel';
    searchfield.Property = 'wagetypeNumber';
    searchfield.Options = {
      template: (obj: WageType) => obj ? `${obj.WageTypeNumber} - ${obj.WageTypeName}` : '',
      getDefaultData: () => Observable.of(this.wagetypes),
      search: (query: string) => this.findWagetypes(query),
      displayProperty: 'WageTypeName',
      valueProperty: 'WageTypeNumber',
      events: {
        select: (model: any, value: any) => this.AddWagetype(value)
      }
    };

    this.fields$.next([searchfield]);
  }

  private setupTableConfig() {
    const wtnumberCol = new UniTableColumn('WageTypeNumber', 'Lønnsart', UniTableColumnType.Text);
    const wtnameCol = new UniTableColumn('_WageTypeName', 'Navn', UniTableColumnType.Text);

    this.tableConfig = new UniTableConfig('otpexport.wagetype.period.modal', false, false)
      .setColumns([wtnumberCol, wtnameCol])
      .setDeleteButton(true)
      .setMultiRowSelect(false);
  }
}
