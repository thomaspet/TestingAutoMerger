import {Injectable} from '@angular/core';

declare const Raygun;

@Injectable()
export class Logger {
    public exception(e: any) {
        Raygun.send(e);
        const message = 'Sent this error to Raygyn:';
        console.error ? console.error(message, e) : console.log(message, e);
    }
}
