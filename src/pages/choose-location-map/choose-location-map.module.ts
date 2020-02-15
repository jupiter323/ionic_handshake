import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {ChooseLocationMap} from './choose-location-map';

@NgModule({
    declarations: [
        ChooseLocationMap
    ],
    imports: [
        IonicPageModule.forChild(ChooseLocationMap),
    ],
})
export class ChooseLocationMapModule {
}
