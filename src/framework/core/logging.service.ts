import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { Injectable, ErrorHandler} from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class MonitoringService {
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
    this.appInsights.trackEvent({ name: name}, properties);
  }

  logMetric(name: string, average: number, properties?: { [key: string]: any }) {
    this.appInsights.trackMetric({ name: name, average: average }, properties);
  }

  logException(exception: Error, severityLevel?: number) {
    this.appInsights.trackException({ exception: exception, severityLevel: severityLevel });
  }

  logTrace(message: string, properties?: { [key: string]: any }) {
    this.appInsights.trackTrace({ message: message}, properties);
  }
}

@Injectable()
export class ErrorHandlerService extends ErrorHandler {

    constructor(private MonitoringService: MonitoringService) {
        super();
    }

    handleError(error: Error) {
        this.MonitoringService.logException(error); // Manually log exception
    }
}