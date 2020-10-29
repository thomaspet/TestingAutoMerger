import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FieldType} from '@uni-framework/ui/uniform';
import {Account} from '@uni-entities';
import {OpeningBalanceService} from '@app/components/settings/opening-balance/openingBalanceService';
import {Router} from '@angular/router';

@Component({
    selector: 'opening-balance-guard-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <article>
                <i class="material-icons info">info</i>
                <p>
                    Det er allerede ført transaksjoner på aksjekapitalkontoen, som kan tyde på at inngående balanse allerede er registrert. Vil du allikevel registrere inngående balanse nyetablert firma?
                </p>
            </article>
            <footer>
                <button class="c2a" (click)="onClose.emit(true)">Ja</button>
                <button  (click)="onClose.emit(false)">Nei</button>
            </footer>
        </section>
    `
})
export class OpeningBalanceGuardModal implements IUniModal {
    @Output() onClose: EventEmitter<any> = new EventEmitter();
    constructor() {}
}
