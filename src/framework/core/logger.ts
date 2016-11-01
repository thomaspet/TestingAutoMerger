import {Injectable} from '@angular/core';

declare const Raygun;

@Injectable()
export class Logger {
    public exception(e: any) {
        Raygun.send(e);
    }
}
