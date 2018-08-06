import {Component, Output, EventEmitter, Input} from '@angular/core';
import {GrantAccessData} from '@app/components/bureau/grant-access-modal/grant-access-modal';
import {ElsaCompanyLicense, ElsaProduct, ElsaUserLicense} from '@app/services/elsa/elsaModels';

@Component({
    selector: 'execute-for-bulk-access',
    templateUrl: './5.execute.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class ExecuteForBulkAccess {
    @Output()
    public next: EventEmitter<void> = new EventEmitter<void>();
    @Input()
    data: GrantAccessData;

    deselectCompany(company: ElsaCompanyLicense) {
        this.data.companies = this.data.companies.filter(c => c !== company);
    }

    deselectUser(user: ElsaUserLicense) {
        this.data.users = this.data.users.filter(u => u !== user);
    }

    deselectProduct(product: ElsaProduct) {
        this.data.products = this.data.products.filter(p => p !== product);
    }

    done() {
        this.next.emit();
    }
}
