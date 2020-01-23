import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { Input, Output, EventEmitter, Component } from '@angular/core';
import { IUniSearchConfig } from '@uni-framework/ui/unisearch';
import { UniSearchAccountConfig } from '@app/services/services';


@Component({
    selector: 'match-account-manual-modal',
    template: `
        <section role="dialog" class="uni-modal xs">
            <header>{{ options.header }}</header>
            <article style="min-height: 12rem;">
                <p>Velg hovedbokskonto for betaling</p>
                <uni-search
                    [config]="uniSearchConfig"
                    (changeEvent)="mainAccountSelected($event)"
                    [disabled]="false">
                </uni-search>
                <small *ngIf="showErrorMsg" style="color: var(--color-bad); margin-top: 1rem; display: block;">
                    *Du har valgt bokføring mot systemets interrimskonto innbetaling. Vi anbefaler å bokføre mot annen
                    hovedbokskonto enn denne. Ved bokføring med hovedbokskonto lik interrimskonto innbetaling
                    vil bilaget få debet/kredit på interrimskonto innbetaling.
                </small>
            </article>

            <footer>
                <button class="c2a" [disabled]="!selectedID" (click)="close(selectedID)">Bøkfor valgt rad</button>
                <button class="secondary bad" (click)="close(null)">Avbryt</button>
            </footer>
        </section>
    `
})
export class MatchMainAccountModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    selectedID: number;
    showErrorMsg: boolean = false;
    uniSearchConfig: IUniSearchConfig;

    constructor(
        private uniSearchAccountConfig: UniSearchAccountConfig
    ) {}

    public ngOnInit(): void {
        this.uniSearchConfig = this.uniSearchAccountConfig.generateOnlyMainAccountsConfig();
    }

    public mainAccountSelected(account) {
        this.showErrorMsg = this.options.data && this.options.data.interrimsAccount && this.options.data.interrimsAccount === account.ID;
        this.selectedID = account.ID;
    }

    public close(accountID: number | null) {
        this.onClose.emit({accountID});
    }
}
