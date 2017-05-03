import {expect} from 'chai';
import {describe, it} from 'mocha';
import {Waiter} from '../src/app';

const waiter = new Waiter();
describe('waiter', () => {
    it('should have a save function', () => {
        expect(waiter.save).to.be.a('function');
    });
    it('also should have a saveMany function', () => {
        expect(waiter.saveMany).to.be.a('function');
    })
});