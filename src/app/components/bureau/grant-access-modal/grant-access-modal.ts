import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal, UniModalService, UniConfirmModalV2} from '@uni-framework/uni-modal';
import {ElsaProduct, ElsaContract, ElsaCompanyLicense, ElsaUserLicense} from '@app/services/elsa/elsaModels';
import {BureauCustomHttpService} from '@app/components/bureau/bureauCustomHttpService';
import {IAuthDetails, AuthService} from '@app/authService';
import {ErrorService} from '@app/services/common/errorService';

export enum PAGE_TYPE {
    selectLicense = 0,
    selectCompanies,
    selectUsers,
    selectProducts,
    execute,
    receipt,
}

export interface GrantAccessData {
    contract: ElsaContract;
    companies: ElsaCompanyLicense[];
    users: ElsaUserLicense[];
    products: ElsaProduct[];
}

@Component({
    selector: 'uni-module-access-modal',
    templateUrl: './grant-access-modal.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class GrantAccessModal implements IUniModal {

    PageType = PAGE_TYPE;

    @Input()
    options: IModalOptions = {};

    @Output()
    onClose: EventEmitter<void> = new EventEmitter<void>();

    currentPage: PAGE_TYPE = PAGE_TYPE.selectLicense;
    lastCompletedPage: PAGE_TYPE = PAGE_TYPE.selectLicense;

    grantAccessData: GrantAccessData = <any>{};

    showProgressBar = true;

    constructor(
        private bureauHttp: BureauCustomHttpService,
        private modalService: UniModalService,
        private authService: AuthService,
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        this.authService.authentication$.take(1)
            .switchMap((authentication: IAuthDetails) => {
                const mainCompanyKey = authentication.user.License.Company.Agency.CompanyKey;
                const mainCompanyName = authentication.user.License.Company.Agency.Name;
                return this.bureauHttp.hasAccessToCompany(mainCompanyKey).do(hasAccess => {
                    if (!hasAccess) {
                        this.modalService.open(UniConfirmModalV2,
                            {
                                buttonLabels: {accept: 'OK'},
                                header: 'Ikke tilgang',
                                message: `Du må ha administartor tilgang i hoved selskapet "${mainCompanyName}" for å bruke bulk invitasjoner`,
                            })
                            .onClose
                            .subscribe(() => this.close());
                    }
                });
            })
            .subscribe(null, err => this.errorService.handle(err));
    }

    close() {
        this.onClose.emit();
    }

    classToShow(statusToFindClassFor: PAGE_TYPE): string {
        const classes = <string[]>[];
        if (this.lastCompletedPage < statusToFindClassFor) {
            classes.push('future');
        }
        if (this.lastCompletedPage >= statusToFindClassFor) {
            classes.push('completed');
        }
        if (this.currentPage === statusToFindClassFor) {
            classes.push('active');
        }
        return classes.join(' ');
    }

    switchToPage(page: PAGE_TYPE) {
        if (page <= this.lastCompletedPage) {
            this.currentPage = page;
        }
    }

    goToNextPage() {
        this.currentPage += 1;
        this.lastCompletedPage = this.currentPage;
    }

    hideProgressBar() {
        this.showProgressBar = false;
    }
}
