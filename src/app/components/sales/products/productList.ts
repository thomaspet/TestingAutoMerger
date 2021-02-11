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
import { ImportJobName, TemplateType, ImportStatement } from '@app/models/import-central/ImportDialogModel';
import { ImportTemplateModal } from '@app/components/import-central/modals/import-template/import-template-modal';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'product-list',
    templateUrl: './productList.html'
})
export class ProductList {
    public productTable: UniTableConfig;
    public lookupFunction: (urlParams: HttpParams) => any;
    public saveActions: IUniSaveAction[];
    private productPermissions: ImportUIPermission;

    productTemplateUrl: string = environment.PUBLIC_FILES_URL + '/files/import/ProductTemplateFinal.xlsx';

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
                    label: 'Importlogg',
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

        const partNameCol = new UniTableColumn('PartName', 'Produktnr', UniTableColumnType.Text);

        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);

        const dateCol = new UniTableColumn('CreatedAt', 'Opprettet', UniTableColumnType.LocalDate)
            .setVisible(false)
            .setWidth('4rem');

        const priceExVatCol = new UniTableColumn('PriceExVat', 'Utpris eks. mva', UniTableColumnType.Money);

        const priceIncVatCol = new UniTableColumn('PriceIncVat', 'Utpris inkl. mva', UniTableColumnType.Money);

        const departmentCol = new UniTableColumn('Dimensions.Department.DepartmentNumber', 'Avdeling', UniTableColumnType.Text)
            .setTemplate((data: Product) => {
                return data.Dimensions && data.Dimensions.Department
                    ? data.Dimensions.Department.DepartmentNumber + ': ' + data.Dimensions.Department.Name
                    : '';
            });

        const projectCol = new UniTableColumn('Dimensions.Project.ProjectNumber', 'Prosjekt', UniTableColumnType.Text)
            .setTemplate((data: Product) => {
                return data.Dimensions && data.Dimensions.Project
                    ? data.Dimensions.Project.ProjectNumber + ': ' + data.Dimensions.Project.Name
                    : '';
            });

        const descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
            .setVisible(false);

        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setVisible(false)
            .setTemplate((data: Product) => {
                return this.productService.getStatusText(data.StatusCode);
            });

        this.productTable = new UniTableConfig('common.productList', false, true, 25)
            .setSearchable(true)
            .setEntityType('Product')
            .setColumns([
                partNameCol,
                nameCol,
                dateCol,
                priceExVatCol,
                priceIncVatCol,
                departmentCol,
                projectCol,
                descriptionCol,
                statusCol
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
        this.router.navigate(['/import/log', { id: TemplateType.Product }]);
    }

    private openProductImportModal() {
        this.modalService.open(ImportTemplateModal,
            {
                header: 'Importer produkter',
                data: {
                    jobName: ImportJobName.Product,
                    type: 'Product',
                    entity: TemplateType.Product,
                    conditionalStatement: '',
                    formatStatement: (theme.theme !== THEMES.UE && theme.theme !== THEMES.SOFTRIG)
                        ? ''
                        : ImportStatement.ProductFormatStatement,
                    downloadStatement: ImportStatement.ProductDownloadStatement,
                    downloadTemplateUrl: this.productTemplateUrl,
                    hasTemplateAccess: this.productPermissions.hasTemplateAccess,
                    isExternal: true
                }
            });
    }
}
