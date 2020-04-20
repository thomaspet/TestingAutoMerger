import { ErrorHandler, Inject, Injectable } from '@angular/core';
import {ErrorService} from './services/services';

@Injectable()
export class UniAngularErrorHandler implements ErrorHandler {
    constructor(@Inject(ErrorService) private errorService: ErrorService) {}

    public handleError(err: any) {
        this.errorService.handleJSError(err);
    }
}
