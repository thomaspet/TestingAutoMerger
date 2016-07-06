import {Component} from '@angular/core';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';

@Component({
    selector: 'toast-demo',
    template: `<button (click)="showToasts()">Vis toasts</button>`
})
export class UniToastDemo {
    constructor(private toastService: ToastService) {}

    private showToasts() {
        const errorMessage = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas non molestie risus. Vestibulum ac nulla ac sapien fermentum egestas. Etiam erat ipsum, vehicula vel turpis eget, blandit scelerisque magna. Integer dapibus fermentum risus quis suscipit. Pellentesque in dolor varius, dictum urna eget, dignissim ipsum.';

        this.toastService.addToast('Noe gikk galt under tidsreisen', ToastType.bad, 0, errorMessage);
        this.toastService.addToast('Nå må du passe deg', ToastType.warn);
        this.toastService.addToast('Dette gikk over all forventning', ToastType.good);
        this.toastService.addToast('Denne forsvinner om 3 sekunder', ToastType.good, 3);
    }
}
