import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';

// Simple spy implementation for tests
function createSpy() {
  const calls: any[][] = [];
  const spy = function(...args: any[]) {
    calls.push(args);
  } as any;
  spy.calledOnce = calls.length === 1;
  spy.calledTwice = calls.length === 2;
  spy.firstCall = { args: calls[0] || [] };
  spy.secondCall = { args: calls[1] || [] };
  spy.called = calls.length > 0;
  return spy;
}

describe('SharedStateManager', () => {
  let stateManager: SharedStateManager;
  
  beforeEach(() => {
    // Create a new state manager before each test
    stateManager = new SharedStateManager();
  });
  
  describe('getState and setState', () => {
    it('should store and retrieve simple values', async () => {
      await stateManager.setState('test.value', 42);
      expect(await stateManager.getState('test.value')).to.equal(42);
      
      await stateManager.setState('test.string', 'hello');
      expect(await stateManager.getState('test.string')).to.equal('hello');
      
      await stateManager.setState('test.boolean', true);
      expect(await stateManager.getState('test.boolean')).to.be.true;
    });
    
    it('should store and retrieve nested objects', async () => {
      await stateManager.setState('user.profile', {
        name: 'Test User',
        age: 30,
        preferences: {
          theme: 'dark',
          notifications: true
        }
      });
      
      const profile = await stateManager.getState('user.profile');
      expect(profile).to.deep.equal({
        name: 'Test User',
        age: 30,
        preferences: {
          theme: 'dark',
          notifications: true
        }
      });
      
      // Access nested properties
      expect(await stateManager.getState('user.profile.name')).to.equal('Test User');
      expect(await stateManager.getState('user.profile.preferences.theme')).to.equal('dark');
    });
    
    it('should return undefined for non-existent paths', async () => {
      expect(await stateManager.getState('nonexistent.path')).to.be.undefined;
      
      // Set a value and check a non-existent child path
      await stateManager.setState('parent', { child1: 'value' });
      expect(await stateManager.getState('parent.child2')).to.be.undefined;
    });
    
    it('should update existing values', async () => {
      await stateManager.setState('counter', 5);
      expect(await stateManager.getState('counter')).to.equal(5);
      
      await stateManager.setState('counter', 10);
      expect(await stateManager.getState('counter')).to.equal(10);
    });
    
    it('should partially update objects', async () => {
      await stateManager.setState('user', {
        name: 'Original',
        age: 25,
        active: true
      });
      
      await stateManager.setState('user.name', 'Updated');
      
      expect(await stateManager.getState('user')).to.deep.equal({
        name: 'Updated',
        age: 25,
        active: true
      });
    });
    
    it('should create intermediate objects for deep paths', async () => {
      await stateManager.setState('very.deep.nested.value', 'found me');
      
      expect(await stateManager.getState('very.deep.nested.value')).to.equal('found me');
      expect(await stateManager.getState('very')).to.deep.equal({
        deep: {
          nested: {
            value: 'found me'
          }
        }
      });
    });
  });
  
  describe('watchState and unwatchState', () => {
    it('should notify watchers when state changes', async () => {
      const callback = createSpy();
      
      stateManager.watchState('observed.value', callback);
      
      // Initial set should trigger callback
      await stateManager.setState('observed.value', 1);
      expect(callback.calledOnce).to.be.true;
      expect(callback.firstCall.args[0]).to.equal('observed.value'); // path is first arg
      expect(callback.firstCall.args[1]).to.equal(1); // newValue is second arg
      
      // Update should trigger callback
      await stateManager.setState('observed.value', 2);
      expect(callback.calledTwice).to.be.true;
      expect(callback.secondCall.args[0]).to.equal('observed.value'); // path
      expect(callback.secondCall.args[1]).to.equal(2); // newValue
    });
    
    it('should watch nested properties', async () => {
      const callback = createSpy();
      
      await stateManager.setState('user', {
        profile: {
          name: 'Original'
        }
      });
      
      stateManager.watchState('user.profile.name', callback);
      
      // Update should trigger callback
      await stateManager.setState('user.profile.name', 'Updated');
      expect(callback.calledOnce).to.be.true;
      expect(callback.firstCall.args[0]).to.equal('user.profile.name'); // path
      expect(callback.firstCall.args[1]).to.equal('Updated'); // newValue
    });
    
    it('should watch entire objects', async () => {
      const callback = createSpy();
      
      await stateManager.setState('user', {
        name: 'Original',
        age: 25
      });
      
      stateManager.watchState('user', callback);
      
      // Update entire object
      await stateManager.setState('user', {
        name: 'Updated',
        age: 26
      });
      
      expect(callback.calledOnce).to.be.true;
      expect(callback.firstCall.args[0]).to.equal('user'); // path
      expect(callback.firstCall.args[1]).to.deep.equal({
        name: 'Updated',
        age: 26
      });
      
      // Update just one property
      await stateManager.setState('user.name', 'Changed Again');
      
      expect(callback.calledTwice).to.be.true;
      expect(callback.secondCall.args[0]).to.equal('user.name'); // path
      const userState = await stateManager.getState('user');
      expect(userState).to.deep.equal({
        name: 'Changed Again',
        age: 26
      });
    });
    
    it('should support multiple watchers for the same path', async () => {
      const callback1 = createSpy();
      const callback2 = createSpy();
      
      stateManager.watchState('shared.value', callback1);
      stateManager.watchState('shared.value', callback2);
      
      await stateManager.setState('shared.value', 'notify both');
      
      expect(callback1.calledOnce).to.be.true;
      expect(callback2.calledOnce).to.be.true;
    });
    
    it('should stop watching after unwatchState', async () => {
      const callback = createSpy();
      
      stateManager.watchState('temp.value', callback);
      
      // First update should trigger callback
      await stateManager.setState('temp.value', 1);
      expect(callback.calledOnce).to.be.true;
      
      // Unwatch
      stateManager.unwatchState('temp.value', callback);
      
      // Second update should not trigger callback
      await stateManager.setState('temp.value', 2);
      expect(callback.calledOnce).to.be.true; // Still only called once
    });
  });
  
  describe('syncState', () => {
    it('should merge state from another source', async () => {
      // Initial state
      await stateManager.setState('local', {
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
      expect(await stateManager.getState('local.uniqueLocal')).to.be.true; // Unchanged
      expect(await stateManager.getState('shared.value1')).to.equal('external'); // Overwritten
      expect(await stateManager.getState('shared.value2')).to.equal('new'); // Added
      expect(await stateManager.getState('onlyExternal')).to.be.true; // Added
    });
    
    it('should merge state with merge strategy', async () => {
      await stateManager.setState('user', {
        name: 'John',
        age: 30
      });
      
      const externalState = {
        user: {
          name: 'John',
          age: 31,
          email: 'john@example.com'
        }
      };
      
      stateManager.syncState(externalState, 'merge');
      
      const user = await stateManager.getState('user');
      expect(user).to.deep.equal({
        name: 'John',
        age: 31,
        email: 'john@example.com'
      });
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
      
      // External value should win with last-write-wins
      expect(result).to.deep.equal(externalValue);
    });
    
    it('should resolve conflicts with merge strategy', () => {
      const localValue = { name: 'John', age: 30 };
      const externalValue = { name: 'John', age: 31, email: 'john@example.com' };
      
      const result = stateManager.resolveConflicts(
        localValue,
        externalValue,
        'merge'
      );
      
      expect(result).to.deep.equal({
        name: 'John',
        age: 31,
        email: 'john@example.com'
      });
    });
    
    it('should resolve conflicts with custom strategy', () => {
      const localValue = { count: 5 };
      const externalValue = { count: 10 };
      
      // Custom strategy that sums numeric values
      const customStrategy = (local: any, external: any) => {
        if (typeof local === 'number' && typeof external === 'number') {
          return local + external;
        }
        
        if (typeof local === 'object' && typeof external === 'object' && local !== null && external !== null) {
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
    it('should persist and load state', async () => {
      // Set up initial state
      await stateManager.setState('user.profile', {
        name: 'Test User',
        settings: { theme: 'dark' }
      });
      await stateManager.setState('app.version', '1.0.0');
      
      // Persist specific paths
      stateManager.persistState('user.profile');
      stateManager.persistState('app.version');
      
      // Create a new state manager
      const newStateManager = new SharedStateManager();
      
      // Load the persisted state (normally this would load from storage)
      newStateManager.loadPersistedState(stateManager.getFullState());
      
      // Check that persisted values were loaded
      expect(await newStateManager.getState('user.profile')).to.deep.equal({
        name: 'Test User',
        settings: { theme: 'dark' }
      });
      expect(await newStateManager.getState('app.version')).to.equal('1.0.0');
    });
  });
  
  describe('clearEphemeralState', () => {
    it('should clear non-persisted state while keeping persisted state', async () => {
      // Set up initial state with both persisted and ephemeral values
      await stateManager.setState('persisted.value', 'keep me');
      await stateManager.setState('ephemeral.value', 'clear me');
      
      // Mark one path as persisted
      stateManager.persistState('persisted.value');
      
      // Clear ephemeral state
      stateManager.clearEphemeralState();
      
      // Check results
      expect(await stateManager.getState('persisted.value')).to.equal('keep me');
      expect(await stateManager.getState('ephemeral.value')).to.be.undefined;
    });
  });
}); 