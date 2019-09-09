import { Component } from '@angular/core';
import { TabService, UniModules } from '../../../layout/navbar/tabstrip/tabService';
import {
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../../services/common/uniTickerService';
import { Router } from '@angular/router';
import { UniModalService } from '@uni-framework/uni-modal';
import { environment } from 'src/environments/environment';
import { UserService, ImportCentralService, ErrorService } from '@app/services/services';
import { DisclaimerModal } from '@app/components/import-central/modals/disclaimer/disclaimer-modal';
import { ImportUIPermission } from '@app/models/import-central/ImportUIPermissionModel';
import { ImportJobName, TemplateType } from '@app/models/import-central/ImportDialogModel';
import { ImportTemplateModal } from '@app/components/import-central/modals/import-template/import-template-modal';

@Component({
    selector: 'supplier-list',
    templateUrl: './supplierList.html'
})
export class SupplierList {

    public columnOverrides: Array<ITickerColumnOverride> = [];
    public actionOverrides: Array<ITickerActionOverride> = [];
    private supplierPermissions: ImportUIPermission;

    public toolbarActions = [{
        label: 'Ny leverandør',
        action: this.newSupplier.bind(this),
        main: true,
        disabled: false
    }];

    supplierTemplateUrl: string = environment.IMPORT_CENTRAL_TEMPLATE_URLS.SUPPLIER;

    constructor(
        private tabService: TabService,
         private router: Router, 
         private modalService: UniModalService,
         private userService: UserService,
         private importCentralService: ImportCentralService,
         private errorService: ErrorService) {
        this.tabService.addTab({
            name: 'Leverandører',
            url: '/accounting/suppliers',
            active: true,
            moduleID: UniModules.Suppliers
        });
        this.getImportAccess();
    }

    private getImportAccess() {
        this.userService.getCurrentUser().subscribe(res => {
            const permissions = res['Permissions'];
            this.supplierPermissions = this.importCentralService.getAccessibleComponents(permissions).supplier;
            if (this.supplierPermissions.hasComponentAccess) {
                this.toolbarActions.push(...[{
                    label: 'Importer leverandører',
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

    private newSupplier() {
        this.router.navigateByUrl('/accounting/suppliers/' + 0);
    }

    public openImportModal(done = () => { }) {
        this.userService.getCurrentUser().subscribe(res => {
            if (res) {
                if (res.HasAgreedToImportDisclaimer) {
                    this.openSupplierImportModal();
                }
                else {
                    this.modalService.open(DisclaimerModal)
                        .onClose.subscribe((val) => {
                            if (val) {
                                this.openSupplierImportModal();
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

    private openSupplierImportModal() {
        this.modalService.open(ImportTemplateModal,
            {
                header: 'Importer leverandører',
                data: {
                    jobName: ImportJobName.Supplier,
                    type: 'Supplier',
                    entity: TemplateType.Supplier,
                    conditionalStatement: 'Hvis leverandørnummer i filen eksisterer i Uni Economy, så vil importen hoppe over rad med dette nummeret.Leverandørnumrene blir validert mot leverandørnummerseriene, som ligger under Innstillinger, og filen avvises ved avvik.',
                    formatStatement: 'Importen støtter Uni standard format (*.txt, rectype \'40\'). For bruk til import fra Uni økonomi V3.',
                    downloadStatement: 'Last ned excel mal for bruk til import fra eksterne system',
                    downloadTemplateUrl: this.supplierTemplateUrl,
                    hasTemplateAccess: this.supplierPermissions.hasTemplateAccess,
                    isExternal: true
                }
            });
    };
}
