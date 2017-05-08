import {Injectable} from '@angular/core';

declare const Raygun;

@Injectable()
export class Logger {
    public exception(err: any) {
        console.error('EXCEPTION:', err);
        if (!(err instanceof Error)) {
            err = new Error(err)
        }
        Raygun.send(err);
    }
}
