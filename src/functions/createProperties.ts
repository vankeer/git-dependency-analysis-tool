export function createProperties(properties: Record<string, any>): string {
  return Object.keys(properties).map(property => `${property}: $${property}`).join(', ');
}
