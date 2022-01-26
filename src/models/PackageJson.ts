export interface PackageJson extends Record<string, any> {
  readonly name?: string;
  readonly version?: string;
  readonly author?: string | Record<string, string>;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly optionalDependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
  readonly license?: string;
  readonly private?: boolean;
}
