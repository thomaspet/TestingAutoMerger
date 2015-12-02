import {Component, CORE_DIRECTIVES, FORM_DIRECTIVES, OnInit} from 'angular2/angular2';
import {Router} from 'angular2/router';
import {HeroService} from './hero.service';
import {HeroDetailComponent} from './hero-detail.component';
import {Hero} from './hero';
import {Routes} from '../../route.config';

@Component({
  selector: 'my-heroes',
  templateUrl: 'app/components/hero/heroes.component.html',
  styleUrls: ['app/components/hero/heroes.component.css'],
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, HeroDetailComponent]
})
export class HeroesComponent implements OnInit {
  public heroes: Hero[];
  public selectedHero: Hero;

  constructor(private _heroService: HeroService, private _router: Router) { }

  getHeroes() {
    this.selectedHero = undefined;
    this.heroes = [];

    this._heroService.getHeroes()
      .then((heroes: Hero[]) => this.heroes = heroes);

    return this.heroes;
  }

  isSelectedHero(hero: Hero) {
    return hero === this.selectedHero;
  }

  gotoDetail() {
    this._router.navigate([Routes.detail.name, { id: this.selectedHero.id }]);
  }

  ngOnInit() {
    this.heroes = this.getHeroes();
  }

  onSelect(hero: Hero) { this.selectedHero = hero; }
}
