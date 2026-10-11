import { describe, expect, it } from 'vitest';
import { createPostSchema } from './index';
describe('post contract', () => { it('requires a destination platform', () => { expect(() => createPostSchema.parse({caption:'hello',platforms:[]})).toThrow(); }); });
