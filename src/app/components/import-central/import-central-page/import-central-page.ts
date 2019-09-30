import { Component } from '@angular/core';
import { UniModalService } from '@uni-framework/uni-modal';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserService, ErrorService, ImportCentralService } from '@app/services/services';
import { DisclaimerModal } from '../modals/disclaimer/disclaimer-modal';
import { DownloadTemplateModal } from '../modals/download-template/download-template-modal';
import { ImportTemplateModal } from '../modals/import-template/import-template-modal';
import { ImportUIPermission, ImportSaftUIPermission } from '@app/models/import-central/ImportUIPermissionModel';
import { ImportJobName, TemplateType, ImportStatement } from '@app/models/import-central/ImportDialogModel';

@Component({
  selector: 'import-central-page',
  templateUrl: './import-central-page.html',
  styleUrls: ['./import-central-page.sass']
})
export class ImportCentralPage {

  customerType: TemplateType = TemplateType.Customer;
  productType: TemplateType = TemplateType.Product;
  supplierType: TemplateType = TemplateType.Supplier;
  ledgerType: TemplateType = TemplateType.MainLedger;
  payrollType: TemplateType = TemplateType.Payroll;
  saftType: TemplateType = TemplateType.Saft;
  busy: boolean = true;

  templateUrls = environment.IMPORT_CENTRAL_TEMPLATE_URLS;

  uiPermission = {
    customer: new ImportUIPermission(),
    product: new ImportUIPermission(),
    supplier: new ImportUIPermission(),
    ledger: new ImportUIPermission(),
    payroll: new ImportUIPermission(),
    saft: new ImportSaftUIPermission()
  }

  constructor(
    private router: Router,
    private userService: UserService,
    private errorService: ErrorService,
    private modalService: UniModalService,
    private importCentralService: ImportCentralService) {
    this.userService.getCurrentUser().subscribe(res => {
      const permissions = res['Permissions'];
      this.uiPermission = this.importCentralService.getAccessibleComponents(permissions);
      this.busy = false;
    },
      err => {
        this.busy = false;
        this.errorService.handle('En feil oppstod, vennligst prøv igjen senere');
      }
    );
  }

  private navigateToLogHistory(type: TemplateType) {
    this.router.navigate(['/import/log', { id: type }]);
  }

  public openImportTemplateModal(templateType: TemplateType) {
    this.userService.getCurrentUser().subscribe(res => {
      if (res) {
        if (res.HasAgreedToImportDisclaimer) {
          this.openImportModal(templateType);
        }
        else {
          this.modalService.open(DisclaimerModal)
            .onClose.subscribe((val) => {
              if (val) {
                this.openImportModal(templateType);
              }
            });
        }
      }
    },
      err => this.errorService.handle('En feil oppstod, vennligst prøv igjen senere')
    );

  }

  public openImportModal(templateType: TemplateType) {
    let header, jobName, type, templateUrl, conditionalStatement, formatStatement, downloadStatement;
    switch (templateType) {
      case TemplateType.Product:
        header = 'Importer produkter';
        jobName = ImportJobName.Product;
        type = 'Produkter';
        formatStatement = ImportStatement.ProductFormatStatement;
        downloadStatement = ImportStatement.ProductDownloadStatement;
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.PRODUCT
        break;
      case TemplateType.Customer:
        header = 'Importer kunder';
        jobName = ImportJobName.Customer;
        type = 'Kunder';
        formatStatement = ImportStatement.CustomerFormatStatement;
        downloadStatement = ImportStatement.CustomerDownloadStatement;
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.CUSTOMER
        break;
      case TemplateType.Supplier:
        header = 'Importer leverandører';
        jobName = ImportJobName.Supplier;
        type = 'Leverandører';
        formatStatement = ImportStatement.SupplierFormatStatement;
        downloadStatement = ImportStatement.SupplierDownloadStatement;
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.SUPPLIER
        break;
      case TemplateType.MainLedger:
        header = 'Importer kontoplan';
        jobName = ImportJobName.MainLedger;
        type = 'Kontoplan';
        conditionalStatement = ImportStatement.MainLedgerConditionalStatement;
        formatStatement = ImportStatement.MainLedgerFormatStatement;
        downloadStatement = ImportStatement.MainLedgerDownloadStatement;
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.MAIN_LEDGER
        break;
      case TemplateType.Payroll:
        header = 'Importer lønnsposter';
        jobName = ImportJobName.Payroll;
        type = 'lønnsposter';
        formatStatement = '';
        downloadStatement = '';
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.PAYROLL 
        break;
      case TemplateType.Saft:
        header = 'Importer SAF-T';
        jobName = ImportJobName.Saft;
        type = 'SAF-T';
        formatStatement = '';
        downloadStatement = '';
        templateUrl = ''
        break;
      default:
        header = '';
        jobName = '';
        type = '';
        break;
    }
    this.modalService.open(ImportTemplateModal,
      {
        header: header,
        data: {
          jobName: jobName,
          type: type,
          entity: templateType,
          conditionalStatement: conditionalStatement,
          formatStatement: formatStatement,
          downloadStatement: downloadStatement,
          downloadTemplateUrl: templateUrl
        }
      });
  }

  public openDownloadTemplateModal(templateType: TemplateType) {
    let header, message, data, downloadButton;
    downloadButton ='Eksportmal';
    switch (templateType) {
      case TemplateType.Product:
        header = 'Produkt Eksportmal';
        message = 'Inkluder eksisterende';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.PRODUCT, EntityType: templateType, FileName: 'ProductTemplateWithData', Permisions: this.uiPermission.product, downloadButton:downloadButton };
        break;
      case TemplateType.Customer:
        header = 'Kunde Eksportmal';
        message = 'Inkluder eksisterende';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.CUSTOMER, EntityType: templateType, FileName: 'CustomerTemplateWithData', Permisions: this.uiPermission.customer, downloadButton:downloadButton }
        break;
      case TemplateType.Supplier:
        header = 'Leverandør Eksportmal';
        message = 'Inkluder eksisterende';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.SUPPLIER, EntityType: templateType, FileName: 'SupplierTemplateWithData', Permisions: this.uiPermission.supplier, downloadButton:downloadButton }
        break;
      case TemplateType.MainLedger:
        header = 'Kontoplan Eksportmal';
        message = 'Inkluder eksisterende';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.MAIN_LEDGER, EntityType: templateType, FileName: 'MainLedgerTemplateWithData', Permisions: this.uiPermission.ledger, downloadButton:downloadButton }
        break;
      case TemplateType.Payroll:
        header = 'Lønnsposter Eksportmal';
        message = 'Inkluder eksisterende';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.PAYROLL, EntityType: templateType, FileName: 'PayrollTemplateWithData', Permisions: this.uiPermission.payroll, downloadButton:downloadButton }
        break;
      case TemplateType.Saft:
        header = 'SAF-T eksport';
        message = 'Inkluder eksisterende';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.PAYROLL, EntityType: templateType, FileName: 'SaftExportedFile', Permisions: this.uiPermission.saft, downloadButton:'Eksporter SAF-T' }
        break;
      default:
        header = '';
        message = '';
        data = { StandardUniFormat: '', StandardizedExcelFormat: ''}
        break;
    }

    this.modalService.open(DownloadTemplateModal,
      {
        header: header,
        message: message,
        data: data
      });
  }

  navigateToLogs(type) {
    this.navigateToLogHistory(type);
  }

  onDisclaimerClick() {
    this.modalService.open(DisclaimerModal, { data: { isAccepted: true } });
  }

}


