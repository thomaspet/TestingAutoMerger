import {Injectable} from '@angular/core';
import * as raygun from 'raygun4js';
import {RAYGUN_API_KEY} from 'src/environments/raygun';
import {APP_METADATA} from 'src/environments/metadata';
import {environment} from 'src/environments/environment';
import {AppInsights} from 'applicationinsights-js';

@Injectable()
export class Logger {
    private raygunEnabled: boolean;
    private appInsightsEnabled: boolean;

    constructor() {
        if (RAYGUN_API_KEY) {
            raygun('apiKey', RAYGUN_API_KEY);
            raygun('setVersion', APP_METADATA.GIT_REVISION);
            raygun('enableCrashReporting', false); // we control what's logged

            this.raygunEnabled = true;
        }

        const isDevBuild = window.location.host && window.location.host.includes('localhost');
        if (!isDevBuild && environment.APP_INSIGHTS_KEY) {
            this.appInsightsEnabled = true;
            if (!AppInsights.config) {
                AppInsights.downloadAndSetup({
                    instrumentationKey: environment.APP_INSIGHTS_KEY,
                });

                AppInsights.queue.push(() => {
                    AppInsights.context.addTelemetryInitializer(envelope => {
                        envelope.tags['ai.cloud.role'] = 'UE Frontend';
                    });
                });
            }
        }
    }

    log(err: any) {
        const error = err instanceof Error ? err : new Error(err);
        if (this.raygunEnabled) {
            try {
                raygun('send', { error: error });
            } catch (e) {}
        }

        if (this.appInsightsEnabled) {
            const location = window.location.href.split('/#/')[1] || '';
            const metadata = {
                version: APP_METADATA.GIT_REVISION,
                companyKey: localStorage.getItem('lastActiveCompanyKey') || ''
            };

            AppInsights.trackException(error, location, metadata);
        }
    }
}
