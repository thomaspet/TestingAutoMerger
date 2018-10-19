import {Injectable} from '@angular/core';

declare const Raygun;

@Injectable()
export class Logger {
    public exception(err: any) {
        console.error('EXCEPTION:', err);
        const error = err instanceof Error ? err : new Error(err);

        if (Raygun && Raygun.send) {
            Raygun.send(error);
        }
    }
}
