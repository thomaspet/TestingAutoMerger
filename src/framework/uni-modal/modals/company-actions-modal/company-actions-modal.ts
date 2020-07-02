import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Router} from '@angular/router';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'company-actions-modal',
    templateUrl: './company-actions-modal.html',
    styleUrls: ['./company-actions-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class CompanyActionsModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    isSrEnvironment = theme.theme === THEMES.SR;
    isBrunoEnvironment = theme.theme === THEMES.EXT02;
    constructor(private router: Router) {}

    navigate(url: string) {
        this.router.navigateByUrl(url).then(() => {
            this.onClose.emit();
        });
    }
}
