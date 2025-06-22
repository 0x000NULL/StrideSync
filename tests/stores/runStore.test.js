import { useStore } from '../../src/stores/useStore';
import { act } from 'react-test-renderer';

// Reset store before each test
beforeEach(() => {
  act(() => {
    // A more robust way to reset the store to its initial state
    const initialState = useStore.getState();
    for (const key in initialState) {
      if (typeof initialState[key] === 'function') continue;
      initialState[key] = useStore.getInitialState()[key];
    }
    useStore.setState(initialState, true);
  });
});

describe('runStore actions', () => {
  it('should add a new run and give it a unique ID', () => {
    const initialRuns = useStore.getState().runs;
    expect(initialRuns).toHaveLength(0);

    const newRun = { distance: 5, duration: 1800, name: 'Morning Jog' };

    let runId;
    act(() => {
      runId = useStore.getState().addRun(newRun);
    });

    const runs = useStore.getState().runs;
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject(newRun);
    expect(runs[0].id).toBe(runId);
    expect(runs[0].createdAt).toBeDefined();
    expect(runs[0].updatedAt).toBeDefined();
  });

  it('should update an existing run', () => {
    let runId;
    act(() => {
      runId = useStore.getState().addRun({ distance: 10, duration: 3600 });
    });

    const updates = { distance: 11, notes: 'Felt great!' };
    act(() => {
      useStore.getState().updateRun(runId, updates);
    });

    const updatedRun = useStore.getState().runs.find(r => r.id === runId);
    expect(updatedRun.distance).toBe(11);
    expect(updatedRun.notes).toBe('Felt great!');
    expect(updatedRun.updatedAt).not.toBe(updatedRun.createdAt);
  });

  it('should not mutate other runs when updating', () => {
    let run1Id;
    let run2Id;
    act(() => {
      run1Id = useStore.getState().addRun({ distance: 5, name: 'Run 1' });
      run2Id = useStore.getState().addRun({ distance: 10, name: 'Run 2' });
    });

    const initialRun2 = useStore.getState().runs.find(r => r.id === run2Id);

    act(() => {
      useStore.getState().updateRun(run1Id, { name: 'Updated Run 1' });
    });

    const postUpdateRun2 = useStore.getState().runs.find(r => r.id === run2Id);
    expect(postUpdateRun2).toEqual(initialRun2);
  });

  it('should delete a run', () => {
    let run1Id;
    act(() => {
      run1Id = useStore.getState().addRun({ distance: 5 });
      useStore.getState().addRun({ distance: 10 });
    });

    expect(useStore.getState().runs).toHaveLength(2);

    act(() => {
      useStore.getState().deleteRun(run1Id);
    });

    const runs = useStore.getState().runs;
    expect(runs).toHaveLength(1);
    expect(runs.find(r => r.id === run1Id)).toBeUndefined();
  });

  it('should clear all runs', () => {
    act(() => {
      useStore.getState().addRun({ distance: 5 });
      useStore.getState().addRun({ distance: 10 });
    });

    expect(useStore.getState().runs).toHaveLength(2);

    act(() => {
      useStore.getState().clearAllRuns();
    });

    expect(useStore.getState().runs).toHaveLength(0);
  });
});
