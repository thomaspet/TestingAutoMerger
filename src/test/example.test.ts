import {
    iit,
    it,
    ddescribe,
    describe,
    expect,
    inject,
    injectAsync,
    TestComponentBuilder,
    beforeEachProviders,
    fakeAsync,
    tick
} from 'angular2/testing';

import { Component, provide } from 'angular2/angular2';
import {Router} from 'angular2/router';
import { HeroesComponent } from '../app/components/hero/heroes.component';
import { HeroService } from '../app/components/hero/hero.service';
import {RouteRegistry} from "../../node_modules/angular2/src/router/route_registry";

describe('Heroes component', () => {

    beforeEachProviders(()=> [
        HeroService,
        provide(Router,{useFactory: () => Router })
    ]);

    it('should have heroes', injectAsync([TestComponentBuilder],(tbc) => {
        return tbc.createAsync(HeroesComponent).then((fixture)=>{
               fixture.detectChanges();
                var component = fixture.debugElement.componentInstance;
                expect(component.getHeroes).toBeDefined();
            });
    }));
});