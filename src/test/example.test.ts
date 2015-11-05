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

@Component({
    template: '',
    directives: [HeroesComponent]
})
class TestComponent {
}


describe('Heroes component', () => {

    beforeEachProviders(()=> [
        HeroService,
        provide('Router',Router)
    ]);

    it('should have heroes', injectAsync([TestComponentBuilder],(tbc) => {
        return tbc.overrideTemplate(TestComponent, '<my-heroes></my-heroes>')
            .createAsync(TestComponent).then((fixture)=>{
           fixture.detectChanges();
            var compiled = fixture.debugElement.nativeElement;
            expect(compiled).toBeDefined();
        });
    }));
});