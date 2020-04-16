import { IUniModal } from '@uni-framework/uni-modal/interfaces';
import { IModalOptions } from '@uni-framework/uni-modal';
import { Input, EventEmitter, Output, Component } from '@angular/core';
import { UniSearchCustomerConfig, UniSearchSupplierConfig, PaymentInfoTypeService } from '@app/services/services';
import { IUniSearchConfig } from '../../../../framework/ui/unisearch/index';
import { StatusCodePaymentInfoType } from '@uni-entities';

@Component({
    selector: 'book-payment-manual-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{ options.header }}</header>
            <article style="min-height: 12rem;">
                <p>Velg en {{ options.data.isSupplier ? 'leverandør' : 'kunde'}} for betaling</p>
                <uni-search
                    [config]="uniSearchConfig"
                    (changeEvent)="subaccountSelected($event)"
                    [disabled]="false">
                </uni-search>
                <div *ngIf="isBalanceKIDCheckboxVisible" class="rememberForm">
                    <mat-checkbox [(ngModel)]="isBalanceKID">
                        Innbetaling er på en Saldo KID
                    </mat-checkbox>
				</div>
            </article>

            <footer>
                <button class="good" [disabled]="!selectedID" (click)="close(selectedID)">Bokfør valgt rad</button>
                <button class="bad" (click)="close(null)">Avbryt</button>
            </footer>
        </section>
    `
})
export class MatchSubAccountManualModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public selectedID: number;
    public uniSearchConfig: IUniSearchConfig;
    private customerExpands: string[] = [
        'Info.Addresses',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'Info.DefaultContact.Info',
        'Info.DefaultEmail',
    ];
    private paymentData: any;
    public isBalanceKIDCheckboxVisible: boolean = false;
    public isBalanceKID: boolean = false;

    constructor(
        private uniSearchCustomerConfig: UniSearchCustomerConfig,
        private paymentTypeService: PaymentInfoTypeService,
        private USSC: UniSearchSupplierConfig
    ) { }

    public ngOnInit() {
        this.uniSearchConfig = this.uniSearchCustomerConfig.generateForBank(this.customerExpands);

        if (this.options.data.isSupplier) {
            this.uniSearchConfig = this.USSC.generate( ['Info', 'Info.BankAccounts', 'Info.DefaultBankAccount']);
        }

        // Get all kid types with same length, if one of them is balancekid set isBalanceKID to true
        // if more are found give user the option to override
        this.paymentData = this.options.data.model;
        if (this.paymentData.PaymentPaymentID) {
            this.paymentTypeService.GetAll(`filter=Length eq '${this.paymentData.PaymentPaymentID.length}'
                and StatusCode eq ${StatusCodePaymentInfoType.Active}`).subscribe(data => {
                if (data && data.length > 0) {
                    this.isBalanceKID = true;
                    this.isBalanceKIDCheckboxVisible = data.length > 1; // there are more then one options so let user decide.
                }
            });
        }
    }

    public subaccountSelected(account) {
        this.selectedID = account.ID;
    }

    public close(subAccountID:  number | null) {
        this.onClose.emit({subAccountID, isBalanceKID: this.isBalanceKID});
    }

}
