import {Component} from '@angular/core';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';

@Component({
    selector: 'toast-demo',
    template: `<button (click)="showToasts()">Vis toasts</button>`
})
export class UniToastDemo {
    constructor(private toastService: ToastService) {}

    private showToasts() {
        this.toastService.addToast('Noe gikk galt under tidsreisen');
        this.toastService.addToast('Nå må du passe deg', ToastType.warn);
        this.toastService.addToast('Dette gikk over all forventning', ToastType.good);
        this.toastService.addToast('Denne forsvinner om 3 sekunder', ToastType.good, 3);
    }
}
