// __mocks__/@react-navigation/native.js
export const useNavigation = jest.fn(() => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  popToTop: jest.fn(),
}));

export const useRoute = jest.fn(() => ({
  params: {},
}));

export const NavigationContainer = jest.fn(({ children }) => children);
