// __mocks__/@react-navigation/stack.js
export const createStackNavigator = jest.fn(() => ({
  Navigator: jest.fn(({ children }) => children),
  Screen: jest.fn(({ children }) => children),
}));
