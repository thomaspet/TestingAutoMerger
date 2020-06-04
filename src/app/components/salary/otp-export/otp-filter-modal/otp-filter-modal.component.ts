import { Component, OnInit, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { IUniModal } from '@uni-framework/uni-modal';
import { PayrollRun } from '@uni-entities';
import { PayrollrunService, ErrorService, FinancialYearService } from '../../../../services/services';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable/index';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { BehaviorSubject, Observable } from 'rxjs';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';

@Component({
  selector: 'uni-otp-filter-modal',
  templateUrl: './otp-filter-modal.component.html',
  styleUrls: ['./otp-filter-modal.component.sass']
})
export class OTPFilterModalComponent implements OnInit, IUniModal {
  @ViewChild(AgGridWrapper) private table: AgGridWrapper;
  @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
  private payrolls: PayrollRun[];
  public selectedPayrolls: PayrollRun[];
  public busy: boolean = false;
  public currentYear: number;
  public selectedOTPPeriod: number;

  public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public formFilterConfig$: BehaviorSubject<any> = new BehaviorSubject({});
  public otpexportFilterModel$: BehaviorSubject<any> = new BehaviorSubject({});

  public otpFilterTableConfig: UniTableConfig;

  private  periods(): Array<any> {
    return [
      {period: 1, name: 'Januar'},
      {period: 2, name: 'Februar'},
      {period: 3, name: 'Mars'},
      {period: 4, name: 'April'},
      {period: 5, name: 'Mai'},
      {period: 6, name: 'Juni'},
      {period: 7, name: 'Juli'},
      {period: 8, name: 'August'},
      {period: 9, name: 'September'},
      {period: 10, name: 'Oktober'},
      {period: 11, name: 'November'},
      {period: 12, name: 'Desember'}
    ];
  }

  constructor(
    private payrollrunService: PayrollrunService,
    private financialYearService: FinancialYearService,
    private errorService: ErrorService
  ) {
    this.setupFormConfig();
    this.setupTableConfig();
  }

  public ngOnInit() {
    Observable.of(this.financialYearService.getActiveYear())
      .subscribe(activeYear => {
        this.currentYear = activeYear;
        this.getData();
      });
    this.selectedPayrolls = [];
  }

  public closeModal(update: boolean = true) {
    if (update) {
      this.selectedPayrolls = this.table.getSelectedRows();
    }
    this.onClose.next(
      {
        otpPeriod: update ? this.otpexportFilterModel$.getValue().otpPeriode : null,
        otpYear: this.otpexportFilterModel$.getValue().otpYear,
        payrolls: this.selectedPayrolls
      });
  }

  public change(value: SimpleChanges) {
    if (value['otpPeriode']) {
      this.selectedOTPPeriod = value['otpPeriode'].currentValue;
      this.otpexportFilterModel$
        .take(1)
        .subscribe( filterModel => {
          filterModel['otpPeriode'] = value['otpPeriode'].currentValue;
          this.otpexportFilterModel$.next(filterModel);
        });
    }
  }

  public onRowSelectionChange(event) {
    this.selectedPayrolls = this.table.getSelectedRows();
  }

  private setupFormConfig() {
    const periodField = new UniFieldLayout();
    periodField.FieldType = FieldType.DROPDOWN;
    periodField.Label = 'OTP-periode';
    periodField.EntityType = 'otpExportModel';
    periodField.Property = 'otpPeriode';
    periodField.Tooltip = {
      Text: 'Her velges hvilken periode det skal rapporteres for'
    },
    periodField.Options = {
      source: this.periods(),
      displayProperty: 'name',
      valueProperty: 'period'
    };

    const yearField = new UniFieldLayout();
    yearField.FieldType = FieldType.TEXT;
    yearField.Label = 'År';
    yearField.EntityType = 'otpExportModel';
    yearField.Property = 'otpYear';
    yearField.ReadOnly = true;

    this.fields$.next([periodField, yearField]);
  }

  private setupTableConfig() {
    const payrollCol = new UniTableColumn('ID', 'Lønnsavregning', UniTableColumnType.Text)
    .setTemplate((row: PayrollRun) => {
      return `${row.ID} - ${row.Description}`;
    });
    const paydateCol = new UniTableColumn('PayDate', 'Utbetalingsdato', UniTableColumnType.DateTime);
    this.otpFilterTableConfig = new UniTableConfig('salary.otpexport.otpexportfilter.payrollruns', false, true)
      .setColumns([payrollCol, paydateCol])
      .setMultiRowSelect(true);
  }

  private getData() {
    this.busy = true;
    const filter: string = `filter=year(PayDate) eq ${this.currentYear}`;
    this.payrollrunService
      .getAll(`${filter} &orderby=ID desc`)
      .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
      .finally(() => this.busy = false)
      .subscribe((payrolls: PayrollRun[]) => {
        this.otpexportFilterModel$
          .take(1)
          .subscribe(filterModel => {
            filterModel['otpYear'] = this.currentYear;
            this.otpexportFilterModel$.next(filterModel);
          });
        this.payrolls = payrolls;
      });
  }

}
