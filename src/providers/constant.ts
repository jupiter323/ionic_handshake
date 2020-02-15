import { Injectable } from '@angular/core';


@Injectable()
export class ConstantProvider {

  constructor() {
  }
  getConstant() {
    let config = {
      debug_mode: true
    }
    return config;
  }
}
