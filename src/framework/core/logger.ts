import { Injectable } from '@angular/core';
import { APP_METADATA } from 'src/environments/metadata';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from 'src/environments/environment';

@Injectable()
export class Logger {
    appInsights: ApplicationInsights;

    constructor() {        
        this.appInsights = new ApplicationInsights({
            config: {
                instrumentationKey: environment.APP_INSIGHTS_KEY,
                enableAutoRouteTracking: true // option to log all route changes
            }
        });
        this.appInsights.loadAppInsights();
        this.appInsights.addTelemetryInitializer((telemetryItem) => {
            telemetryItem.tags['ai.cloud.role'] = 'UE Frontend';
        });
    }

    logPageView(name?: string, url?: string) {
        this.appInsights.trackPageView({
            name: name,
            uri: url
        });
    }

    logEvent(name: string, properties?: { [key: string]: any }) {
        this.appInsights.trackEvent({ name: name }, properties);
    }

    logMetric(name: string, average: number, properties?: { [key: string]: any }) {
        this.appInsights.trackMetric({ name: name, average: average }, properties);
    }

    logError(err: any, severityLevel?: number) {
        const error = err instanceof Error ? err : new Error(err);        
        this.appInsights.trackException({ exception: error, severityLevel: severityLevel });
    }

    logTrace(message: string, properties?: { [key: string]: any }) {
        this.appInsights.trackTrace({ message: message }, properties);
    }
}

