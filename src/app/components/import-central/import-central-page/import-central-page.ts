import { Component, OnInit } from '@angular/core';
import { UniModalService } from '@uni-framework/uni-modal';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserService, ErrorService, ImportCentralService } from '@app/services/services';
import { DisclaimerModal } from '../modals/disclaimer/disclaimer-modal';
import { DownloadTemplateModal } from '../modals/download-template/download-template-modal';
import { ImportTemplateModal } from '../modals/import-template/import-template-modal';
import { ImportUIPermission, ImportSaftUIPermission } from '@app/models/import-central/ImportUIPermissionModel';
import { ImportJobName, TemplateType, ImportStatement } from '@app/models/import-central/ImportDialogModel';
import { ImportCardModel } from '@app/models/import-central/ImportCardModel';
import { ImportVoucherModal } from '../modals/custom-component-modals/imports/voucher/import-voucher-modal';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ImportOrderModal } from '../modals/custom-component-modals/imports/order/import-order-modal';
import {theme, THEMES} from 'src/themes/theme';

@Component({
  selector: 'import-central-page',
  templateUrl: './import-central-page.html',
  styleUrls: ['./import-central-page.sass']
})
export class ImportCentralPage implements OnInit {


  busy: boolean = true;
  importCardsList: ImportCardModel[] = [];
  templateUrls = environment.IMPORT_CENTRAL_TEMPLATE_URLS;
  uiPermission = {
    customer: new ImportUIPermission(),
    product: new ImportUIPermission(),
    supplier: new ImportUIPermission(),
    ledger: new ImportUIPermission(),
    payroll: new ImportUIPermission(),
    saft: new ImportSaftUIPermission(),
    voucher: new ImportUIPermission(),
    order: new ImportUIPermission(),
  };

  constructor(
    private router: Router,
    private userService: UserService,
    private errorService: ErrorService,
    private modalService: UniModalService,
    private importCentralService: ImportCentralService,
    private tabService: TabService, ) {
    this.userService.getCurrentUser().subscribe(res => {
      const permissions = res['Permissions'];
      this.uiPermission = this.importCentralService.getAccessibleComponents(permissions);
      this.busy = false;
      this.initImportCards();
    },
      err => {
        this.busy = false;
        this.errorService.handle('En feil oppstod, vennligst prøv igjen senere');
      }
    );
  }

  ngOnInit(): void {
    this.tabService.addTab({
      url: '/import/page',
      name: 'Importsentral',
      active: true,
      moduleID: UniModules.ImportCentral
    });
  }

  private initImportCards() {
    this.importCardsList.push(
      {
        uiPermission: {
          hasComponentAccess: this.uiPermission.product.hasComponentAccess,
          hasTemplateAccess: this.uiPermission.product.hasTemplateAccess,
          hasImportAccess: true
        },
        iconName: 'business_center',
        title: 'Produkt',
        importText: 'Importer',
        downloadText: 'Last ned mal',
        type: TemplateType.Product
      },
      {
        uiPermission: {
          hasComponentAccess: this.uiPermission.customer.hasComponentAccess,
          hasImportAccess: true,
          hasTemplateAccess: this.uiPermission.customer.hasTemplateAccess
        },
        iconName: 'group',
        title: 'Kunde',
        importText: 'Importer',
        downloadText: 'Last ned mal',
        type: TemplateType.Customer
      },
      {
        uiPermission: {
          hasComponentAccess: this.uiPermission.supplier.hasComponentAccess,
          hasImportAccess: true,
          hasTemplateAccess: this.uiPermission.supplier.hasTemplateAccess
        },
        iconName: 'contacts',
        title: 'Leverandør',
        importText: 'Importer',
        downloadText: 'Last ned mal',
        type: TemplateType.Supplier
      },
      {
        uiPermission: {
          hasComponentAccess: this.uiPermission.ledger.hasComponentAccess,
          hasImportAccess: true,
          hasTemplateAccess: this.uiPermission.ledger.hasTemplateAccess
        },
        iconName: 'receipt',
        title: 'Kontoplan',
        importText: 'Importer',
        downloadText: 'Last ned mal',
        type: TemplateType.MainLedger
      },
      {
        uiPermission: {
          hasComponentAccess: this.uiPermission.payroll.hasComponentAccess,
          hasImportAccess: true,
          hasTemplateAccess: this.uiPermission.payroll.hasTemplateAccess
        },
        iconName: 'payment',
        title: 'Variable lønnsposter',
        importText: 'Importer',
        downloadText: 'Last ned mal',
        type: TemplateType.Payroll
      },
      {
        uiPermission: {
          hasComponentAccess: this.uiPermission.saft.hasComponentAccess,
          hasImportAccess: this.uiPermission.saft.hasImportAccess,
          hasTemplateAccess: this.uiPermission.saft.hasExportAccess
        },
        iconName: 'insert_drive_file',
        title: 'SAF-T',
        importText: 'Importer',
        downloadText: 'Eksport SAF-T',
        type: TemplateType.Saft
      },
      {
        uiPermission: {
          hasComponentAccess: this.uiPermission.voucher.hasComponentAccess,
          hasImportAccess: true,
          hasTemplateAccess: this.uiPermission.voucher.hasTemplateAccess
        },
        iconName: 'card_giftcard',
        title: 'Bilag',
        importText: 'Importer',
        downloadText: 'Last ned mal',
        type: TemplateType.Voucher
      },
      {
        uiPermission: {
          hasComponentAccess: this.uiPermission.order.hasComponentAccess,
          hasImportAccess: true,
          hasTemplateAccess: this.uiPermission.order.hasTemplateAccess
        },
        iconName: 'shopping_cart',
        title: 'Ordre',
        importText: 'Importer',
        downloadText: 'Last ned mal',
        type: TemplateType.Order
      }
    );
    this.importCardsList = this.importCardsList.filter(x => x.uiPermission.hasComponentAccess);
  }

  private navigateToLogHistory(type: TemplateType) {
    this.router.navigate(['/import/log', { id: type }]);
  }

  // checks with disclaimer agreement
  public openImportTemplateModal(templateType: TemplateType) {
    if (templateType !== TemplateType.Saft) {
      this.userService.getCurrentUser().subscribe(res => {
        if (res) {
          if (res.HasAgreedToImportDisclaimer) {
            this.openImportModal(templateType);
          } else {
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
    } else {
      this.router.navigate(['admin', 'jobs'], {
        queryParams: {
          tab: 'saft-t'
        }
      });
    }
  }

  public openImportModal(templateType: TemplateType) {
    let header, jobName, type, templateUrl, conditionalStatement, formatStatement, downloadStatement = '';
    switch (templateType) {
      case TemplateType.Product:
        header = 'Importer produkter';
        jobName = ImportJobName.Product;
        type = 'Produkter';
        formatStatement = (theme.theme !== THEMES.UE && theme.theme !== THEMES.SOFTRIG) ? '' : ImportStatement.ProductFormatStatement;
        downloadStatement = ImportStatement.ProductDownloadStatement;
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.PRODUCT;
        break;
      case TemplateType.Customer:
        header = 'Importer kunder';
        jobName = ImportJobName.Customer;
        type = 'Kunder';
        formatStatement = (theme.theme !== THEMES.UE && theme.theme !== THEMES.SOFTRIG) ? '' : ImportStatement.CustomerFormatStatement;
        downloadStatement = ImportStatement.CustomerDownloadStatement;
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.CUSTOMER;
        break;
      case TemplateType.Supplier:
        header = 'Importer leverandører';
        jobName = ImportJobName.Supplier;
        type = 'Leverandører';
        formatStatement = (theme.theme !== THEMES.UE && theme.theme !== THEMES.SOFTRIG) ? '' : ImportStatement.SupplierFormatStatement;
        downloadStatement = ImportStatement.SupplierDownloadStatement;
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.SUPPLIER;
        break;
      case TemplateType.MainLedger:
        header = 'Importer kontoplan';
        jobName = ImportJobName.MainLedger;
        type = 'Kontoplan';
        conditionalStatement = ImportStatement.MainLedgerConditionalStatement;
        formatStatement = (theme.theme !== THEMES.UE && theme.theme !== THEMES.SOFTRIG) ? '' : ImportStatement.MainLedgerFormatStatement;
        downloadStatement = ImportStatement.MainLedgerDownloadStatement;
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.MAIN_LEDGER;
        break;
      case TemplateType.Payroll:
        header = 'Importer lønnsposter';
        jobName = ImportJobName.Payroll;
        type = 'lønnsposter';
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.PAYROLL;
        break;
      case TemplateType.Saft:
        header = 'Importer SAF-T';
        jobName = ImportJobName.Saft;
        type = 'SAF-T';
        break;
      case TemplateType.Voucher:
        header = 'Importer bilag';
        jobName = ImportJobName.Voucher;
        type = 'bilag';
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.VOUCHER;
        break;
      case TemplateType.Order:
        header = 'Importer Order';
        jobName = ImportJobName.Order;
        type = 'Order';
        conditionalStatement = ImportStatement.OrderConditionalStatement;
        formatStatement = (theme.theme !== THEMES.UE && theme.theme !== THEMES.SOFTRIG) ? '' : ImportStatement.OrderFormatStatement;
        templateUrl = environment.IMPORT_CENTRAL_TEMPLATE_URLS.ORDER;
        break;
      default:
        header = '';
        jobName = '';
        type = '';
        break;
    }
    if (templateType === TemplateType.Voucher) {
      this.modalService.open(ImportVoucherModal,
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
    } else if (templateType === TemplateType.Order) {
      this.modalService.open(ImportOrderModal,
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
    } else {
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
  }

  public openDownloadTemplateModal(templateType: TemplateType) {
    let header, data, downloadButton;
    downloadButton = 'Eksportmal';
    switch (templateType) {
      case TemplateType.Product:
        header = 'Produkt Eksportmal';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.PRODUCT, EntityType: templateType, FileName: 'ProductTemplateWithData', Permisions: this.uiPermission.product, downloadButton: downloadButton };
        break;
      case TemplateType.Customer:
        header = 'Kunde Eksportmal';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.CUSTOMER, EntityType: templateType, FileName: 'CustomerTemplateWithData', Permisions: this.uiPermission.customer, downloadButton: downloadButton };
        break;
      case TemplateType.Supplier:
        header = 'Leverandør Eksportmal';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.SUPPLIER, EntityType: templateType, FileName: 'SupplierTemplateWithData', Permisions: this.uiPermission.supplier, downloadButton: downloadButton };
        break;
      case TemplateType.MainLedger:
        header = 'Kontoplan Eksportmal';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.MAIN_LEDGER, EntityType: templateType, FileName: 'MainLedgerTemplateWithData', Permisions: this.uiPermission.ledger, downloadButton: downloadButton };
        break;
      case TemplateType.Payroll:
        header = 'Lønnsposter Eksportmal';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.PAYROLL, EntityType: templateType, FileName: 'PayrollTemplateWithData', Permisions: this.uiPermission.payroll, downloadButton: downloadButton };
        break;
      case TemplateType.Saft:
        header = 'SAF-T eksport';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.PAYROLL, EntityType: templateType, FileName: 'SaftExportedFile', Permisions: this.uiPermission.saft, downloadButton: 'Eksporter SAF-T' };
        break;
      case TemplateType.Voucher:
        header = 'Bilag Eksportmal';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.VOUCHER, EntityType: templateType, FileName: 'VoucherExportedFile', Permisions: this.uiPermission.voucher, downloadButton: downloadButton };
        break;
      case TemplateType.Order:
        header = 'Ordre Eksportmal';
        data = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.ORDER, EntityType: templateType, FileName: 'OrderExportedFile', Permisions: this.uiPermission.order, downloadButton: downloadButton };
        break;
      default:
        header = '';
        data = { StandardUniFormat: '', StandardizedExcelFormat: '' };
        break;
    }
    if (templateType !== TemplateType.Saft) {
    this.modalService.open(DownloadTemplateModal,
      {
        header: header,
        message: 'Inkluder eksisterende',
        data: data
      });
    } else {
      this.router.navigate(['admin', 'jobs'], {
        queryParams: {
          tab: 'saft-t'
        }
      });
    }
  }

  navigateToLogs(type) {
    this.navigateToLogHistory(type);
  }

  onDisclaimerClick() {
    this.modalService.open(DisclaimerModal, { data: { isAccepted: true } });
  }

}


