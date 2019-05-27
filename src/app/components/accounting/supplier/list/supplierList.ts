import { Component } from '@angular/core';
import { TabService, UniModules } from '../../../layout/navbar/tabstrip/tabService';
import {
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../../services/common/uniTickerService';
import { Router } from '@angular/router';
import { UniModalService } from '@uni-framework/uni-modal';
import { ImportCentralTemplateModal } from '@app/components/common/modals/import-central-modal/import-central-template-modal';

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
    }];

    constructor(private tabService: TabService, private router: Router, private modalService: UniModalService, ) {
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

    public openImportModal(done = null) {
        this.modalService.open(ImportCentralTemplateModal,
            {
                header: 'Importer leverandører',
                message: 'Om en leverandør med likt leverandørnummer finnes fra før, vil den importerte leverandøren ikke lagres. Om leverandørnumrene ikke passer inn i valgt leverandørnummerserie vil de avvises',
                data: { jobName: 'SupplierImportJob', downloadTemplateUrl: ''}
            }
        ).onClose.subscribe((res) => {
            if (res) {

            } else {
                if (done) {
                    done();
                }
            }
        });
    }
}
