import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfPage } from './conf';

@NgModule({
  declarations: [
    ConfPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfPage),
  ],
})
export class ConfPageModule {}
