import { useStore } from '../src/stores/useStore';
import { act } from '@testing-library/react-hooks';

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

describe('shoeStore actions', () => {
  it('should add a new shoe', () => {
    expect(useStore.getState().shoes).toHaveLength(0);

    const newShoeData = { brand: 'TestBrand', name: 'TestModel' };
    let newShoe;
    act(() => {
      newShoe = useStore.getState().addShoe(newShoeData);
    });

    const shoes = useStore.getState().shoes;
    expect(shoes).toHaveLength(1);
    expect(shoes[0]).toMatchObject(newShoeData);
    expect(shoes[0].id).toBe(newShoe.id);
    expect(shoes[0].isActive).toBe(true);
  });

  it('should update an existing shoe', () => {
    let shoe;
    act(() => {
      shoe = useStore.getState().addShoe({ brand: 'Brand', name: 'Model' });
    });

    const updates = { name: 'NewModel', maxDistance: 500 };
    act(() => {
      useStore.getState().updateShoe(shoe.id, updates);
    });

    const updatedShoe = useStore.getState().shoes.find((s) => s.id === shoe.id);
    expect(updatedShoe.name).toBe('NewModel');
    expect(updatedShoe.maxDistance).toBe(500);
  });

  it('should retire and un-retire a shoe', () => {
    let shoe;
    act(() => {
      shoe = useStore.getState().addShoe({ brand: 'Brand', name: 'Model' });
    });

    // Retire the shoe
    act(() => {
      useStore.getState().retireShoe(shoe.id, 'Reached mileage limit');
    });

    let retiredShoe = useStore.getState().shoes.find((s) => s.id === shoe.id);
    expect(retiredShoe.isActive).toBe(false);
    expect(retiredShoe.retirementDate).toBeDefined();
    expect(retiredShoe.retirementReason).toBe('Reached mileage limit');

    // Un-retire the shoe
    act(() => {
      useStore.getState().unretireShoe(shoe.id);
    });

    let unretiredShoe = useStore.getState().shoes.find((s) => s.id === shoe.id);
    expect(unretiredShoe.isActive).toBe(true);
    expect(unretiredShoe.retirementDate).toBeNull();
    expect(unretiredShoe.retirementReason).toBeNull();
  });

  it('should delete a shoe and its usage data', () => {
    let shoe;
    act(() => {
      shoe = useStore.getState().addShoe({ brand: 'ToDelete' });
      // Add some usage data
      useStore.setState({ shoeUsage: { [shoe.id]: { total: 100 } } });
    });

    expect(useStore.getState().shoes).toHaveLength(1);
    expect(useStore.getState().shoeUsage[shoe.id]).toBeDefined();

    act(() => {
      useStore.getState().deleteShoe(shoe.id);
    });

    expect(useStore.getState().shoes).toHaveLength(0);
    expect(useStore.getState().shoeUsage[shoe.id]).toBeUndefined();
  });

  it('should update shoe mileage and usage when a run is added', () => {
    let shoe;
    act(() => {
      shoe = useStore.getState().addShoe({ brand: 'Nike', name: 'Pegasus' });
    });

    const run = { shoeId: shoe.id, distance: 10, startTime: new Date().toISOString() };

    act(() => {
      useStore.getState().updateShoeMileage(run);
    });

    const shoeUsage = useStore.getState().shoeUsage[shoe.id];
    expect(shoeUsage.total).toBe(10);
    expect(shoeUsage.lastUsed).toBeDefined();
  });
}); 