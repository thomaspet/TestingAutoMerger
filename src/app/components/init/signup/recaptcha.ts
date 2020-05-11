import {Component, Output, ElementRef, EventEmitter, NgZone} from '@angular/core';
import {environment} from 'src/environments/environment';

declare const grecaptcha: any;

declare global {
    interface Window {
        grecaptcha: any;
        reCaptchaLoad: () => void;
    }
}

@Component({
    selector: 'uni-recaptcha',
    template: '',
})
export class UniRecaptcha {
    @Output() reCaptchaCode = new EventEmitter<string>();
    @Output() reCaptchaExpired = new EventEmitter();

    scriptElement;

    constructor(
        private elementRef: ElementRef,
        private ngZone: NgZone
    ) {}

    ngOnInit() {
        this.addScript();
    }

    ngOnDestroy() {
        if (this.scriptElement) {
            this.scriptElement.remove();
        }
    }

    reset() {
        grecaptcha.reset();
    }

    private addScript() {
        window.reCaptchaLoad = () => {
            const config = {
                'sitekey': environment.RECAPTCHA_KEY,
                // Run callbacks with NgZone to trigger change detection
                // (Angular won't automatically react to these callbacks since they happen outside the change detection zone)
                'callback': (token) => this.ngZone.run(() => this.reCaptchaCode.next(token)),
                'expired-callback': () => {
                    this.ngZone.run(() => {
                        this.reCaptchaExpired.emit();
                        this.reCaptchaCode.emit();
                    });
                }
            };

            grecaptcha.render(this.elementRef.nativeElement, config);
        };

        this.scriptElement = document.createElement('script');
        this.scriptElement.src = `https://www.google.com/recaptcha/api.js?onload=reCaptchaLoad&render=explicit`;
        this.scriptElement.async = true;
        this.scriptElement.defer = true;
        document.body.appendChild(this.scriptElement);
    }
}
