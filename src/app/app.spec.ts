///<reference path="../../typings/main.d.ts"/>
import { describe, it, expect, beforeEachProviders, beforeEach, inject} from 'angular2/testing';
import { MockBackend, MockConnection} from 'angular2/http/testing';
import {provide} from 'angular2/core';
import {Http, Response, BaseRequestOptions, ResponseOptions} from 'angular2/http';
import {Router, Location, ROUTER_PRIMARY_COMPONENT} from 'angular2/router';

import {App} from './app';
import {AuthService} from '../framework/authentication/authService';

//NOT PUBLIC ANGULAR PACKAGES
import {RouteRegistry} from 'angular2/src/router/route_registry';
import { SpyLocation } from 'angular2/src/mock/location_mock';
import {RootRouter} from 'angular2/src/router/router';

describe('App', () => {
    beforeEachProviders(() => [
        //HOW TO INITIALIZE ROUTER
        RouteRegistry,
        provide(Location, {useClass: SpyLocation}),
        provide(ROUTER_PRIMARY_COMPONENT, {useValue: App}),
        provide(Router, {useClass: RootRouter}),

        //HOW TO INITIALIZE HTTP SERVICE
        AuthService,
        BaseRequestOptions,
        MockBackend,
        provide(Http, {
            useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
                return new Http(backend, defaultOptions);
            },
            deps: [MockBackend, BaseRequestOptions]
        })
    ]);

    //HOW TO MOCK HTTP RESPONSE
    beforeEach(inject([MockBackend], (backend: MockBackend) => {
        const baseResponse = new Response(new ResponseOptions({body: 'got response'}));
        backend.connections.subscribe((c: MockConnection) => c.mockRespond(baseResponse));
    }));

    //TEST
    it('is initialized', inject([AuthService, Router], (authService: AuthService, router: Router) => {
        var app: App = new App(authService, router);
        expect(app.routes).toBeDefined();
    }));
});