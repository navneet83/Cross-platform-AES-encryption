'use strict';

/*global console*/

export default class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  sayName() {
    console.log(this.name);
  }

  getName() {
    return this.name;
  }

  getAge() {
    return this.age;
  }
}
