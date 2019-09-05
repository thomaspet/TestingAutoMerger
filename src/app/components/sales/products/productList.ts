import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '../../../../framework/ui/unitable/index';
import { IUniSaveAction } from '../../../../framework/save/save';
import { ProductService, ErrorService, UserService, ImportCentralService } from '../../../services/services';
import { Product } from '../../../unientities';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { UniModalService } from '@uni-framework/uni-modal';
import { environment } from 'src/environments/environment';
import { DisclaimerModal } from '@app/components/import-central/modals/disclaimer/disclaimer-modal';
import { ImportUIPermission } from '@app/models/import-central/ImportUIPermissionModel';
import { ImportJobName, TemplateType } from '@app/models/import-central/ImportDialogModel';
import { ImportTemplateModal } from '@app/components/import-central/modals/import-template/import-template-modal';

@Component({
    selector: 'product-list',
    templateUrl: './productList.html'
})
export class ProductList {
    public productTable: UniTableConfig;
    public lookupFunction: (urlParams: HttpParams) => any;
    public saveActions: IUniSaveAction[];
    private productPermissions: ImportUIPermission;
    
    productTemplateUrl: string = environment.IMPORT_CENTRAL_TEMPLATE_URLS.PRODUCT;

    constructor(
        private router: Router,
        private productService: ProductService,
        private tabService: TabService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private userService: UserService,   
        private importCentralService: ImportCentralService
    ) {
        this.tabService.addTab({
            name: 'Produkter',
            url: '/sales/products',
            active: true,
            moduleID: UniModules.Products
        });

        this.saveActions = [{
            label: 'Nytt produkt',
            main: true,
            action: (done) => {
                done();
                this.router.navigateByUrl('/sales/products/0');
            }
        }];

        this.setupProductTable();
        this.getImportAccess();
    }

    private getImportAccess() {
        this.userService.getCurrentUser().subscribe(res => {
            const permissions = res['Permissions'];
            this.productPermissions = this.importCentralService.getAccessibleComponents(permissions).product;
            if (this.productPermissions.hasComponentAccess) {
                this.saveActions.push(...[{
                    label: 'Importer produkter',
                    action: (done) => this.openImportModal(done),
                    main: true,
                    disabled: false
                },
                {
                    label: 'Import Logs',
                    action: this.importLogs.bind(this),
                    main: true,
                    disabled: false
                }]);
            }
        }, err => {
            this.errorService.handle('En feil oppstod, vennligst prøv igjen senere');
        });
    }

    public onRowSelected(event) {
        this.router.navigateByUrl('/sales/products/' + event.ID);
    }

    private setupProductTable() {

        this.lookupFunction = (urlParams: HttpParams) => {
            const params = (urlParams || new HttpParams).set(
                'expand',
                'Info,Dimensions,Dimensions.Department,Dimensions.Project'
            );

            return this.productService.GetAllByHttpParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        const partNameCol = new UniTableColumn('PartName', 'Produktnr', UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains');

        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);

        const dateCol = new UniTableColumn('CreatedAt', 'Opprettet', UniTableColumnType.LocalDate)
            .setVisible(false)
            .setWidth('4rem');

        const priceExVatCol = new UniTableColumn('PriceExVat', 'Utpris eks. mva', UniTableColumnType.Money)
            .setFilterOperator('eq')
            .setWidth('10%')
            .setIsSumColumn(true)
            .setCls('column-align-right');

        const priceIncVatCol = new UniTableColumn('PriceIncVat', 'Utpris inkl. mva', UniTableColumnType.Money)
            .setFilterOperator('eq')
            .setWidth('10%')
            .setIsSumColumn(true)
            .setCls('column-align-right');

        const departmentCol = new UniTableColumn('Dimensions.Department.DepartmentNumber', 'Avdeling', UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains')
            .setTemplate((data: Product) => {
                return data.Dimensions && data.Dimensions.Department
                    ? data.Dimensions.Department.DepartmentNumber + ': ' + data.Dimensions.Department.Name
                    : '';
            });

        const projectCol = new UniTableColumn('Dimensions.Project.ProjectNumber', 'Prosjekt', UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains')
            .setTemplate((data: Product) => {
                return data.Dimensions && data.Dimensions.Project
                    ? data.Dimensions.Project.ProjectNumber + ': ' + data.Dimensions.Project.Name
                    : '';
            });

        const descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
            .setWidth('15%')
            .setVisible(false);

        this.productTable = new UniTableConfig('common.productList', false, true, 25)
            .setSearchable(true)
            .setEntityType('Product')
            .setSearchListVisible(true)
            .setColumns([
                partNameCol,
                nameCol,
                dateCol,
                priceExVatCol,
                priceIncVatCol,
                departmentCol,
                projectCol,
                descriptionCol
            ]);
    }

    public openImportModal(done = () => { }) {
        this.userService.getCurrentUser().subscribe(res => {
            if (res) {
                if (res.HasAgreedToImportDisclaimer) {
                    this.openProductImportModal();
                } else {
                    this.modalService.open(DisclaimerModal)
                        .onClose.subscribe((val) => {
                            if (val) {
                                this.openProductImportModal();
                            }
                        });
                }
            }
        });
        done();
    }

    private importLogs() {
        this.router.navigateByUrl('/admin/jobs');
    }

    private openProductImportModal() {
        this.modalService.open(ImportTemplateModal,
            {
                header: 'Importer produkter',
                data: {
                    jobName: ImportJobName.Product,
                    type: 'Product',
                    entity: TemplateType.Product,
                    conditionalStatement: 'Hvis produktnummer i filen eksisterer i Uni Economy, så vil importen hoppe over rad med dette nummeret.',
                    formatStatement: 'Importen støtter Uni standard format (*.txt, rectype \'70\'). For bruk til import fra Uni økonomi V3.(NB! Salgskonto på varen setter mva-kode. Importen håndterer bare priser med eks.mva, varer med mva-kode \'1\' vil få feil pris)',
                    downloadStatement: 'Last ned excel mal for bruk til import fra eksterne system',
                    downloadTemplateUrl: this.productTemplateUrl,
                    hasTemplateAccess: this.productPermissions.hasTemplateAccess,
                    isExternal: true
                }
            });
    };
}
