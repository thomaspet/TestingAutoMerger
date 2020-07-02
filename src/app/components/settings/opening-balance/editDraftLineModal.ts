import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FieldType} from '@uni-framework/ui/uniform';
import {Account} from '@uni-entities';
import {OpeningBalanceService} from '@app/components/settings/opening-balance/openingBalanceService';

@Component({
    selector: 'edit-draftline-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{model?.Description ? 'Redigere konto' : 'Legg til ny'}}</header>
            <article>
                <uni-form
                    [fields]="fields"
                    [config]="{autofocus: true, showLabelAbove: true}"
                    [model]="model"
                ></uni-form>
            </article>
            <footer>
                <button class="secondary" (click)="onClose.emit()">Avbryt</button>
                <button class="c2a" (click)="onClose.emit(model)">Fullfør</button>
            </footer>
        </section>
    `
})
export class EditDraftLineModal implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose: EventEmitter<any> = new EventEmitter();
    model: any = {};
    fields = [
        {
            Property: 'Description',
            Label: 'Beskrivelse',
            FieldType: FieldType.TEXT,
        },
        {
            Property: 'AmountCurrency',
            Label: 'Beløp',
            FieldType: FieldType.NUMERIC,
            Options: {
                decimalLength: 2,
                decimalSeparator: ','
            }
        },
        {
            Property: 'FromAccountID',
            Label: 'Fra konto (kredit)',
            FieldType: FieldType.AUTOCOMPLETE,
            Options: {
                search: this.openingBalanceService.accountSearch.bind(this.openingBalanceService),
                template: (account: Account) => account ? `${account.AccountNumber} ${account.AccountName }` : '',
                valueProperty: 'ID',
                getDefaultData: (() => this.openingBalanceService.getAccount
                    .bind(this.openingBalanceService)(this.model?.FromAccountID))
            }
        },
        {
            Property: 'ToAccountID',
            Label: 'Til konto (debet)',
            FieldType: FieldType.AUTOCOMPLETE,
            Options: {
                search: this.openingBalanceService.accountSearch.bind(this.openingBalanceService),
                template: (account: Account) => account ? `${account.AccountNumber} ${account.AccountName }` : '',
                valueProperty: 'ID',
                getDefaultData: (() => this.openingBalanceService.getAccount
                    .bind(this.openingBalanceService)(this.model?.ToAccountID))
            }
        }
    ];

    constructor(private openingBalanceService: OpeningBalanceService) {
    }

    ngOnInit() {
        if (this.options?.data?.draftline) {
            this.model = this.options.data.draftline;
        }
    }
}
