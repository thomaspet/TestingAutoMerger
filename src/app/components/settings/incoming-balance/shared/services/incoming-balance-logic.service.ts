import { Injectable, Type } from '@angular/core';
import { CustomerEditModal } from '@app/components/common/modals/customer-edit-modal/customer-edit-modal';
import { SupplierEditModal } from '@app/components/common/modals/edit-supplier-modal/edit-supplier-modal';
import { Account, Customer, Supplier } from '@uni-entities';
import { IUniModal, UniModalService } from '@uni-framework/uni-modal';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IncomingBalanceHttpService, IncomingBalanceSubAccount } from '../../services/incoming-balance-http.service';
import { IncomingBalanceTab, IncomingBalanceNavigationService } from './incoming-balance-navigation.service';

@Injectable()
export class IncomingBalanceLogicService {

    constructor(
        private httpService: IncomingBalanceHttpService,
        private navigationService: IncomingBalanceNavigationService,
        private modalService: UniModalService,
    ) { }

    public reportRoute(path: IncomingBalanceTab) {
        this.navigationService.setCurrentPath(path);
    }
    public accountSearch(search: string): Observable<Account[]> {
        return this.httpService.searchRegularAccounts(search);
    }
    public subAccountSearch(search: string, entityType: IncomingBalanceSubAccount) {
        return this.httpService.searchAccountsOnEntity(search, entityType);
    }
    public addNewSubAccount(search: string, type: IncomingBalanceSubAccount) {
        const modal: Type<IUniModal> = type === 'Customer' ? CustomerEditModal : SupplierEditModal;
        return this.modalService
            .open(modal, type === 'Customer' && {data: {search: search}})
            .onClose
            .pipe(
                switchMap((result: Supplier | Customer) => this.httpService.getAccount(result?.ID, type))
            )
            .toPromise();
    }
}
