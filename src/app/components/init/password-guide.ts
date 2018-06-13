import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';

@Component({
    selector: 'uni-password-guide',
    template: `
        <ul class="password-validation">
            <li [ngClass]="{'completed': passwordLength}">
                Mer enn 8 tegn
            </li>

            <li [ngClass]="{'completed': upperCase}">
                Stor bokstav
            </li>

            <li [ngClass]="{'completed': lowerCase}">
                Liten bokstav
            </li>

            <li [ngClass]="{'completed': numOrSymbol}">
                Tall eller symbol
            </li>
        </ul>
    `
})
export class UniPasswordGuide {
    @Input() public passwordControl: FormControl;

    public passwordLength: boolean;
    public lowerCase: boolean;
    public upperCase: boolean;
    public numOrSymbol: boolean;

    private componentDestroyed: Subject<any> = new Subject();

    public ngOnChanges() {
        if (this.passwordControl) {
            this.passwordControl.valueChanges
                .takeUntil(this.componentDestroyed)
                .subscribe((value: string) => {
                    this.passwordLength = value.length >= 8;
                    this.upperCase = /[A-Z]/.test(value);
                    this.lowerCase = /[a-z]/.test(value);
                    this.numOrSymbol =
                        /[\d\@\#\$\%\^\&\*\-_\\+\=\[\]\{\}\|\\\:\‘\,\.\?\/\`\~\“\(\)\;]/.test(value);
                });
        }
    }

    public ngOnDestroy() {
        this.componentDestroyed.next();
    }

}
