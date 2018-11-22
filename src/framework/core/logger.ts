import {Injectable} from '@angular/core';
import * as raygun from 'raygun4js';
import {RAYGUN_API_KEY} from 'src/environments/raygun';
import {APP_METADATA} from 'src/environments/metadata';

@Injectable()
export class Logger {
    private raygunEnabled: boolean;

    constructor() {
        if (RAYGUN_API_KEY) {
            raygun('apiKey', RAYGUN_API_KEY);
            raygun('setVersion', APP_METADATA.GIT_REVISION);
            raygun('enableCrashReporting', true);

            this.raygunEnabled = true;
        }
    }

    log(err: any) {
        if (this.raygunEnabled) {
            const error = err instanceof Error ? err : new Error(err);
            try {
                raygun('send', { error: error });
            } catch (e) {}
        }
    }
}
