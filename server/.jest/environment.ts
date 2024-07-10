// const { readFile } = require('fs').promises;
// const os = require('os');
// const path = require('path');
// const app = require('../src/app');
// const request = require('supertest');
// const puppeteer = require('puppeteer');
// const NodeEnvironment = require('jest-environment-node');

// const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');
// @ts-ignore

import { app } from '../src/app';
import NodeEnvironment from 'jest-environment-node';
// import dockerdatabase from './docker/docker-setup'

class CustomEnvironment extends NodeEnvironment {
  // constructor(config) {
  //   super(config);
  // }

  async setup() {
    await super.setup();

    // get the wsEndpoint
    // const wsEndpoint = await readFile(path.join(DIR, 'wsEndpoint'), 'utf8');
    // if (!wsEndpoint) {
    //   throw new Error('wsEndpoint not found');
    // }



    // // connect to puppeteer
    // this.global.__BROWSER_GLOBAL__ = JSON.parse(wsEndpoint);
    // this.global.__APP__ = 'app';
    // this.global.__SERVER__ = 'testServer';

    this.global.__SEQUELIZE__ = "sequelize in global env";
    console.log('app', app)
  }

  async teardown() {
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }
  // runScript(script) {
  //   return super.runScript(script);
  // }
}

module.exports = CustomEnvironment;
