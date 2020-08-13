import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FieldType} from '@uni-framework/ui/uniform';
import {Account} from '@uni-entities';
import {OpeningBalanceService} from '@app/components/settings/opening-balance/openingBalanceService';
import {Router} from '@angular/router';

@Component({
    selector: 'go-to-post-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <article>
                <i class="material-icons check_circle">check_circle</i>
                <p>
                    Åpningsbalanse er bokført med bilagsnummer
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
    constructor(private openingBalanceService: OpeningBalanceService, private router: Router) {
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

        this.router.navigateByUrl(`/accounting/transquery?JournalEntryNumber=${this.postNumber}&AccountYear=${this.financialYear}`);
        this.onClose.emit();
    }
}
