import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { accountingRouteMap, salesRouteMap, salaryRouteMap, timetrackingRouteMap, commonRouteMap } from '../notifications/entity-route-map';
import { BusinessObject } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class ChatBoxService {
    businessObjects: BehaviorSubject<BusinessObject[]> = new BehaviorSubject([]);

    constructor() {}

    getBusinessObjectRoute(businessObject: BusinessObject) {
        const entityType = businessObject.EntityType.toLowerCase();
        let route = '';

        if (accountingRouteMap[entityType]) {
            route = '/accounting/' + accountingRouteMap[entityType];
        } else if (salesRouteMap[entityType]) {
            route = '/sales/' + salesRouteMap[entityType];
        } else if (salaryRouteMap[entityType]) {
            route = '/salary/' + salaryRouteMap[entityType];
        } else if (timetrackingRouteMap[entityType]) {
            route = '/timetracking/' + timetrackingRouteMap[entityType];
        } else if (commonRouteMap[entityType]) {
            route = commonRouteMap[entityType];
        }

        if (!route) {
            route = '';
        }

        return route.replace(/:id/i, businessObject.EntityID.toString());
    }

}
