import {Injectable} from '@angular/core';
import {WrappedError} from '@angular/core/src/facade/errors';

declare const Raygun;

@Injectable()
export class Logger {
    public exception(err: any) {
        Raygun.send(err);

        console.error('EXCEPTION:', err);
    }
}
