import {Component} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../../services/common/uniTickerService';

@Component({
    selector: 'supplier-list',
    templateUrl: './supplierList.html'
})
export class SupplierList {

    public columnOverrides: Array<ITickerColumnOverride> = [ ];
    public actionOverrides: Array<ITickerActionOverride> = [ ];

    constructor (private tabService: TabService) {
        this.tabService.addTab({
            name: 'Leverandører',
            url: '/accounting/suppliers',
            active: true,
            moduleID: UniModules.Suppliers
        });
    }
}
