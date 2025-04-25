import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import sinon from 'sinon';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';

describe('SharedStateManager', () => {
  let stateManager: SharedStateManager;
  
  beforeEach(() => {
    // Create a new state manager before each test
    stateManager = new SharedStateManager();
  });
  
  describe('getState and setState', () => {
    it('should store and retrieve simple values', () => {
      stateManager.setState('test.value', 42);
      expect(stateManager.getState('test.value')).to.equal(42);
      
      stateManager.setState('test.string', 'hello');
      expect(stateManager.getState('test.string')).to.equal('hello');
      
      stateManager.setState('test.boolean', true);
      expect(stateManager.getState('test.boolean')).to.be.true;
    });
    
    it('should store and retrieve nested objects', () => {
      stateManager.setState('user.profile', {
        name: 'Test User',
        age: 30,
        preferences: {
          theme: 'dark',
          notifications: true
        }
      });
      
      const profile = stateManager.getState('user.profile');
      expect(profile).to.deep.equal({
        name: 'Test User',
        age: 30,
        preferences: {
          theme: 'dark',
          notifications: true
        }
      });
      
      // Access nested properties
      expect(stateManager.getState('user.profile.name')).to.equal('Test User');
      expect(stateManager.getState('user.profile.preferences.theme')).to.equal('dark');
    });
    
    it('should return undefined for non-existent paths', () => {
      expect(stateManager.getState('nonexistent.path')).to.be.undefined;
      
      // Set a value and check a non-existent child path
      stateManager.setState('parent', { child1: 'value' });
      expect(stateManager.getState('parent.child2')).to.be.undefined;
    });
    
    it('should update existing values', () => {
      stateManager.setState('counter', 5);
      expect(stateManager.getState('counter')).to.equal(5);
      
      stateManager.setState('counter', 10);
      expect(stateManager.getState('counter')).to.equal(10);
    });
    
    it('should partially update objects', () => {
      stateManager.setState('user', {
        name: 'Original',
        age: 25,
        active: true
      });
      
      stateManager.setState('user.name', 'Updated');
      
      expect(stateManager.getState('user')).to.deep.equal({
        name: 'Updated',
        age: 25,
        active: true
      });
    });
    
    it('should create intermediate objects for deep paths', () => {
      stateManager.setState('very.deep.nested.value', 'found me');
      
      expect(stateManager.getState('very.deep.nested.value')).to.equal('found me');
      expect(stateManager.getState('very')).to.deep.equal({
        deep: {
          nested: {
            value: 'found me'
          }
        }
      });
    });
  });
  
  describe('watchState and unwatchState', () => {
    it('should notify watchers when state changes', () => {
      const callback = sinon.spy();
      
      stateManager.watchState('observed.value', callback);
      
      // Initial set should trigger callback
      stateManager.setState('observed.value', 1);
      expect(callback.calledOnce).to.be.true;
      expect(callback.firstCall.args[0]).to.equal(1);
      expect(callback.firstCall.args[1]).to.be.undefined; // initial value is undefined
      
      // Update should trigger callback with previous value
      stateManager.setState('observed.value', 2);
      expect(callback.calledTwice).to.be.true;
      expect(callback.secondCall.args[0]).to.equal(2);
      expect(callback.secondCall.args[1]).to.equal(1);
    });
    
    it('should watch nested properties', () => {
      const callback = sinon.spy();
      
      stateManager.setState('user', {
        profile: {
          name: 'Original'
        }
      });
      
      stateManager.watchState('user.profile.name', callback);
      
      // Update should trigger callback
      stateManager.setState('user.profile.name', 'Updated');
      expect(callback.calledOnce).to.be.true;
      expect(callback.firstCall.args[0]).to.equal('Updated');
      expect(callback.firstCall.args[1]).to.equal('Original');
    });
    
    it('should watch entire objects', () => {
      const callback = sinon.spy();
      
      stateManager.setState('user', {
        name: 'Original',
        age: 25
      });
      
      stateManager.watchState('user', callback);
      
      // Update entire object
      stateManager.setState('user', {
        name: 'Updated',
        age: 26
      });
      
      expect(callback.calledOnce).to.be.true;
      expect(callback.firstCall.args[0]).to.deep.equal({
        name: 'Updated',
        age: 26
      });
      
      // Update just one property
      stateManager.setState('user.name', 'Changed Again');
      
      expect(callback.calledTwice).to.be.true;
      expect(callback.secondCall.args[0]).to.deep.equal({
        name: 'Changed Again',
        age: 26
      });
    });
    
    it('should support multiple watchers for the same path', () => {
      const callback1 = sinon.spy();
      const callback2 = sinon.spy();
      
      stateManager.watchState('shared.value', callback1);
      stateManager.watchState('shared.value', callback2);
      
      stateManager.setState('shared.value', 'notify both');
      
      expect(callback1.calledOnce).to.be.true;
      expect(callback2.calledOnce).to.be.true;
    });
    
    it('should stop watching after unwatchState', () => {
      const callback = sinon.spy();
      
      stateManager.watchState('temp.value', callback);
      
      // First update should trigger callback
      stateManager.setState('temp.value', 1);
      expect(callback.calledOnce).to.be.true;
      
      // Unwatch
      stateManager.unwatchState('temp.value', callback);
      
      // Second update should not trigger callback
      stateManager.setState('temp.value', 2);
      expect(callback.calledOnce).to.be.true; // Still only called once
    });
  });
  
  describe('syncState', () => {
    it('should merge state from another source', () => {
      // Initial state
      stateManager.setState('local', {
        uniqueLocal: true,
        shared: {
          value1: 'local',
          onlyLocal: true
        }
      });
      
      // External state to sync
      const externalState = {
        shared: {
          value1: 'external', // Conflict
          value2: 'new',      // New value
        },
        onlyExternal: true    // New top-level property
      };
      
      // Sync with last-write-wins strategy
      stateManager.syncState(externalState, 'last-write-wins');
      
      // Check results
      expect(stateManager.getState('local.uniqueLocal')).to.be.true; // Unchanged
      expect(stateManager.getState('local.shared.value1')).to.equal('external'); // Overwritten
      expect(stateManager.getState('local.shared.value2')).to.equal('new'); // Added
      expect(stateManager.getState('local.shared.onlyLocal')).to.be.true; // Unchanged
      expect(stateManager.getState('onlyExternal')).to.be.true; // Added
    });
  });
  
  describe('resolveConflicts', () => {
    it('should resolve conflicts with last-write-wins strategy', () => {
      const localValue = { key: 'local value', timestamp: 100 };
      const externalValue = { key: 'external value', timestamp: 200 };
      
      const result = stateManager.resolveConflicts(
        localValue, 
        externalValue, 
        'last-write-wins'
      );
      
      // External value has newer timestamp, so it should win
      expect(result).to.deep.equal(externalValue);
    });
    
    it('should resolve conflicts with custom strategy', () => {
      const localValue = { count: 5 };
      const externalValue = { count: 10 };
      
      // Custom strategy that sums numeric values
      const customStrategy = (local: any, external: any) => {
        if (typeof local === 'number' && typeof external === 'number') {
          return local + external;
        }
        
        if (typeof local === 'object' && typeof external === 'object') {
          const result = { ...local };
          for (const key in external) {
            if (key in local && typeof local[key] === 'number' && typeof external[key] === 'number') {
              result[key] = local[key] + external[key];
            } else {
              result[key] = external[key];
            }
          }
          return result;
        }
        
        return external;
      };
      
      const result = stateManager.resolveConflicts(
        localValue, 
        externalValue, 
        customStrategy
      );
      
      // Should sum the counts
      expect(result).to.deep.equal({ count: 15 });
    });
  });
  
  describe('persistState and loadPersistedState', () => {
    it('should persist and load state', () => {
      // Set up initial state
      stateManager.setState('user.profile', {
        name: 'Test User',
        settings: { theme: 'dark' }
      });
      stateManager.setState('app.version', '1.0.0');
      
      // Persist specific paths
      stateManager.persistState('user.profile');
      stateManager.persistState('app.version');
      
      // Create a new state manager
      const newStateManager = new SharedStateManager();
      
      // Load the persisted state (normally this would load from storage)
      newStateManager.loadPersistedState(stateManager.getState());
      
      // Check that persisted values were loaded
      expect(newStateManager.getState('user.profile')).to.deep.equal({
        name: 'Test User',
        settings: { theme: 'dark' }
      });
      expect(newStateManager.getState('app.version')).to.equal('1.0.0');
    });
  });
  
  describe('clearEphemeralState', () => {
    it('should clear non-persisted state while keeping persisted state', () => {
      // Set up initial state with both persisted and ephemeral values
      stateManager.setState('persisted.value', 'keep me');
      stateManager.setState('ephemeral.value', 'clear me');
      
      // Mark one path as persisted
      stateManager.persistState('persisted.value');
      
      // Clear ephemeral state
      stateManager.clearEphemeralState();
      
      // Check results
      expect(stateManager.getState('persisted.value')).to.equal('keep me');
      expect(stateManager.getState('ephemeral.value')).to.be.undefined;
    });
  });
}); 