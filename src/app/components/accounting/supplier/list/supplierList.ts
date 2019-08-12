import { Component } from '@angular/core';
import { TabService, UniModules } from '../../../layout/navbar/tabstrip/tabService';
import {
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../../services/common/uniTickerService';
import { Router } from '@angular/router';
import { UniModalService } from '@uni-framework/uni-modal';
import { ImportCentralTemplateModal } from '@app/components/common/modals/import-central-modal/import-central-template-modal';
import { environment } from 'src/environments/environment';
import { DisclaimerModal } from '@app/components/admin/import-central/modals/disclaimer/disclaimer-modal';
import { UserService } from '@app/services/services';

@Component({
    selector: 'supplier-list',
    templateUrl: './supplierList.html'
})
export class SupplierList {

    public columnOverrides: Array<ITickerColumnOverride> = [];
    public actionOverrides: Array<ITickerActionOverride> = [];

    public toolbarActions = [{
        label: 'Ny leverandør',
        action: this.newSupplier.bind(this),
        main: true,
        disabled: false
    },
    {
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
    }
    ];

    supplierTemplateUrl: string = environment.IMPORT_CENTRAL_TEMPLATE_URLS.SUPPLIER;

    constructor(
        private tabService: TabService,
         private router: Router, 
         private modalService: UniModalService,
         private userService: UserService ) {
        this.tabService.addTab({
            name: 'Leverandører',
            url: '/accounting/suppliers',
            active: true,
            moduleID: UniModules.Suppliers
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
        this.modalService.open(ImportCentralTemplateModal,
            {
                header: 'Importer leverandører',
                data: {
                    jobName: 'SupplierImportJob',
                    entityType: 'Supplier',
                    description: 'Import central - supplier',
                    conditionalStatement: 'Hvis leverandørnummer i filen eksisterer i Uni Economy, så vil importen hoppe over rad med dette nummeret.Leverandørnumrene blir validert mot leverandørnummerseriene, som ligger under Innstillinger, og filen avvises ved avvik.',
                    formatStatement: 'Importen støtter Uni standard format (*.txt, rectype \'40\'). For bruk til import fra Uni økonomi V3.',
                    downloadStatement: 'Last ned excel mal for bruk til import fra eksterne system',
                    downloadTemplateUrl: this.supplierTemplateUrl
                }
            }
        );
    };
}
