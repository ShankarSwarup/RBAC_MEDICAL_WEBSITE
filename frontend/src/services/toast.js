const listeners = new Set();

export const toast = {
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  show(message, type = 'info') {
    const id = Math.random().toString(36).substring(2, 9);
    listeners.forEach((callback) => callback({ message, type, id }));
  },
  success(message) {
    this.show(message, 'success');
  },
  error(message) {
    this.show(message, 'error');
  },
  info(message) {
    this.show(message, 'info');
  }
};
