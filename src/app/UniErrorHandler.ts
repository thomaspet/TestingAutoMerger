import {ErrorHandler, Inject} from '@angular/core';
import {ErrorService} from './services/services';

type WrappedError = {
    originalError: string | WrappedError
};

declare const Raygun;

export class UniMicroAngularInternalErrorHandlerOverride implements ErrorHandler {
    private errorService: ErrorService;

    constructor( @Inject(ErrorService) errorService) {
        this.errorService = errorService;
    }

    public handleError(err: any) {
        if (typeof (Raygun) !== 'undefined') {
            Raygun.send(err);
        }

        console.error(`EXCEPTION: ${err.message || err.toString()}`);

        const context = this.findContext(err);
        if (context) {
            console.error(`CONTEXT: ${context}`);
        }

        const stack = err.stack || err.originalStack;
        console.error(`STACK: ${stack}`);


        this.errorService.addErrorToast(this.errorService.extractMessage(err));
        throw err;
    }


    private findContext(error: any): any {
        if (error) {
            return error.context ? error.context :
                this.findContext((error as WrappedError).originalError);
        }

        return null;
    }
}
