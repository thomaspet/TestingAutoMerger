import { ErrorHandler, Inject } from '@angular/core';
import { ErrorService } from './services/common/ErrorService';
import { WrappedError } from '@angular/core/src/facade/errors';

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
        
        const originalError = this.findOriginalError(err);
        const originalStack = this.findOriginalStack(err);
        const context = this.findContext(err);

        console.error(`EXCEPTION: ${err.message || err.toString()}`);

        if (originalError) {
            console.error(`ORIGINAL EXCEPTION: ${originalError.message || originalError.toString()}`);
        }

        if (originalStack) {
            console.error('ORIGINAL STACKTRACE:');
            console.error(originalStack);
        }

        if (context) {
            console.error('ERROR CONTEXT:');
            console.error(context);
        }

        this.errorService.addErrorToast(this.errorService.extractMessage(err));

        throw err;
    }

    private findOriginalError(error: any): any {
        let e = (error as WrappedError).originalError;
        while (e && (e as WrappedError).originalError) {
            e = (e as WrappedError).originalError;
        }

        return e;
    }

    private findOriginalStack(error: any): string {
        if (!(error instanceof Error)) {
            return null;
        }

        let e: any = error;
        let stack: string = e.stack;
        while (e instanceof Error && (e as WrappedError).originalError) {
            e = (e as WrappedError).originalError;
            if (e instanceof Error && e.stack) {
                stack = e.stack;
            }
        }

        return stack;
    }

    private findContext(error: any): any {
        if (error) {
            return error.context ? error.context :
                this.findContext((error as WrappedError).originalError);
        }

        return null;
    }
}
