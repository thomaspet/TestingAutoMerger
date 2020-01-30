import {ErrorHandler, Inject} from '@angular/core';
import {ErrorService} from './services/services';

export class UniAngularErrorHandler implements ErrorHandler {
    constructor(@Inject(ErrorService) private errorService: ErrorService) {}

    public handleError(err: any) {
        this.errorService.handleJSError(err);
    }
}
