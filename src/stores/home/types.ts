export type THomeStore = {
  selectedHomeId: string | null;
};

export type THomeStoreState = THomeStore & {
  setSelectedHomeId: (id: string) => void;
};
