import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '../../../../framework/ui/unitable/index';
import { IUniSaveAction } from '../../../../framework/save/save';
import { ProductService, ErrorService, UserService } from '../../../services/services';
import { Product } from '../../../unientities';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { UniModalService } from '@uni-framework/uni-modal';
import { ImportCentralTemplateModal } from '@app/components/common/modals/import-central-modal/import-central-template-modal';
import { environment } from 'src/environments/environment';
import { DisclaimerModal } from '@app/components/admin/import-central/modals/disclaimer/disclaimer-modal';

@Component({
    selector: 'product-list',
    templateUrl: './productList.html'
})
export class ProductList {
    public productTable: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams) => any;
    public saveActions: IUniSaveAction[];

    productTemplateUrl: string = environment.IMPORT_CENTRAL_TEMPLATE_URLS.PRODUCT;

    constructor(
        private router: Router,
        private productService: ProductService,
        private tabService: TabService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private userService: UserService
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
        },
        {
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
        }
        ];

        this.setupProductTable();
    }

    public onRowSelected(event) {
        this.router.navigateByUrl('/sales/products/' + event.ID);
    }

    private setupProductTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            params.set('expand', 'Info,Dimensions,Dimensions.Department,Dimensions.Project');

            return this.productService.GetAllByUrlSearchParams(params)
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
                }
                else {
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
        this.modalService.open(ImportCentralTemplateModal,
            {
                header: 'Importer produkter',
                data: {
                    jobName: 'ProductImportJob',
                    entityType: 'Product',
                    description: 'Import central - product',
                    conditionalStatement: 'Hvis produktnummer i filen eksisterer i Uni Economy, så vil importen hoppe over rad med dette nummeret.',
                    formatStatement: 'Importen støtter Uni standard format (*.txt, rectype \'70\'). For bruk til import fra Uni økonomi V3.(NB! Salgskonto på varen setter mva-kode. Importen håndterer bare priser med eks.mva, varer med mva-kode \'1\' vil få feil pris)',
                    downloadStatement: 'Last ned excel mal for bruk til import fra eksterne system',
                    downloadTemplateUrl: this.productTemplateUrl
                }
            }
        );
    };
}
