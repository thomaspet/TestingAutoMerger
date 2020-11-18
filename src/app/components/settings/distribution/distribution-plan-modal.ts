import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ConfirmActions, IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {
    DistributionPlanService,
    ElsaPurchaseService,
    EHFService,
    ErrorService,
    CompanySettingsService,
    ElsaProductService
} from '@app/services/services';
import {
    DistributionPlanElementType,
    CompanySettings
} from '@uni-entities';
import {
    UniActivateAPModal,
    UniModalService,
    UniActivateInvoicePrintModal,
    UniActivateEInvoiceModal
} from '@uni-framework/uni-modal';
import {theme, THEMES} from 'src/themes/theme';

import * as _ from 'lodash';
import { Observable } from 'rxjs';
import {ElsaAgreementStatus, ElsaPurchase} from '@app/models';

export enum TypeStatusCode {
    InActive = null,
    Ready = 30001,
    NeedsActivation = 30002,
    NeedsPurchase = 30003,
    ContinueSettings = 30004,
    ContinueMarkedPlace = 30005,
}

@Component({
    selector: 'distribution-plan-modal',
    templateUrl: './distribution-plan-modal.html'
})

export class DistributionPlanModal implements OnInit, IUniModal {
    @Input()
    options: IModalOptions = {};

    @Input()
    companySettings: CompanySettings;

    @Output()
    onClose: EventEmitter<any> = new EventEmitter();

    currentPlan: any;

    types: DistributionPlanElementType[];
    currentType: any;
    busy: boolean = true;
    setAsCompanyDefault: boolean = true;
    isAlreadyDefault: boolean = false;

    deletedElements: any[] = [];
    indexAndID = [];

    purchases;

    constructor (
        private router: Router,
        private toast: ToastService,
        private distributionPlanService: DistributionPlanService,
        private elsaPurchasesService: ElsaPurchaseService,
        private elsaProductService: ElsaProductService,
        private ehfService: EHFService,
        private modalService: UniModalService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService
    ) { }

    ngOnInit() {
        this.currentPlan = _.cloneDeep(this.options.data.plan);
        this.currentType = this.options.data.currentType;
        this.refreshDataAndTypes();
    }

    refreshDataAndTypes() {
        this.busy = true;
        Observable.forkJoin(
            this.companySettingsService.Get(1, ['APOutgoing', 'APIncomming']),
            this.elsaPurchasesService.getAll(),
            this.distributionPlanService.getElementTypes()
        ).subscribe(([cs, purchases, types]) => {
            this.companySettings = cs;
            this.purchases = purchases;
            this.types = this.filterElementTypes(this.currentType.value, types);
            this.initializeElements();
        }, err => {
            this.busy = false;
            this.toast.addToast('Noe gikk galt', ToastType.warn, 8);
        });
    }

    initializeElements() {
        if (this.currentPlan?.ID) {
            this.setAsCompanyDefault = this.currentType?.defaultPlan?.ID === this.currentPlan.ID;
            this.isAlreadyDefault = this.setAsCompanyDefault;
        }

        if (!this.currentPlan.ID && !this.currentPlan.Elements.length) {
            this.addEmptyPriority();
        }

        this.types.map((type: DistributionPlanElementType) => {
            type = this.mapPurchaseToType(type);
            return type;
        });

        this.types = this.types.sort((a, b) => {
            return a.StatusCode === b.StatusCode ? 0 : a.StatusCode > b.StatusCode ? 1 : -1;
        });

        if (this.indexAndID?.length === 2) {
            const type = this.types.find(t => t.ID === this.indexAndID[1]);
            this.onTypeChange(type, this.indexAndID[0]);
            this.indexAndID = [];
        }

        this.busy = false;
    }

    mapPurchaseToType(type: DistributionPlanElementType): DistributionPlanElementType {
        let item;
        switch (type.Name) {
            case 'Email':
                type.StatusCode = TypeStatusCode.Ready;
                break;
            case 'EHF':
                // EXT02 has EHF_OUT activated by default, will always be on!
                if (theme.theme === THEMES.EXT02) {
                    type.StatusCode = 30001;
                    break;
                } else {
                    item = this.purchases.find(p => p.ProductName.toLowerCase() === 'ehf_out');
                    if (item) {
                        type.StatusCode = TypeStatusCode.Ready;
                    }
                    type['ProductName'] = 'EHF_OUT';
                    break;
                }
            case 'Fakturaprint':
                item = this.purchases.find(p => p.ProductName.toLowerCase().includes('invoiceprint'));
                if (item) {
                    type.StatusCode = this.ehfService.isInvoicePrintActivated(this.companySettings)
                        ? TypeStatusCode.Ready : TypeStatusCode.NeedsActivation;
                }
                type['ProductName'] = 'INVOICEPRINT';
                break;
            case 'AvtaleGiro + efaktura':
            case 'Efaktura':
                item = this.purchases.find(p => p.ProductName.toLowerCase().includes('efakturab2c'));
                if (item) {
                    type.StatusCode = this.companySettings.NetsIntegrationActivated
                        ? TypeStatusCode.Ready : TypeStatusCode.NeedsActivation;
                }
                type['ProductName'] = 'eFakturab2c';
                break;

            case 'Vippsinvoice':
                item = this.purchases.find(p => p.ProductName.toLowerCase().includes('vipps_invoice'));
                if (item) {
                    type.StatusCode = 30001;
                }
                type['ProductName'] = 'VIPPS_INVOICE';
                break;

            case 'Factoring':
                type.StatusCode = this.companySettings.FactoringNumber ? TypeStatusCode.Ready : TypeStatusCode.ContinueSettings;
                break;

            case 'AvtaleGiro':
                type.StatusCode = TypeStatusCode.Ready;
                break;
        }
        // If null, set to 30003 = buy
        type.StatusCode = type.StatusCode || TypeStatusCode.NeedsPurchase;
        return type;
    }

    getButtonText(statusCode: number) {
        switch (statusCode) {
            case TypeStatusCode.NeedsActivation:
                return 'Aktiver';
            case TypeStatusCode.NeedsPurchase:
                return 'Kjøp';
            case TypeStatusCode.ContinueSettings:
                return 'Innstillinger';
            case TypeStatusCode.ContinueMarkedPlace:
            default:
                return 'Markedsplass';
        }
    }

    getTitleText(statusCode: number) {
        switch (statusCode) {
            case TypeStatusCode.NeedsActivation:
                return 'Aktiver produkt for å bruke utsendelsesmetoden';
            case TypeStatusCode.NeedsPurchase:
                return 'Kjøp og aktiver produkt for å bruke utsendelsesmetoden';
            case TypeStatusCode.ContinueSettings:
                return 'Produktet krever mer informasjon i salgsinnstillinger før bruk';
            case TypeStatusCode.ContinueMarkedPlace:
                return 'Dette produktet kan ikke kjøpes fra dette bildet. Gå til markedsplass for å utforske produktet. Ulagrede endringer blir fjernet.';
            default:
                return '';
        }
    }

    saveOrCreate() {

        this.currentPlan.Elements = this.currentPlan.Elements.filter(e => !!e.DistributionPlanElementTypeID);

        // Check for duplicates
        if (new Set(this.currentPlan.Elements.map(el => parseInt
            (el.DistributionPlanElementTypeID, 10) )).size !==  this.currentPlan.Elements.length) {
            this.toast.addToast('Lagring avbrutt', ToastType.warn, ToastTime.medium,
            'Kan ikke lagre plan med duplikate prioriteringer. Sjekk verdier og prøv igjen.');
            return;
        } else if (!this.currentPlan.Name) {
            this.toast.addToast('Lagring avbrutt', ToastType.warn, ToastTime.medium, 'Kan ikke lagre plan uten navn.');
        } else {
            this.currentPlan.Elements.map((el: any, index: number) => {
                el.Priority = index + 1;
                el.ElementType = null;
                return el;
            });
        }

        // Reattach deleted elements to delete them
        this.currentPlan.Elements = this.currentPlan.Elements.concat(this.deletedElements);
        this.busy = true;
        this.distributionPlanService.saveDistributionPlan(this.currentPlan).subscribe((plan) => {
            this.busy = false;
            this.onClose.emit({
                setAsDefault: this.setAsCompanyDefault,
                plan: plan
            });
        }, err => {
            this.busy = false;
            this.toast.addToast('Lagring feilet', ToastType.warn, ToastTime.medium,
                'Kunne ikke lagre plan. Sjekk data eller prøv igjen senere');
        });
    }

    addEmptyPriority() {
        if (this.currentPlan.Elements.length >= this.types.length || this.currentPlan.Elements.length === 5) {
            const errorMsg = this.currentPlan.Elements.length >= this.types.length
            ? 'Alle tilgjengelige utsendelsesmetoder for denne entitet er allerede lagt til i planen.'
            : 'En plan kan ikke ha mer enn 5 utsendelsesmetoder';
            this.toast.addToast('Kan ikke legge til', ToastType.info, ToastTime.short, errorMsg);
            return;
        }

        this.currentPlan.Elements.push({
            ElementType: { Name : ''},
            DistributionPlanElementTypeID: 0,
            DistributionPlanID: this.currentPlan.ID,
            ID: 0,
            _createguid: this.distributionPlanService.getNewGuid()
        });
    }

    deletePriority(index) {
        const deletedElement = this.currentPlan.Elements.splice(index, 1)[0];
        if (deletedElement.ID) {
            deletedElement.Deleted = true;
            this.deletedElements.push(deletedElement);
        }
    }

    buyType(type: DistributionPlanElementType, index: number) {
        this.indexAndID = [index, type.ID];
        switch (type.ID) {
            case 1:  // EHF_OUT
                this.activateProduct(type, null);
                break;
            case 3:  // FAKTURAPRINT
                this.activateProduct(type, UniActivateInvoicePrintModal);
                break;
            case 4:  // EFAKTURA
                this.activateProduct(type, UniActivateEInvoiceModal);
                break;
            case 5: // FACTORING
                this.onClose.emit(null);
                this.router.navigateByUrl('/settings/sales?index=0');
                break;
            case 6:  // VIPPS
                this.purhcaseItem(type);
                break;
            case 7:  // AVTALEGIRO & EFAKTURA + AVTALEGIRO
            case 8:
                this.onClose.emit(null);
                this.router.navigateByUrl('/marketplace/modules');
                break;
        }
    }

    onTypeChange(type: any, i: number) {
        if (type.StatusCode !== TypeStatusCode.Ready && type.StatusCode !== TypeStatusCode.NeedsActivation) {
            return;
        }

        this.currentPlan.Elements[i].DistributionPlanElementTypeID = type.ID;
        this.currentPlan.Elements[i].ElementType = type;
    }

    close() {
        this.onClose.emit(false);
    }

    activateProduct(type: any, modal: any) {
        this.busy = true;
        this.elsaPurchasesService.getPurchaseByProductName(type.ProductName).subscribe(purchase => {
            if (purchase) {
                this.openActivateModal(modal);
            } else {
                this.purhcaseItem(type, modal);
            }
        }, err => {
            this.toast.addToast('Noe gikk galt ved kjøp.', ToastType.warn, 10, 'Gå til markedsplassen for å kjøpe produktet.');
            this.busy = false;
        });
    }

    openActivateModal(modal: any) {
        this.modalService.open(modal).onClose.subscribe(() => {
            this.refreshDataAndTypes();
        }, err => this.errorService.handle(err));
    }

    private purhcaseItem(type, modal?) {
        this.elsaProductService.FindProductByName(type.ProductName).subscribe(product => {
            if (product) {
                const purchase: ElsaPurchase = {
                    ID: null,
                    ProductID: product.ID
                };

                if (!modal && product.ProductAgreement?.AgreementStatus === ElsaAgreementStatus.Active) {
                    this.modalService.confirm({
                        header: product.ProductAgreement.Name,
                        message: product.ProductAgreement.AgreementText,
                        isMarkdown: true,
                        class: 'medium',
                        buttonLabels: {
                            accept: 'Aksepter',
                            cancel: 'Tilbake'
                        }
                    }).onClose.subscribe(response => {
                        if (response === ConfirmActions.ACCEPT) {
                            this.purchaseProduct(purchase);
                        } else {
                            this.busy = false;
                        }
                    });
                } else {
                    this.purchaseProduct(purchase, modal);
                }
            } else {
                this.busy = false;
                this.toast.addToast('Klarte ikke finne produktet');
            }
        });

    }

    private purchaseProduct(purchase: ElsaPurchase, modal?) {
        this.elsaPurchasesService.massUpdate([purchase]).subscribe(() => {
            if (modal) {
                this.openActivateModal(modal);
            } else {
                this.refreshDataAndTypes();
            }
        }, err => {
            this.toast.addToast('Noe gikk galt ved kjøp.', ToastType.warn, 10, 'Gå til markedsplassen for å kjøpe produktet.');
            this.busy = false;
        });
    }

    private filterElementTypes(type: string, elementTypes: DistributionPlanElementType[]) {
        if (type === 'Models.Sales.CustomerInvoice') {
            return elementTypes;
        } else if (type === 'Models.Sales.CustomerInvoiceReminder') {
            return elementTypes.filter(res => res.ID === 2 || res.ID === 3);
        } else {
            return elementTypes.filter(res => res.ID === 2);
        }
    }
}
