'use strict';

/*global console*/

import Person from './person';

export default class Developer extends Person {
  constructor(name, age, occupation='JavaScript Developer') {
    super(name, age);
    this.occupation = occupation;
  }

  sayWhoAmI() {
    console.log(this.getWhoAmI());
  }

  getWhoAmI() {
    return this.name + ' ' + this.occupation;
  }

}
