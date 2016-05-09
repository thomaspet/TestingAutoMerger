///<reference path="../../typings/main.d.ts"/>
import { describe, it, expect, beforeEachProviders, beforeEach, inject} from '@angular/core/testing';
import { MockBackend, MockConnection} from '@angular/http/testing';
import {provide} from '@angular/core';
import {Location} from '@angular/common';
import {Http, Response, BaseRequestOptions, ResponseOptions} from '@angular/http';
import {Router, ROUTER_PRIMARY_COMPONENT} from '@angular/router-deprecated';

import {App} from './app';
import {AuthService} from '../framework/core/authService';

//NOT PUBLIC ANGULAR PACKAGES
import {RouteRegistry} from '@angular/router-deprecated';
import { SpyLocation } from '@angular/common/testing';

describe('App', () => {
    beforeEachProviders(() => [
        //HOW TO INITIALIZE ROUTER
        RouteRegistry,
        provide(Location, {useClass: SpyLocation}),
        provide(ROUTER_PRIMARY_COMPONENT, {useValue: App}),
        provide(Router, {useClass: Router}),

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