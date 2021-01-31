import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserService } from '@app/services/services';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';

@Component({
    selector: 'uni-bank-bankid',
    template: ``,
})

export class UniBankId {

    onDestroy$ = new Subject();

    constructor(
        private activeRoute: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private modalService: UniModalService,
    ) {         
        this.activeRoute.paramMap.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(() => {
            const state = this.activeRoute.snapshot.queryParamMap.get('state');
            if (state)
            {
                // Check if user is verified now
                this.userService.isBankIdVerified().subscribe(ok => {
                    let path = atob(state);
                    if (ok) {
                        this.router.navigateByUrl(`${path}&verified=true`);
                    }
                    else {
                        this.modalService.confirm({
                            header: 'BankID ikke verifisert',
                            message: 'Du er fortsatt ikke verifisert med BankID hos ZData. Forsøke å verifisere med BankID hos ZData på nytt?',
                            buttonLabels: {
                                accept: 'Ja',
                                cancel: 'Nei'
                            }
                        }).onClose.subscribe(confirm => {
                            if (confirm === ConfirmActions.ACCEPT) { // Retry BankID verification
                                window.location.href = this.userService.getBankIdRedirectUrl(path);
                            }
                            else // Go back
                            {
                                this.router.navigateByUrl(`${path}&verified=false`);
                            }
                        });
                    }
                });
            }
            else // No state, just redirect to home
            {
                this.router.navigateByUrl('/');
            }
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
