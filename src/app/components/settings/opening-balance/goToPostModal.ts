import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {OpeningBalanceService} from '@app/components/settings/opening-balance/openingBalanceService';

@Component({
    selector: 'go-to-post-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <article>
                <i class="material-icons check_circle">check_circle</i>
                <p>
                    Inngående balanse nyetablert firma er bokført med bilagsnummer
                    <a (click)="navigateToPost($event)">{{postNumber}}-{{financialYear}}</a>
                </p>
            </article>
            <footer>
                <button class="c2a" (click)="onClose.emit()">Lukk</button>
            </footer>
        </section>
    `
})
export class GoToPostModal implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose: EventEmitter<any> = new EventEmitter();
    financialYear: number;
    postNumber = 0;
    constructor(private openingBalanceService: OpeningBalanceService) {
        this.financialYear = this.openingBalanceService.getActiveFinancialYear().Year;
    }

    ngOnInit() {
        const [postNumber, year] = this.options.data.postNumber.split('-');
        this.financialYear = year;
        this.postNumber = postNumber;
    }

    navigateToPost($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.onClose.emit({
            postNumber: this.postNumber,
            financialYear: this.financialYear
        });
    }
}
