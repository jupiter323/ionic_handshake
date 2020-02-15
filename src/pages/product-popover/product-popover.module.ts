import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {ProductPopoverPage} from './product-popover';

@NgModule({
  declarations: [
    ProductPopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(ProductPopoverPage),
  ],
  exports: [
    ProductPopoverPage
  ]
})
export class PopoverPageModule {}
