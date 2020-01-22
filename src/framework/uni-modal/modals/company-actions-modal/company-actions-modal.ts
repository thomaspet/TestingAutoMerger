import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {environment} from 'src/environments/environment';

@Component({
    selector: 'company-actions-modal',
    templateUrl: './company-actions-modal.html',
    styleUrls: ['./company-actions-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class CompanyActionsModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    isSrEnvironment = environment.isSrEnvironment;

    constructor(private router: Router) {}

    navigate(url: string) {
        this.router.navigateByUrl(url).then(() => {
            this.onClose.emit();
        });
    }
}
