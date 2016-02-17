import {UniFieldBuilder} from './builders/uniFieldBuilder';
import {UniFieldsetBuilder} from './builders/uniFieldsetBuilder';
import {UniSectionBuilder} from './builders/uniSectionBuilder';
import {UniFormBuilder} from './builders/uniFormBuilder';
import {UniComboFieldBuilder} from './builders/uniComboFieldBuilder';

export type UniElementBuilder = UniFieldBuilder|UniFieldsetBuilder|UniSectionBuilder|UniComboFieldBuilder;
