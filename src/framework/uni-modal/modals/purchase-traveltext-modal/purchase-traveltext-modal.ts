import {Component, Output, EventEmitter} from '@angular/core';
import {CompanySettings, User} from '@uni-entities';
import {ActivationEnum} from '../../../../app/models/activationEnum';
import {
    UserService,
    CompanySettingsService,
    ErrorService,
    ElsaPurchaseService,
    IntegrationServerCaller,
} from '@app/services/services';
import {forkJoin} from 'rxjs';
import {IModalOptions, IUniModal} from '../../interfaces';
import {environment} from 'src/environments/environment';
import {ElsaProduct, ElsaPurchase} from '@app/models';
import {theme, THEMES} from 'src/themes/theme';

interface TravelTextInitModel {
    OrgNumber: string;
    CompanyName: string;
    CompanyEmail: string;
    Address: string;
    Zip: string;
    City: string;
    UserName: string;
    UserEmail: string;
    UserPhoneNumber: string;
}

interface TravelTextInviteUsers {
    Name: string;
    Email: string;
    Deleted?: boolean;
}

@Component({
    selector: 'purchase-traveltext-modal',
    templateUrl: './purchase-traveltext-modal.html',
    styleUrls: ['./purchase-traveltext-modal.sass']
})
export class PurchaseTraveltextModal implements IUniModal {

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    options: IModalOptions = {};

    company: CompanySettings;
    user: User;
    users: User[];
    travelTextUsers: any[];

    model: TravelTextInitModel = <TravelTextInitModel>{};
    invalidInputErrorMsg: string;

    isSrEnvironment = theme.theme === THEMES.SR;
    appName = theme.appName;
    productName = this.isSrEnvironment ? 'SpareBank 1 Reise' : 'TravelText';
    product: ElsaProduct;
    isBought: boolean;

    step = 1;
    busy = false;

    constructor(
        private companySettingsService: CompanySettingsService,
        private userService: UserService,
        private errorService: ErrorService,
        private purchaseService: ElsaPurchaseService,
        private integrationService: IntegrationServerCaller,
    ) {}

    ngOnInit() {
        if (this.options.data && this.options.data.product) {
            this.product = this.options.data.product;
            this.isBought = this.product['_isBought'];
        }

        if (!this.isBought) {
            this.initActivationModel();
        } else {
            this.initChooseUsers();
        }
        this.options.cancelValue = ActivationEnum.NOT_ACTIVATED;
    }

    initActivationModel() {
        forkJoin([
            this.userService.getCurrentUser(),
            this.companySettingsService.Get(1, [
                'DefaultPhone',
                'DefaultEmail',
                'DefaultAddress',
            ])
        ]).subscribe(
            res => {
                this.user = res[0];
                this.company = res[1];

                this.model = {
                    OrgNumber: this.company.OrganizationNumber,
                    CompanyName: this.company.CompanyName,
                    CompanyEmail: (this.company.DefaultEmail && this.company.DefaultEmail.EmailAddress) || this.user.Email,
                    Address: this.company.DefaultAddress && this.company.DefaultAddress.AddressLine1,
                    Zip: this.company.DefaultAddress && this.company.DefaultAddress.PostalCode,
                    City: this.company.DefaultAddress && this.company.DefaultAddress.City,
                    UserName: this.user.DisplayName,
                    UserEmail: this.user.Email,
                    UserPhoneNumber: this.user.PhoneNumber,
                };
            },
            err => {
                this.errorService.handle(err);
            }
        );
    }

    initChooseUsers() {
        this.busy = true;
        forkJoin([
            this.userService.GetAll(),
            this.integrationService.getTravelTextPurchases()
        ]).subscribe(
            res => {
                this.users = res[0].filter(user => user.Email && user.StatusCode !== 110000);
                this.travelTextUsers = res[1];

                this.users.map(user => {
                    this.travelTextUsers.forEach(ttUser => {
                        if (user.Email === ttUser.Email) {
                            return user['_selected'] = true;
                        }
                    });
                });
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    step2() {
        this.step = 2;
        this.invalidInputErrorMsg = '';
    }

    checkInputs() {
        if (!this.model.UserName || !this.model.UserEmail || !this.model.UserPhoneNumber) {
            this.invalidInputErrorMsg = '* Alle feltene er påkrevd';
        } else if (!/^\d+$/.test(this.model.UserPhoneNumber)) {
            this.invalidInputErrorMsg = '* Mobilnummer kan kun inneholde tall';
        } else if (!this.isValidEmailAddress(this.model.UserEmail)) {
            this.invalidInputErrorMsg = '* Ugyldig epostadresse';
        } else {
            this.invalidInputErrorMsg = '';
            this.activate();
        }
    }

    isValidEmailAddress(email: string): boolean {
        // <something>@<something>.<something>
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    }

    activate() {
        this.busy = true;

        this.integrationService.purchaseTravelText(this.model).subscribe(
            () => {
                const purchase: ElsaPurchase = {
                    ID: null,
                    ProductID: this.product.ID
                };
                this.purchaseService.massUpdate([purchase]).subscribe(
                    () => {
                        this.product['_isBought'] = true;
                        this.busy = false;
                        this.step = 3;
                    },
                    err => {
                        this.errorService.handle(err);
                        this.busy = false;
                    }
                );
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    inviteUsers() {
        this.busy = true;

        const travelTextUsers: TravelTextInviteUsers[] = this.users.map(user => {
            return {
                Name: user.DisplayName,
                Email: user.Email,
                Deleted: !user['_selected'],
            };
        });

        this.integrationService.inviteUsersTravelText(travelTextUsers).subscribe(
            () => {
                this.busy = false;
                this.onClose.emit(false);
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    goToChooseUsers() {
        if (this.product['_isBought']) {
            this.isBought = true;
            this.initChooseUsers();
        }
    }

    close() {
        const activationCode = this.step === 3 ? ActivationEnum.ACTIVATED : ActivationEnum.NOT_ACTIVATED;
        this.onClose.emit(activationCode);
    }

    openLinkInNewTab(url: string) {
        window.open(url, '_blank');
    }
}
