import { Component, OnInit, SimpleChanges } from '@angular/core';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { UniTableConfig, UniTableColumn, UniTableColumnType, IContextMenuItem } from '@uni-framework/ui/unitable/index';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { IUniSaveAction } from '@uni-framework/save/save';
import { Observable, BehaviorSubject } from 'rxjs';
import { UniFieldLayout } from '@uni-framework/ui/uniform';
import { FieldType } from '@uni-framework/ui/uniform/index';
import { OTPFilterModalComponent } from './otp-filter-modal/otp-filter-modal.component';
import { UniModalService } from '@uni-framework/uni-modal';
import { ErrorService, CompanySalaryService, PayrollrunService } from '@app/services/services';
import { CompanySalary, TypeOfPaymentOtp } from '@uni-entities';
import { Router } from '@angular/router';
import { OTPPeriodWagetypeModalComponent } from './otp-period-wagetype-modal/otp-period-wagetype-modal.component';
import { IUniInfoConfig } from '@uni-framework/uniInfo/uniInfo';

@Component({
  selector: 'uni-otpexport',
  templateUrl: './otp-export.component.html',
  styleUrls: ['./otp-export.component.sass']
})
export class OTPExportComponent implements OnInit {

  public toolbarConfig: IToolbarConfig = {
    title: 'OTP-eksport'
  };

  public infoConfig: IUniInfoConfig = {
    headline: ''
  };

  public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
  public otpexportModel$: BehaviorSubject<any> = new BehaviorSubject({runs: [], month: '', year: ''});
  public saveActions: IUniSaveAction[];
  public otpTableConfig: UniTableConfig;
  public otpData: any[] = [];
  public contextMenuItems: IContextMenuItem[] = [];
  private companySalarySettings: CompanySalary;
  public showOTPNotActive: boolean = true;
  private runs: string;
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

  private statuses(): Array<any> {
    return [
      {short: 'A', full: 'Aktiv'},
      {short: 'S', full: 'Syk'},
      {short: 'P', full: 'Permittert'},
      {short: 'LP', full: 'Lovfestet Permisjon'},
      {short: 'AP', full: 'Avtalt Permisjon'}
    ];
  }

  private typeOfOtpPayments(): Array<any> {
    return [
        {id: TypeOfPaymentOtp.FixedSalary, name: 'Fast'},
        {id: TypeOfPaymentOtp.HourlyPay, name: 'Time'},
        {id: TypeOfPaymentOtp.PaidOnCommission, name: 'Provisjon'},
    ];
}

  constructor(
    private tabService: TabService,
    private modalService: UniModalService,
    private errorService: ErrorService,
    private companySalaryService: CompanySalaryService,
    private payrollrunService: PayrollrunService,
    private router: Router,
  ) {
    tabService.addTab({
      name: 'OTP-eksport',
      url: '/salary/otpexport',
      moduleID: UniModules.OTPExport,
      active: true
    });

    this.companySalaryService.getCompanySalary()
      .subscribe((compSalary: CompanySalary) => {
        this.companySalarySettings = compSalary;
        if (this.companySalarySettings.OtpExportActive) {
          this.showOTPNotActive = false;
          this.openPeriodModal();
          this.setupFormConfig();
          this.setupTableConfig();
        }
      });

    this.contextMenuItems = [
      {
        label: 'Lønnsarter periodelønn',
        action: () => this.openAmeldingPeriodWagetypeModal()
      }
    ];
  }

  public ngOnInit() {
  }

  public change(value: SimpleChanges) {

  }

  public gotoSettings(event) {
    event.stopPropagation();
    this.router.navigateByUrl('/settings/aga-and-subentities');
  }

  public openPeriodModal() {
    this.modalService
      .open(OTPFilterModalComponent)
      .onClose
      .subscribe(filterModel => {
        if (filterModel && !!filterModel.otpPeriod) {
          this.otpexportModel$
            .take(1)
            .subscribe(otpModel => {
              this.runs = !filterModel.payrolls || !filterModel.payrolls.length ? ''
              : filterModel.payrolls.map(p => p.ID).join(',');
              otpModel['runs'] = !filterModel.payrolls || !filterModel.payrolls.length ? ''
              : filterModel.payrolls.map(p => `${p.ID} - ${p.Description}`).join(','),
              otpModel['month'] = filterModel.otpPeriod;
              otpModel['year'] = filterModel.otpYear;
              this.otpexportModel$.next(otpModel);
            });
          this.getData();
        }
      });
  }

  public openAmeldingPeriodWagetypeModal() {
    this.modalService
      .open(OTPPeriodWagetypeModalComponent)
      .onClose
      .subscribe(modalresponse => {
        if (this.runs && modalresponse && modalresponse.runupdate) {
          this.getData();
        }
      });
  }

  private getData() {
    this.payrollrunService
      .getOTPExportData(
        this.runs,
        this.otpexportModel$.getValue().month,
        this.otpexportModel$.getValue().year,
        false
      )
      .subscribe((data: any) => {
        if (data.hasOwnProperty('Bedrift')) {
          const bedrift = data.Bedrift[0];
          if (bedrift !== null && bedrift.hasOwnProperty('Person')) {
            const person = bedrift.Person;
            if (person && person instanceof Array) {
              person.forEach(pers => {
                pers['_Fulltnavn'] = `${pers['Fornavn']} ${pers['Etternavn']}`;
              });
              this.otpData = person;
            }
          }
        }
        this.saveActions = this.getSaveActions();
      });
  }

  private setupFormConfig() {
    const periodField = new UniFieldLayout();
    periodField.FieldType = FieldType.DROPDOWN;
    periodField.Label = 'OTP-periode';
    periodField.EntityType = 'otpExportModel';
    periodField.Property = 'month';
    periodField.ReadOnly = true;
    periodField.Options = {
      source: this.periods(),
      displayProperty: 'name',
      valueProperty: 'period'
    };

    const payrollsField = new UniFieldLayout();
    payrollsField.FieldType = FieldType.STATIC_TEXT;
    payrollsField.Label = 'Inkluderer lønnsavregning: ';
    payrollsField.EntityType = 'otpExportModel';
    payrollsField.Property = 'runs';

    const buttonField = new UniFieldLayout();
    buttonField.FieldType = FieldType.BUTTON;
    buttonField.Label = 'Endre utvalg i perioden';
    buttonField.EntityType = 'otpExportModel';
    buttonField.Property = 'otpExportBtn';
    buttonField.Options = {
        click: (event) => {
            this.openPeriodModal();
        }
    };

    this.fields$.next([periodField, payrollsField, buttonField]);
  }

  private setupTableConfig() {
    const numberCol = new UniTableColumn('Ansattnummer', 'Ansattnr', UniTableColumnType.Number);
    const nameCol = new UniTableColumn('_Fulltnavn', 'Navn', UniTableColumnType.Text);
    const birthCol = new UniTableColumn('Fodselsnummer', 'Fødselsnummer', UniTableColumnType.Text);
    const addressCol = new UniTableColumn('Adresselinje1', 'Adresse', UniTableColumnType.Text);
    const address2Col = new UniTableColumn('Adresselinje2', 'Adresselinje2', UniTableColumnType.Text).setVisible(false);
    const address3Col = new UniTableColumn('Adresselinje3', 'Adresselinje3', UniTableColumnType.Text).setVisible(false);
    const postalCodeCol = new UniTableColumn('Postnummer', 'Postnummer', UniTableColumnType.Text);
    const cityCol = new UniTableColumn('Poststed', 'Poststed', UniTableColumnType.Text);
    const startdateCol = new UniTableColumn('Ansattdato', 'Ansattdato', UniTableColumnType.DateTime);
    const enddateCol = new UniTableColumn('Sluttdato', 'Sluttdato', UniTableColumnType.DateTime);
    const paymentformCol = new UniTableColumn('Avlonningsform', 'Avlønningsform', UniTableColumnType.Text)
    .setTemplate(rowModel => {
      return this.typeOfOtpPayments().find(p => p.id === rowModel.Avlonningsform).name;
    });
    const yearwageCol = new UniTableColumn('Aarslonn', 'Årslønn', UniTableColumnType.Number)
    .setNumberFormat({
      thousandSeparator: ' ',
      decimalSeparator: ',',
      decimalLength: 0
    });
    const employmentpercentCol = new UniTableColumn('Stillingsprosent', 'Stillingsprosent', UniTableColumnType.Number)
    .setNumberFormat({
      thousandSeparator: ' ',
      decimalSeparator: ',',
      decimalLength: 2
    });
    const periodsalarySumCol = new UniTableColumn('Periodelonnbelop', 'Periodelønn-beløp', UniTableColumnType.Money);
    const periodsalaryAmountCol = new UniTableColumn('Periodelonnantall', 'Periodelønn-antall', UniTableColumnType.Number);
    const statusPensionCol = new UniTableColumn('Status', 'Status pensjon', UniTableColumnType.Text)
    .setTemplate(rowModel => {
      return this.statuses().find(s => s.short === rowModel.Status).full;
    });
    const departmentCol = new UniTableColumn('Enhet', 'Avdeling', UniTableColumnType.Text);
    this.otpTableConfig = new UniTableConfig('salary.otpexport.data', false, true)
      .setColumns([
        numberCol, nameCol, birthCol, addressCol, address2Col, address3Col,
        postalCodeCol, cityCol, startdateCol, enddateCol, paymentformCol, yearwageCol,
        employmentpercentCol, periodsalarySumCol, departmentCol, periodsalaryAmountCol, statusPensionCol
      ])
      .setSearchable(true);
  }

  private getSaveActions(): IUniSaveAction[] {
    return [
      {
        label: 'Eksporter',
        action: this.exportToFile.bind(this),
        main: true,
        disabled: !this.otpData || !this.otpData.length
      }
    ];
  }

  private exportToFile(done: (message: string) => void) {
    this.payrollrunService
      .getOTPExportData(
        this.runs,
        this.otpexportModel$.getValue().month,
        this.otpexportModel$.getValue().year,
        true
        )
      .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
      .subscribe(otpXml => {
        const a = document.createElement('a');
        const dataURI = 'data:text/xml;base64,' + btoa(otpXml);
        a.href = dataURI;
        a['download'] = `otpExport_${this.otpexportModel$.getValue().month}_${this.otpexportModel$.getValue().year}.xml`;

        const e = document.createEvent('MouseEvents');
        e.initMouseEvent('click', true, false, document.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

        a.dispatchEvent(e);
        a.remove();
        done('Data eksportert');
      });
  }

}
