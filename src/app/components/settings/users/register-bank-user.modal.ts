import {Component, EventEmitter, Output} from '@angular/core';
import {IUniModal} from '@uni-framework/uniModal/interfaces';
import fields from './register-bank-user.form';



@Component({
    selector: 'uni-register-bank-user-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header><h1>Legg til bruker som bankbruker</h1></header>
            <p role="alert" class="bad" *ngIf="errorMatch">
                passordet bør samsvare
            </p>
            <p role="alert" class="bad" *ngIf="errorPhone">
                Ugyldig telefonnummer. Det skal være et norsk telefonnummer
            </p>
            <article>
                
                <uni-form
                    [config]="{}"
                    [fields]="fields"
                    [model]="bankUserData">
                </uni-form>

                <footer>
                    <button (click)="accept()" class="good">Lagre og lukk</button>
                    <button (click)="close()" class="bad">Avbryt</button>
                </footer>
            </article>
        </section>
    `
})
export class UniRegisterBankUserModal implements IUniModal {
    @Output() onClose: EventEmitter<any> = new EventEmitter<any>(true);
    fields = fields;
    errorMatch = false;
    errorPhone = false;
    bankUserData = {
        Password: '',
        RepeatedPassword: '',
        Phone: '',
        IsAdmin: false
    };

    accept() {
        this.errorMatch = false;
        this.errorPhone = false;
        if (!this.matchPasswords(this.bankUserData)) {
            this.errorMatch = true;
            return;
        }
        if (!this.validatePhone(this.bankUserData)) {
            this.errorPhone = true;
            return;
        }
        this.errorMatch = false;
        this.errorPhone = false;
        this.onClose.emit(this.bankUserData);
    }

    close() {
        this.onClose.emit(false);
    }

    private matchPasswords(data) {
        if (data.Password !== '' && data.Password === data.RepeatedPassword) {
            return true;
        }
        return false;
    }

    private validatePhone(data) {
        const test1 = /^\d{8}$/.test(data.Phone);
        const test2 = /^0047\d{8}$/.test(data.Phone);
        const test3 = /^\+47\d{8}$/.test(data.Phone);
        if (test1 || test2 || test3) {
            return true;
        } else {
            return false;
        }
    }
}
