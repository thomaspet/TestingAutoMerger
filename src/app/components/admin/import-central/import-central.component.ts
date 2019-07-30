import { Component, OnInit } from '@angular/core';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { UniModalService } from '@uni-framework/uni-modal';
import { DownloadTemplateModal } from './modals/download-template/download-template-modal';
import { ImportTemplateModal } from './modals/import-template/import-template-modal';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { DisclaimerModal } from './modals/disclaimer/disclaimer-modal';
import { UserService } from '@app/services/services';

@Component({
  selector: 'uni-import-central',
  templateUrl: './import-central.component.html',
  styleUrls: ['./import-central.component.sass']
})
export class ImportCentralComponent implements OnInit {

  customerType: TemplateType = TemplateType.customer;
  productType: TemplateType = TemplateType.product;
  supplierType: TemplateType = TemplateType.supplier;
  saftType: TemplateType = TemplateType.saft;

  templateUrls = environment.IMPORT_CENTRAL_TEMPLATE_URLS;

  public toolbarActions = [{
    label: 'Log History',
    action: this.navigateToLogHistory.bind(this),
    main: true,
    disabled: false
  }];


  constructor(
    private tabService: TabService,
    private modalService: UniModalService,
    private router: Router,
    private userService: UserService) { }

  ngOnInit() {
    this.setupTabName();
  }

  private setupTabName() {
    this.tabService.addTab({
      url: '/admin/import-central',
      name: 'Importsentral',
      active: true,
      moduleID: UniModules.ImportCentral
    });
  }

  private navigateToLogHistory(type: TemplateType) {
    this.router.navigate(['/admin/import-central-log-history', type]);
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
    });

  }

  public openImportModal(templateType: TemplateType) {
    let header, jobName, type, templateUrl;
    switch (templateType) {
      case TemplateType.product:
        header = 'Produkt Importer';
        jobName = 'ProductImportJob';
        type = 'Produkt';
        templateUrl = ''
        break;
      case TemplateType.customer:
        header = 'Kunde Importer';
        jobName = 'CustomerImportJob';
        type = 'Kunde';
        templateUrl = ''
        break;
      case TemplateType.supplier:
        header = 'Leverandør Importer';
        jobName = 'SupplierImportJob';
        type = 'Leverandør';
        templateUrl = ''
        break;
      default:
        header = 'SAF-T Importer';
        jobName = 'SAFTImportJob';
        type = 'SAFT';
        break;
    }
    this.modalService.open(ImportTemplateModal,
      {
        header: header,
        data: {
          jobName: jobName,
          type: type,
          downloadTemplateUrl: templateUrl
        }
      });
  }
  
  public openDownloadTemplateModal(templateType: TemplateType) {
    let header, message, file;
    switch (templateType) {
      case TemplateType.product:
        header = 'Produkt Eksportmal';
        message = 'Inkluder eksisterende';
        file = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.PRODUCT, EntityType: templateType, FileName: 'ProductTemplateWithData' }
        break;
      case TemplateType.customer:
        header = 'Kunde Eksportmal';
        message = 'Inkluder eksisterende';
        file = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.CUSTOMER, EntityType: templateType, FileName: 'CustomerTemplateWithData' }
        break;
      case TemplateType.supplier:
        header = 'Leverandør Eksportmal';
        message = 'Inkluder eksisterende';
        file = { StandardUniFormat: '', StandardizedExcelFormat: this.templateUrls.SUPPLIER, EntityType: templateType, FileName: 'SupplierTemplateWithData' }
        break;
      default:
        header = 'SAF-T Eksportmal';
        message = 'Inkluder eksisterende';
        file = { StandardUniFormat: '', StandardizedExcelFormat: '' }
        break;
    }

    this.modalService.open(DownloadTemplateModal,
      {
        header: header,
        message: message,
        data: file
      });
  }

  navigateToLogs(type) {
    this.navigateToLogHistory(type);
  }

  onDisclaimerClick() {
    this.modalService.open(DisclaimerModal, { data: { isAccepted: true } });
  }

}

export enum TemplateType {
  customer,
  product,
  supplier,
  saft,
  all
}