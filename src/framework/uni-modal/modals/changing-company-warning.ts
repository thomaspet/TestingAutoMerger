import {Component, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
    selector: 'changing-company-warning',
    template: `
        <section role="dialog" style="width: 40rem" class="uni-modal">
            <header>Advarsel om selskapsbytte</header>

            <article>
                <section style="margin: .5rem 0" class="alert warn">
                    Dersom du har ulagrede endringer vil disse forkastes ved bytte av selskap.
                </section>
            </article>

            <footer>
                <mat-checkbox class="pull-left" [(ngModel)]="dontShowAgain">
                    Ikke vis denne meldingen igjen
                </mat-checkbox>

                <button
                    class="secondary"
                    (click)="close(false)">
                    Avbryt
                </button>

                <button
                    class="c2a"
                    style="width: 9rem"
                    (click)="close(true)">
                    Bytt selskap
                </button>
            </footer>
        </section>
    `
})
export class ChangingCompanyWarning implements IUniModal {
    @ViewChild(MatCheckbox) checkbox: MatCheckbox;

    options: IModalOptions = {};
    onClose = new EventEmitter();

    dontShowAgain = false;

    ngAfterViewInit() {
        this.checkbox?.focus();
    }

    close(changeCompany: boolean) {
        this.onClose.emit({
            canChangeCompany: changeCompany,
            hideWarning: this.dontShowAgain
        });
    }
}
