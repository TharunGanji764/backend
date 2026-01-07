export interface Hash {
  hash(key: any, saltRounds: number): Promise<string>;
  compare(key: string, hashedKey: string): Promise<boolean>;
}
