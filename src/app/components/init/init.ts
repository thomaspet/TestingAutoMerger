import {Component, ViewChild, ElementRef} from '@angular/core';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import * as $ from 'jquery';

@Component({
    selector: 'uni-init',
    templateUrl: './init.html',
})
export class UniInit {
    @ViewChild('registrationInput')
    private registrationInput: ElementRef;

    private working: boolean;
    private emailInput: string;
    private registrationFormExpanded: boolean;
    private marketingContentHidden: boolean;

    constructor(private toastService: ToastService) {
        // Try/catch to avoid crashing the app when localstorage has no entry
        try {
            this.marketingContentHidden = JSON.parse(localStorage.getItem('marketingContent_hidden'));
        } catch (e) {}
    }

    public toggleMarketingContent() {
        this.marketingContentHidden = !this.marketingContentHidden;
        localStorage.setItem('marketingContent_hidden', JSON.stringify(this.marketingContentHidden));
        this.registrationFormExpanded = false;
    }

    public onRegistrationButtonClick() {
        if (this.registrationFormExpanded) {
            this.register();
        } else {
            if (this.registrationInput) {
                $(this.registrationInput.nativeElement).show().animate({
                    width: '20rem'
                }, 500, () => {
                    this.registrationInput.nativeElement.focus();
                    this.registrationFormExpanded = true;
                });
            }
        }
    }

    public register() {
        if (this.working) {
            return;
        }

        if (this.emailInput && this.emailInput.length) {
            this.working = true;

            setTimeout(() => {
                this.working = false;
                this.toastService.addToast(
                    'Åpen registrering har ikke startet enda',
                    ToastType.warn,
                    0,
                    'Vennligst prøv igjen senere'
                );

            }, 1000);

        }
    }

}
